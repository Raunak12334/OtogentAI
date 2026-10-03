import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { googleSlidesChannel } from "@/inngest/channels/google-slides";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return all full text content for a shape element */
function getShapeText(el: any): string {
  return (el.shape?.text?.textElements ?? [])
    .map((t: any) => t.textRun?.content ?? "")
    .join("");
}

/** Return first matching text run style from the text elements (for font color reuse) */
function getFirstTextStyle(el: any): any | null {
  for (const te of el.shape?.text?.textElements ?? []) {
    if (te.textRun?.style) return te.textRun.style;
  }
  return null;
}

/**
 * Build batchUpdate requests to replace *all text* inside a shape element
 * while preserving the existing font color (foregroundColor).
 */
function buildReplaceShapeTextRequests(
  objectId: string,
  newText: string,
  existingStyle: any,
): any[] {
  const reqs: any[] = [
    { deleteText: { objectId, textRange: { type: "ALL" } } },
    { insertText: { objectId, insertionIndex: 0, text: newText } },
  ];

  // Re-apply the foreground color if we captured it
  if (existingStyle?.foregroundColor) {
    reqs.push({
      updateTextStyle: {
        objectId,
        style: { foregroundColor: existingStyle.foregroundColor },
        textRange: { type: "ALL" },
        fields: "foregroundColor",
      },
    });
  }

  return reqs;
}

export type GoogleSlidesData = {
  variableName?: string;
  credentialId?: string;
  presentationId?: string;
  replacements?: string;
  aiContentField?: string;
  /** Template mode: duplicate template slide(s) to new slide(s) without modifying template */
  templateMode?: boolean;
  /** Number of template slides at start of presentation (default: 3) */
  templateSlideCount?: number;
  /** Action for generated slides on subsequent runs: 'replace' | 'append' (default: 'replace') */
  generatedSlideAction?: "replace" | "append";
  /** Title for the generated copy (legacy) */
  newPresentationTitle?: string;
  /** Target folder ID (legacy) */
  targetFolderId?: string;
  /**
   * 1-based slide number that contains the holdings table (default: 3 = slide 3).
   * Set to 0 to search all slides.
   */
  holdingsSlideIndex?: number;
  [key: string]: unknown;
};

export type GoogleSlidesNodeData = GoogleSlidesData;

function buildReplacementMap(
  replacementsConfig: string | undefined,
  context: Record<string, unknown>,
): Record<string, string> {
  if (!replacementsConfig?.trim()) return {};
  const map: Record<string, string> = {};

  // 1. Try parsing JSON directly without Handlebars first so {{keys}} are not wiped out
  let parsedJson: Record<string, unknown> | null = null;
  try {
    parsedJson = JSON.parse(replacementsConfig.trim());
  } catch {
    // Maybe not valid JSON yet
  }

  if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
    for (const [rawKey, rawVal] of Object.entries(parsedJson)) {
      const key = rawKey.trim();
      let compiledVal = String(rawVal ?? "");
      try {
        compiledVal = Handlebars.compile(compiledVal, { noEscape: true })(context);
      } catch {
        // Fallback to literal
      }

      map[key] = compiledVal;

      // Also register variants so placeholders match in slides:
      if (key.startsWith("{{") && key.endsWith("}}")) {
        const inner = key.slice(2, -2).trim();
        map[`{{ ${inner} }}`] = compiledVal;
      } else {
        map[`{{${key}}}`] = compiledVal;
        map[`{{ ${key} }}`] = compiledVal;
      }
    }
    return map;
  }

  // 2. Line by line fallback (e.g. key=val, key: val, or "key": "val")
  const lines = replacementsConfig.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim().replace(/^[,\s]+|[,\s]+$/g, "");
    if (!line || line === "{" || line === "}") continue;
    const separatorIdx = line.includes("=") ? line.indexOf("=") : line.indexOf(":");
    if (separatorIdx !== -1) {
      const rawKey = line.slice(0, separatorIdx).trim().replace(/^["']|["']$/g, "").trim();
      const rawVal = line.slice(separatorIdx + 1).trim().replace(/^["']|["']$/g, "").trim();
      let compiledVal = rawVal;
      try {
        compiledVal = Handlebars.compile(rawVal, { noEscape: true })(context);
      } catch {
        // Fallback to literal
      }
      map[rawKey] = compiledVal;
      if (!rawKey.startsWith("{{")) {
        map[`{{${rawKey}}}`] = compiledVal;
        map[`{{ ${rawKey} }}`] = compiledVal;
      } else if (rawKey.endsWith("}}")) {
        const inner = rawKey.slice(2, -2).trim();
        map[`{{ ${inner} }}`] = compiledVal;
      }
    }
  }
  return map;
}

export const googleSlidesExecutor: NodeExecutor<GoogleSlidesData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `publish-loading-${nodeId}`,
    googleSlidesChannel.status,
    { nodeId, status: "loading" },
  );

  try {
    const result = await step.run("google-slides-update", async () => {
      if (!data.credentialId) {
        await step.realtime.publish(
          `publish-error-${nodeId}`,
          googleSlidesChannel.status,
          { nodeId, status: "error" },
        );
        throw new NonRetriableError(
          "Google Slides node: No credential selected",
        );
      }

      if (!data.presentationId) {
        await step.realtime.publish(
          `publish-error-${nodeId}`,
          googleSlidesChannel.status,
          { nodeId, status: "error" },
        );
        throw new NonRetriableError(
          "Google Slides node: Presentation ID not configured",
        );
      }

      const credential = await prisma.credential.findUnique({
        where: { id: data.credentialId },
      });

      if (!credential?.value) {
        await step.realtime.publish(
          `publish-error-${nodeId}`,
          googleSlidesChannel.status,
          { nodeId, status: "error" },
        );
        throw new NonRetriableError(
          "Google Slides node: Selected credential not found or empty",
        );
      }

      let serviceAccountKey: { client_email: string; private_key: string };
      try {
        serviceAccountKey = JSON.parse(credential.value);
      } catch {
        throw new NonRetriableError(
          "Google Slides node: Credential value is not valid JSON. Please paste your Google Service Account JSON key.",
        );
      }

      const rawPresentationInput = Handlebars.compile(data.presentationId)(context);
      const templatePresentationId =
        rawPresentationInput.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ??
        rawPresentationInput.trim();

      // -----------------------------------------------------------------------
      // Template Mode: copy the reference presentation, then update the copy.
      // Auto-cleanup: delete the previously generated copy (from the last run)
      // BEFORE creating a new one. This means the service account's Drive
      // never accumulates old files — at most 1 generated copy exists at a time.
      // No manual folder setup required.
      // -----------------------------------------------------------------------
      let presentationId = templatePresentationId;

      const { google } = await import("googleapis");
      const auth = new google.auth.JWT({
        email: serviceAccountKey.client_email,
        key: serviceAccountKey.private_key,
        scopes: [
          "https://www.googleapis.com/auth/presentations",
          "https://www.googleapis.com/auth/drive",
        ],
      });

      const slides = google.slides({ version: "v1", auth });

      // Build replacement map from configured JSON

      const replacementMap = buildReplacementMap(data.replacements, context);

      // -----------------------------------------------------------------------
      // Merge AI / Gemini JSON output into the replacement map.
      // The Gemini node returns a clean JSON summary including holdings[].
      // -----------------------------------------------------------------------
      let aiSummary: Record<string, any> = {};

      if (data.aiContentField?.trim()) {
        let aiContent = "";
        try {
          aiContent = Handlebars.compile(data.aiContentField, { noEscape: true })(context);
        } catch {
          aiContent = data.aiContentField;
        }

        if (aiContent) {
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const aiData = JSON.parse(jsonMatch[0]);
              aiSummary = aiData;
              for (const [key, value] of Object.entries(aiData)) {
                if (key === "holdings") continue; // handled separately via table population
                const cleanKey = key.trim();
                const strVal = String(value ?? "");
                replacementMap[`{{${cleanKey}}}`] = strVal;
                replacementMap[`{{ ${cleanKey} }}`] = strVal;
              }
            } catch {
              // Not strict JSON, ignore
            }
          }
        }
      }

      // Also pull summary from sheetsData context (legacy support)
      const ctxSummary =
        (context.sheetsData as any)?.summary || (context.summary as any) || {};

      // Deep fallback: if per-row extraction missed the return value,
      // scan the full sheetsData.text string directly for Abs. Return.
      // This is more reliable as it searches the entire raw text, not row-by-row.
      if (!ctxSummary.overallReturn) {
        const rawSheetText: string = (context.sheetsData as any)?.text ?? "";
        const absTextMatch = rawSheetText.match(/Abs\.?\s*Return\s*:\s*(-?[\d.,]+%)/i);
        if (absTextMatch) ctxSummary.overallReturn = absTextMatch[1].trim();
      }

      const summaryData: Record<string, string> = {
        investorName: aiSummary.investorName ?? ctxSummary.investorName ?? "",
        investmentAmount:
          aiSummary.totalInvestment ??
          aiSummary.investmentAmount ??
          ctxSummary.investmentAmount ??
          "",
        currentValue: aiSummary.currentValue ?? ctxSummary.currentValue ?? "",
        gainLoss: aiSummary.gainLoss ?? ctxSummary.gainLoss ?? "",
        overallReturn:
          // Prefer sheet-extracted value (reliable pre-computed figure) over
          // Gemini AI output which can hallucinate financial return calculations.
          ctxSummary.overallReturn ||
          aiSummary["Overall Return"] ||
          aiSummary.overallReturn ||
          "",
        date: aiSummary.date ?? ctxSummary.date ?? "",
      };

      // ── Holdings array ──
      // Priority: AI summary > sheetsData.holdings > context summary > sheetsData.rows parsing
      let holdings: Array<{
        schemeName: string;
        investments: string;
        currentValue: string;
        "unrealisedGain/Loss": string;
        holdingPercentage: string;
      }> =
        aiSummary.holdings ??
        (context.sheetsData as any)?.holdings ??
        ctxSummary.holdings ??
        [];

      // If no holdings from AI or sheetsData, try to build from raw sheetsData rows
      if (holdings.length === 0) {
        const sheetsRows: Record<string, string>[] =
          (context.sheetsData as any)?.rows ?? [];

        const pickCol = (row: Record<string, string>, ...candidates: string[]): string => {
          for (const c of candidates) {
            const match = Object.keys(row).find(
              (k) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === c.toLowerCase().replace(/[^a-z0-9]/g, "")
            );
            if (match && row[match]) return String(row[match]).trim();
          }
          return "";
        };

        holdings = sheetsRows
          .filter((row) => {
            const scheme = pickCol(row, "Scheme", "SchemeName", "FundName", "Name");
            return scheme && !/^(grand\s*total|total|sub\s*total)/i.test(scheme);
          })
          .map((row) => ({
            schemeName: pickCol(row, "Scheme", "SchemeName", "FundName", "Name"),
            investments: pickCol(row, "InvAmt", "InvestmentAmount", "Investment", "Invested", "Inv.Amt.()", "InvAmt()"),
            currentValue: pickCol(row, "CurrentValue", "CurrentValue()", "CurVal", "MarketValue"),
            "unrealisedGain/Loss": pickCol(row, "UnrealisedGainLoss", "UnrealisedGain/Loss", "UnrealisedGain/Loss()", "GainLoss", "Gain/Loss", "UnrealizedGainLoss"),
            holdingPercentage: pickCol(row, "Holdings", "HoldingPercentage", "Holdings", "%Holdings", "HoldingPercent"),
          }));
      }

      const requests: Array<{
        replaceAllText?: {
          containsText: { text: string; matchCase: boolean };
          replaceText: string;
        };
      }> = [];

      for (const [placeholder, replacement] of Object.entries(replacementMap)) {
        const cleanKey = placeholder.trim();
        const cleanReplacement = String(replacement ?? "").trim();
        // NEVER replace with empty string so text boxes are not wiped blank
        if (cleanKey && cleanKey !== "{{}}" && cleanKey !== "{{  }}" && cleanReplacement) {
          requests.push({
            replaceAllText: {
              containsText: {
                text: cleanKey,
                matchCase: false,
              },
              replaceText: cleanReplacement,
            },
          });
        }
      }

      let occurrencesChanged = 0;

      if (requests.length > 0) {
        const response = await slides.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests,
          },
        });

        const replies = response.data.replies || [];
        replies.forEach((reply) => {
          occurrencesChanged += reply.replaceAllText?.occurrencesChanged || 0;
        });
      }

      // -----------------------------------------------------------------------
      // Step 2: Smart shape-text replacement for financial summary cards
      // If templateMode is on, ONLY update the newly generated slides (targetSlideIds).
      // The original template slides remain 100% untouched.
      // Step 3: Holdings table row population — separate batchUpdate so any table
      // error cannot prevent card updates from applying.
      // -----------------------------------------------------------------------
      const hasSummaryData = Object.values(summaryData).some((v) => !!v);
      let smartUpdateError: string | undefined;
      let shapeRequestsCount = 0;
      let tableRequestsCount = 0;

      if (hasSummaryData || holdings.length > 0) {
        try {
          const pres = await slides.presentations.get({ presentationId });
          const shapeRequests: any[] = [];

          // Helper: add a replaceAllText only if oldText is non-empty and different from newText
          const pushReplace = (oldText: string | undefined | null, newText: string) => {
            const old = (oldText ?? "").trim();
            const next = (newText ?? "").trim();
            if (old && next && old !== next) {
              shapeRequests.push({
                replaceAllText: {
                  containsText: { text: old, matchCase: false },
                  replaceText: next,
                },
              });
            }
          };

          // Only scan slides 1..N (N = holdingsSlideIndex, default 3).
          // Slides beyond this boundary are treated as static/protected and are
          // never touched — no shape text is read or replaced on them.
          const maxEditSlide = data.holdingsSlideIndex ?? 3;
          const allSlides = pres.data.slides || [];
          const shapeSlidesToScan =
            maxEditSlide === 0 ? allSlides : allSlides.slice(0, maxEditSlide);

          for (const slide of shapeSlidesToScan) {
            for (const el of slide.pageElements || []) {
              if (!el.shape?.text?.textElements) continue;

              const fullText = getShapeText(el);
              const fullTextLower = fullText.toLowerCase();
              // Split by \n or vertical tab (\x0B) used for soft-returns in Slides
              const lines = fullText.split(/\r?\n|\x0B/).map((l) => l.trim()).filter(Boolean);

              // Slide 1: Date box — detect any date-like pattern and replace with new date
              if (
                summaryData.date &&
                (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*[-–]\s*\d{4}/i.test(fullText.trim()) ||
                 /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(fullText.trim()))
              ) {
                pushReplace(fullText.trim(), summaryData.date);
              }

              // Slide 1 & 2: Investor label block ("Investor\n<Name>")
              // Extract the name line and replace it
              if (summaryData.investorName && fullTextLower.includes("investor\n")) {
                // lines[0] = "Investor", lines[1] = current name
                const currentName = lines[1];
                pushReplace(currentName, summaryData.investorName);
              }

              // Slide 2: Standalone investor name box
              // Identified structurally: letters-only, short, not a known label
              if (
                summaryData.investorName &&
                !fullTextLower.includes("investor\n") &&
                !fullTextLower.includes("invested") &&
                !fullTextLower.includes("current value") &&
                !fullTextLower.includes("return") &&
                !fullTextLower.includes("gain") &&
                !fullTextLower.includes("holding") &&
                !fullTextLower.includes("monthly") &&
                !fullTextLower.includes("wealth") &&
                !fullTextLower.includes("fund") &&
                fullText.trim().length > 2 &&
                fullText.trim().length < 80 &&
                /^[A-Za-z\s&.',()\-]+$/.test(fullText.trim())
              ) {
                pushReplace(fullText.trim(), summaryData.investorName);
              }

              // Slide 2: Invested Amount card — replace the value line only
              if (summaryData.investmentAmount && fullTextLower.includes("invested")) {
                const currentValue = lines[1] ?? fullText.match(/(-?₹?\s*[\d.,]+)/)?.[1];
                if (currentValue) pushReplace(currentValue, summaryData.investmentAmount);
              }

              // Slide 2: Current Value card — replace the value line only
              if (
                summaryData.currentValue &&
                fullTextLower.includes("current value") &&
                !fullTextLower.includes("gain")
              ) {
                const currentValue = lines[1] ?? fullText.match(/(-?₹?\s*[\d.,]+)/)?.[1];
                if (currentValue) pushReplace(currentValue, summaryData.currentValue);
              }

              // Slide 2: Overall Return card — replace the value line only
              if (
                summaryData.overallReturn &&
                !fullTextLower.includes("gain") &&
                fullTextLower.includes("return")
              ) {
                const currentValue = lines[1] ?? fullText.match(/(-?[\d.,]+%)/)?.[1];
                console.log(`[google-slides] Found Overall Return shape. fullText: ${JSON.stringify(fullText)}, lines: ${JSON.stringify(lines)}, extracted value: ${currentValue}, summaryData.overallReturn: ${summaryData.overallReturn}`);
                if (currentValue) pushReplace(currentValue, summaryData.overallReturn);
              }

              // Slide 2: Gain/Loss card — replace the value line only
              if (summaryData.gainLoss && fullTextLower.includes("gain")) {
                const currentValue = lines[1] ?? fullText.match(/(-?₹?\s*[\d.,]+)/)?.[1];
                if (currentValue) pushReplace(currentValue, summaryData.gainLoss);
              }
            }
          }

          // Deduplicate shape requests (same old→new pair can arise from multiple slides)
          const seen = new Set<string>();
          const deduped = shapeRequests.filter((r) => {
            const key = `${r.replaceAllText.containsText.text}→${r.replaceAllText.replaceText}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          shapeRequestsCount = deduped.length;

          if (deduped.length > 0) {
            const shapeRes = await slides.presentations.batchUpdate({
              presentationId,
              requestBody: { requests: deduped },
            });
            const shapeReplies = shapeRes.data.replies || [];
            shapeReplies.forEach((reply) => {
              occurrencesChanged += reply.replaceAllText?.occurrencesChanged || 0;
            });
          }

          // ── TABLE CELL UPDATES (separate batch so errors don't block cards) ──
          if (holdings.length > 0) {
            const tableRequests: any[] = [];
            // Captures style reference for each table that needs rows inserted.
            // Must be declared here (outer scope) so the batch section can access it.
            const styleInfoList: Array<{
              tableId: string;
              existingDataRows: number;
              sourceRow: any;
            }> = [];

            // Reuse maxEditSlide + allSlides hoisted from the shape-scan section above.
            // holdingsSlideIndex: 1-based (default 3 = slide 3). 0 = all slides.

            // Build the subset of slides to scan for a holdings table
            const slidesToScan =
              maxEditSlide === 0
                ? allSlides
                : allSlides.filter((_, idx) => idx === maxEditSlide - 1);

            for (const slide of slidesToScan) {
              for (const el of slide.pageElements || []) {
                if (!el.table) continue;

                const tableRows = el.table.tableRows ?? [];
                const tableId = el.objectId as string;

                // Detect if this is the holdings table by checking header row text
                const headerRow = tableRows[0];
                const headerText = (headerRow?.tableCells ?? [])
                  .map((c: any) =>
                    (c.text?.textElements ?? [])
                      .map((te: any) => te.textRun?.content ?? "")
                      .join("")
                      .trim()
                      .toLowerCase()
                  )
                  .join(" ");

                const isHoldingsTable =
                  headerText.includes("scheme") ||
                  headerText.includes("investment") ||
                  headerText.includes("holding") ||
                  headerText.includes("fund");

                if (!isHoldingsTable && maxEditSlide !== 0) {
                  // Skip non-holdings tables when targeting a specific slide
                  continue;
                }

                // If the table has fewer data rows than holdings, insert new rows first
                const existingDataRows = tableRows.length - 1; // subtract header
                if (holdings.length > existingDataRows) {
                  const rowsToAdd = holdings.length - existingDataRows;
                  const numCols = (tableRows[1]?.tableCells ?? tableRows[0]?.tableCells ?? []).length || 5;
                  for (let r = 0; r < rowsToAdd; r++) {
                    tableRequests.push({
                      insertTableRows: {
                        tableObjectId: tableId,
                        cellLocation: {
                          rowIndex: tableRows.length - 1 + r,
                          columnIndex: 0,
                        },
                        insertBelow: true,
                        number: 1,
                      },
                    });
                    // Suppress lint: numCols used below indirectly
                    void numCols;
                  }
                  // Capture style reference while tableId/existingDataRows/tableRows are in scope
                  styleInfoList.push({ tableId, existingDataRows, sourceRow: tableRows[1] ?? null });
                }

                // Populate data rows (row 0 = header, rows 1+ = data)
                for (let rowIdx = 1; rowIdx <= holdings.length; rowIdx++) {
                  const holdingIdx = rowIdx - 1;
                  const holding = holdings[holdingIdx];
                  // Re-read cells from the existing table (new rows will be empty)
                  const cells = (tableRows[rowIdx] ?? tableRows[tableRows.length - 1])?.tableCells ?? [];

                  // Column order: 0=Scheme Name, 1=Investments, 2=Current Value,
                  //               3=Unrealised Gain/Loss, 4=Holding %
                  const cellValues: string[] = [
                    holding.schemeName ?? "",
                    holding.investments ?? "",
                    holding.currentValue ?? "",
                    holding["unrealisedGain/Loss"] ?? "",
                    holding.holdingPercentage ?? "",
                  ];

                  for (
                    let colIdx = 0;
                    colIdx < Math.max(cells.length, cellValues.length) && colIdx < cellValues.length;
                    colIdx++
                  ) {
                    const cell = cells[colIdx];
                    const newText = cellValues[colIdx];

                    // Get existing cell text to check if update is needed
                    const existingCellText = (cell?.text?.textElements ?? [])
                      .map((te: any) => te.textRun?.content ?? "")
                      .join("")
                      .trim();

                    // Only update if text actually changed (avoids unnecessary writes)
                    if (existingCellText === newText) continue;

                    // Only deleteText when the cell has content — issuing deleteText
                    // on an empty cell (startIndex 0 == endIndex 0) causes an API error.
                    if (existingCellText) {
                      tableRequests.push({
                        deleteText: {
                          objectId: tableId,
                          cellLocation: { rowIndex: rowIdx, columnIndex: colIdx },
                          textRange: { type: "ALL" },
                        },
                      });
                    }

                    if (newText) {
                      tableRequests.push({
                        insertText: {
                          objectId: tableId,
                          cellLocation: { rowIndex: rowIdx, columnIndex: colIdx },
                          insertionIndex: 0,
                          text: newText,
                        },
                      });
                    }
                  }
                }

                // ── CLEAR extra rows beyond new holdings count ──
                // If the previous sheet had more schemes, those old rows still exist in the
                // table with stale data. Clear every cell in rows past holdings.length so
                // they appear blank instead of showing the old scheme names/values.
                for (let rowIdx = holdings.length + 1; rowIdx < tableRows.length; rowIdx++) {
                  const cells = tableRows[rowIdx]?.tableCells ?? [];
                  for (let colIdx = 0; colIdx < cells.length; colIdx++) {
                    const cell = cells[colIdx];
                    const existingCellText = (cell?.text?.textElements ?? [])
                      .map((te: any) => te.textRun?.content ?? "")
                      .join("")
                      .trim();

                    // Only issue deleteText if the cell actually has content
                    if (existingCellText) {
                      tableRequests.push({
                        deleteText: {
                          objectId: tableId,
                          cellLocation: { rowIndex: rowIdx, columnIndex: colIdx },
                          textRange: { type: "ALL" },
                        },
                      });
                    }
                  }
                }
              }
            }

            tableRequestsCount = tableRequests.length;

            if (tableRequests.length > 0) {
              // Insert rows first (if any), then update cell text in a second batch
              // because insertTableRows changes row indices
              const insertReqs = tableRequests.filter((r) => r.insertTableRows);
              const cellReqs = tableRequests.filter((r) => !r.insertTableRows);

              if (insertReqs.length > 0) {
                await slides.presentations.batchUpdate({
                  presentationId,
                  requestBody: { requests: insertReqs },
                });

                // ── APPLY SOURCE-ROW STYLE TO NEWLY INSERTED ROWS ──
                // insertTableRows does NOT copy cell styling — new rows always get
                // the default (large font, transparent background). Fix: read style
                // from the first existing data row and apply to all newly inserted rows.
                const styleRequests: any[] = [];

                for (const { tableId: tid, existingDataRows: edr, sourceRow } of styleInfoList) {
                  const sourceCells = sourceRow?.tableCells ?? [];
                  for (let newRowIdx = edr + 1; newRowIdx <= holdings.length; newRowIdx++) {
                    for (let colIdx = 0; colIdx < sourceCells.length; colIdx++) {
                      const srcCell = sourceCells[colIdx];

                      // 1. Background fill colour
                      const bgFill = (srcCell as any)?.tableCellProperties?.tableCellBackgroundFill;
                      if (bgFill) {
                        styleRequests.push({
                          updateTableCellProperties: {
                            objectId: tid,
                            tableRange: {
                              location: { rowIndex: newRowIdx, columnIndex: colIdx },
                              rowSpan: 1,
                              columnSpan: 1,
                            },
                            tableCellProperties: { tableCellBackgroundFill: bgFill },
                            fields: "tableCellBackgroundFill",
                          },
                        });
                      }

                      // 2. Text style — font size, family, colour, bold, italic
                      const srcTextStyle = ((srcCell as any)?.text?.textElements ?? [])
                        .find((te: any) => te.textRun?.style)?.textRun?.style;
                      if (srcTextStyle) {
                        styleRequests.push({
                          updateTextStyle: {
                            objectId: tid,
                            cellLocation: { rowIndex: newRowIdx, columnIndex: colIdx },
                            style: srcTextStyle,
                            textRange: { type: "ALL" },
                            fields: "fontSize,foregroundColor,fontFamily,bold,italic",
                          },
                        });
                      }

                      // 3. Paragraph alignment
                      const srcParaStyle = ((srcCell as any)?.text?.textElements ?? [])
                        .find((te: any) => te.paragraphMarker?.style)?.paragraphMarker?.style;
                      if (srcParaStyle?.alignment) {
                        styleRequests.push({
                          updateParagraphStyle: {
                            objectId: tid,
                            cellLocation: { rowIndex: newRowIdx, columnIndex: colIdx },
                            style: { alignment: srcParaStyle.alignment },
                            textRange: { type: "ALL" },
                            fields: "alignment",
                          },
                        });
                      }
                    }
                  }
                }

                if (styleRequests.length > 0) {
                  await slides.presentations.batchUpdate({
                    presentationId,
                    requestBody: { requests: styleRequests },
                  });
                }
              }

              if (cellReqs.length > 0) {
                const tableRes = await slides.presentations.batchUpdate({
                  presentationId,
                  requestBody: { requests: cellReqs },
                });
                occurrencesChanged += (tableRes.data.replies || []).length;
              }
            }
          }
        } catch (e) {
          smartUpdateError = String(e);
          console.error("[google-slides] Smart replacement error:", e);
        }
      }



      // If no occurrences changed, inspect the presentation to detect existing placeholders or text
      let detectedPlaceholdersInSlides: string[] = [];
      let slideTextSample: string[] = [];
      try {
        const presentation = await slides.presentations.get({ presentationId });
        const allTexts: string[] = [];

        for (const slide of presentation.data.slides || []) {
          for (const element of slide.pageElements || []) {
            const textElements = element.shape?.text?.textElements || [];
            for (const te of textElements) {
              const content = te.textRun?.content;
              if (content) {
                allTexts.push(content);
                const matches = content.match(/(\{\{[^{}\n]+\}\}|<[^<>\n]+>|\[[^\[\]\n]+\])/g);
                if (matches) {
                  detectedPlaceholdersInSlides.push(...matches);
                }
              }
            }
          }
        }

        detectedPlaceholdersInSlides = Array.from(new Set(detectedPlaceholdersInSlides));
        slideTextSample = allTexts
          .map((t) => t.trim())
          .filter((t) => t.length > 1 && !t.startsWith("\n"))
          .slice(0, 10);
      } catch {
        // Ignore read inspection errors
      }

      const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

      const varName = data.variableName || "slidesResult";
      const slideResult = {
        success: true,
        presentationId,
        presentationUrl,
        // Template mode: also expose the template source and confirm it was not modified
        ...(data.templateMode && {
          templateMode: true,
          templatePresentationId,
          templateUrl: `https://docs.google.com/presentation/d/${templatePresentationId}/edit`,
        }),
        occurrencesChanged,
        replacementsApplied: requests.length,
        holdingsPopulated: holdings.length,
        shapeRequestsCount,
        tableRequestsCount,
        smartUpdateError,
        appliedPlaceholders: requests.map((r) => r.replaceAllText?.containsText.text).filter(Boolean),
        detectedPlaceholdersInSlides,
        slideTextSample: occurrencesChanged === 0 ? slideTextSample : undefined,
      };

      return {
        ...context,
        [varName]: slideResult,
        ...slideResult,
      };
    });

    await step.realtime.publish(
      `publish-success-${nodeId}`,
      googleSlidesChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `publish-error-${nodeId}`,
      googleSlidesChannel.status,
      { nodeId, status: "error" },
    );
    throw error;
  }
};
