import type { slides_v1 } from "googleapis";
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

/** Check whether a slide contains the investor holdings table. */
function isInvestorHoldingsSlide(slide: any): boolean {
  for (const element of slide.pageElements || []) {
    if (!element.table) continue;
    const headerText = (element.table.tableRows?.[0]?.tableCells ?? [])
      .map((cell: any) =>
        (cell.text?.textElements ?? [])
          .map((textElement: any) => textElement.textRun?.content ?? "")
          .join("")
          .trim()
          .toLowerCase(),
      )
      .join(" ");

    if (
      (headerText.includes("scheme") || headerText.includes("fund")) &&
      (headerText.includes("investment") ||
        headerText.includes("holding") ||
        headerText.includes("current value"))
    ) {
      return true;
    }
  }
  return false;
}

/** Split an array of holdings into chunks of given pageSize (at least 1 chunk) */
function chunkHoldings<T>(items: T[], size: number): T[][] {
  if (!items || items.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks.length > 0 ? chunks : [[]];
}

/** Build cell text deletion and insertion requests to populate a holdings table chunk */
function buildPopulateTableRequests(
  tableElement: any,
  holdingsChunk: Array<{
    schemeName?: string;
    investments?: string;
    currentValue?: string;
    "unrealisedGain/Loss"?: string;
    gainLoss?: string;
    holdingPercentage?: string;
  }>,
): slides_v1.Schema$Request[] {
  const tableId = tableElement.objectId as string;
  const tableRows = tableElement.table?.tableRows ?? [];
  const requests: slides_v1.Schema$Request[] = [];

  // Populate data rows (row 0 is header, rows 1..N are data)
  for (let i = 0; i < holdingsChunk.length && i + 1 < tableRows.length; i++) {
    const rowIdx = i + 1;
    const holding = holdingsChunk[i];
    const cells = tableRows[rowIdx]?.tableCells ?? [];
    const cellValues: string[] = [
      holding.schemeName ?? "",
      holding.investments ?? "",
      holding.currentValue ?? "",
      holding["unrealisedGain/Loss"] ?? holding.gainLoss ?? "",
      holding.holdingPercentage ?? "",
    ];

    for (
      let colIdx = 0;
      colIdx < Math.max(cells.length, cellValues.length) &&
      colIdx < cellValues.length;
      colIdx++
    ) {
      const cell = cells[colIdx];
      const newText = cellValues[colIdx];
      const existingCellText = (cell?.text?.textElements ?? [])
        .map((te: any) => te.textRun?.content ?? "")
        .join("")
        .trim();

      if (existingCellText === newText) continue;

      if (existingCellText) {
        requests.push({
          deleteText: {
            objectId: tableId,
            cellLocation: { rowIndex: rowIdx, columnIndex: colIdx },
            textRange: { type: "ALL" },
          },
        });
      }

      if (newText) {
        requests.push({
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

  // Clear extra rows beyond this chunk's count to preserve table layout cleanly
  for (
    let rowIdx = holdingsChunk.length + 1;
    rowIdx < tableRows.length;
    rowIdx++
  ) {
    const cells = tableRows[rowIdx]?.tableCells ?? [];
    for (let colIdx = 0; colIdx < cells.length; colIdx++) {
      const cell = cells[colIdx];
      const existingCellText = (cell?.text?.textElements ?? [])
        .map((te: any) => te.textRun?.content ?? "")
        .join("")
        .trim();

      if (existingCellText) {
        requests.push({
          deleteText: {
            objectId: tableId,
            cellLocation: { rowIndex: rowIdx, columnIndex: colIdx },
            textRange: { type: "ALL" },
          },
        });
      }
    }
  }

  return requests;
}

/** Keep known report labels from being treated as an investor name shape. */
function isProtectedHeading(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) return true;

  return [
    "monthly wealth report",
    "current holdings mutual funds",
    "invested amount",
    "current value",
    "overall return",
    "unrealised gain/loss",
    "unrealized gain/loss",
    "investment amount",
    "holding percentage",
  ].includes(normalized);
}

const SUMMARY_HEADING = "Current Holdings\nMutual Funds";

function getTextFontSize(el: any): number {
  return (el.shape?.text?.textElements ?? []).reduce(
    (maxSize: number, element: any) =>
      Math.max(
        maxSize,
        Number(element.textRun?.style?.fontSize?.magnitude ?? 0),
      ),
    0,
  );
}

function getShapeTranslateY(el: any): number {
  const translateY = el?.transform?.translateY;
  return Number(translateY?.magnitude ?? translateY ?? 0);
}

function isSummaryCardLabel(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  return [
    "monthly wealth report",
    "invested amount",
    "current value",
    "overall return",
    "unrealised gain/loss",
    "unrealized gain/loss",
  ].includes(normalized);
}

function getSummaryHeadingShape(slide: any): any | null {
  return (
    (slide?.pageElements ?? [])
      .filter((element: any) => Boolean(element.shape?.text?.textElements))
      .filter((element: any) => {
        const text = getShapeText(element).trim();
        const normalized = text.replace(/\s+/g, " ").toLowerCase();
        return (
          text.length > 2 &&
          text.length < 80 &&
          /^[A-Za-z\s&.',()-]+$/.test(text) &&
          !normalized.includes("investor") &&
          !isSummaryCardLabel(text)
        );
      })
      .sort((left: any, right: any) => {
        const sizeDifference = getTextFontSize(right) - getTextFontSize(left);
        if (sizeDifference !== 0) return sizeDifference;
        return getShapeTranslateY(left) - getShapeTranslateY(right);
      })[0] ?? null
  );
}

function getSummaryInvestorNameShape(
  slide: any,
  headingShape: any | null,
): any | null {
  const headingId = headingShape?.objectId;
  const headingY = getShapeTranslateY(headingShape);
  const candidates = (slide?.pageElements ?? [])
    .filter((element: any) => Boolean(element.shape?.text?.textElements))
    .filter((element: any) => {
      const text = getShapeText(element).trim();
      const normalized = text.replace(/\s+/g, " ").toLowerCase();
      return (
        element.objectId !== headingId &&
        text.length > 2 &&
        text.length < 80 &&
        /^[A-Za-z\s&.',()-]+$/.test(text) &&
        !normalized.includes("investor") &&
        !isSummaryCardLabel(text) &&
        (!isProtectedHeading(text) ||
          normalized === "current holdings mutual funds")
      );
    });

  return (
    candidates
      .filter((element: any) => getShapeTranslateY(element) > headingY)
      .sort(
        (left: any, right: any) =>
          getShapeTranslateY(left) - getShapeTranslateY(right),
      )[0] ??
    candidates.sort(
      (left: any, right: any) => getTextFontSize(right) - getTextFontSize(left),
    )[0] ??
    null
  );
}

function isInvestorSummarySlide(slide: any): boolean {
  const text = (slide?.pageElements ?? [])
    .map((element: any) => getShapeText(element))
    .join(" ")
    .replace(/\s+/g, " ")
    .toLowerCase();

  return (
    text.includes("invested amount") &&
    text.includes("current value") &&
    text.includes("overall return") &&
    text.includes("gain")
  );
}

function isSummaryCardShapeText(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  return (
    (normalized.includes("invest") && normalized.includes("amount")) ||
    (normalized.includes("current value") && !normalized.includes("gain")) ||
    ((normalized.includes("overall") || normalized.includes("return")) &&
      !normalized.includes("gain")) ||
    (normalized.includes("gain") && normalized.includes("loss"))
  );
}

function cleanCurrencyValue(val: string): string {
  let v = val.trim();
  v = v.replace(/^\u20b9+/, "\u20b9");
  v = v.replace(/\u20b9\s*\u20b9+/g, "\u20b9");
  return v;
}

function buildReplaceTextInShapeRequests(
  element: any,
  valueMatch: RegExpMatchArray,
  newText: string,
): any[] {
  if (!newText || valueMatch.index === undefined) return [];
  const cleanNewText = cleanCurrencyValue(newText);
  const oldText = valueMatch[0];
  if (!oldText || oldText === cleanNewText) return [];

  const startIndex = valueMatch.index;
  const endIndex = startIndex + oldText.length;

  return [
    {
      deleteText: {
        objectId: element.objectId,
        textRange: {
          type: "FIXED_RANGE",
          startIndex,
          endIndex,
        },
      },
    },
    {
      insertText: {
        objectId: element.objectId,
        insertionIndex: startIndex,
        text: cleanNewText,
      },
    },
    {
      updateTextStyle: {
        objectId: element.objectId,
        style: {
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 1, green: 1, blue: 1 },
            },
          },
        },
        textRange: {
          type: "FIXED_RANGE",
          startIndex,
          endIndex: startIndex + cleanNewText.length,
        },
        fields: "foregroundColor",
      },
    },
  ];
}

function buildSummaryCardRequests(
  slide: any,
  summary: {
    investmentAmount?: string;
    currentValue?: string;
    overallReturn?: string;
    gainLoss?: string;
  },
): any[] {
  const requests: any[] = [];
  if (!slide) return requests;

  for (const element of slide?.pageElements ?? []) {
    if (!element.shape?.text?.textElements) continue;

    const fullText = getShapeText(element);
    const lowerText = fullText.toLowerCase();
    const numericMatches = Array.from(
      fullText.matchAll(
        /[-\u2212+]*(?:\u20b9|Rs\.?\s*)*[-\u2212+]*(?:\u20b9|Rs\.?\s*)*\d[\d,]*(?:\.\d+)?%?/g,
      ),
    ).filter((m) => m[0].trim().length > 0);
    const valueMatch = numericMatches.at(-1);
    if (!valueMatch) continue;

    const isInvestmentCard =
      lowerText.includes("invest") && lowerText.includes("amount");
    const isCurrentValueCard =
      lowerText.includes("current value") && !lowerText.includes("gain");
    const isOverallReturnCard =
      (lowerText.includes("overall") || lowerText.includes("return")) &&
      !lowerText.includes("gain");
    const isGainCard = lowerText.includes("gain") && lowerText.includes("loss");

    if (summary.investmentAmount && isInvestmentCard) {
      requests.push(
        ...buildReplaceTextInShapeRequests(
          element,
          valueMatch,
          summary.investmentAmount,
        ),
      );
    }

    if (summary.currentValue && isCurrentValueCard) {
      requests.push(
        ...buildReplaceTextInShapeRequests(
          element,
          valueMatch,
          summary.currentValue,
        ),
      );
    }

    if (summary.overallReturn && isOverallReturnCard) {
      requests.push(
        ...buildReplaceTextInShapeRequests(
          element,
          valueMatch,
          summary.overallReturn,
        ),
      );
    }

    if (summary.gainLoss && isGainCard) {
      requests.push(
        ...buildReplaceTextInShapeRequests(
          element,
          valueMatch,
          summary.gainLoss,
        ),
      );
    }
  }

  return requests;
}

function buildSummaryHeadingRequests(slide: any): any[] {
  const headingShape = getSummaryHeadingShape(slide);
  if (!headingShape?.objectId) return [];
  return buildReplaceShapeTextRequests(
    headingShape.objectId,
    SUMMARY_HEADING,
    getFirstTextStyle(headingShape),
  );
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

  if (
    parsedJson &&
    typeof parsedJson === "object" &&
    !Array.isArray(parsedJson)
  ) {
    for (const [rawKey, rawVal] of Object.entries(parsedJson)) {
      const key = rawKey.trim();
      let compiledVal = String(rawVal ?? "");
      try {
        compiledVal = Handlebars.compile(compiledVal, { noEscape: true })(
          context,
        );
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
    const separatorIdx = line.includes("=")
      ? line.indexOf("=")
      : line.indexOf(":");
    if (separatorIdx !== -1) {
      const rawKey = line
        .slice(0, separatorIdx)
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim();
      const rawVal = line
        .slice(separatorIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim();
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

      const rawPresentationInput = Handlebars.compile(data.presentationId)(
        context,
      );
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
          aiContent = Handlebars.compile(data.aiContentField, {
            noEscape: true,
          })(context);
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
      if (!ctxSummary.overallReturn) {
        const rawSheetText: string = (context.sheetsData as any)?.text ?? "";
        const absTextMatch = rawSheetText.match(
          /Abs\.?\s*Return\s*:\s*(-?[\d.,]+%)/i,
        );
        if (absTextMatch) ctxSummary.overallReturn = absTextMatch[1].trim();
      }

      // ── Multi-investor list ──────────────────────────────────────────────
      // Pull the investors[] array produced by the Sheets executor.
      // Fall back to a single-investor record built from legacy summary data
      // so old single-investor workflows continue to work unchanged.
      type InvestorRecord = {
        investorName: string;
        investmentAmount: string;
        currentValue: string;
        gainLoss: string;
        overallReturn: string;
        holdings: Array<{
          schemeName: string;
          investments: string;
          currentValue: string;
          "unrealisedGain/Loss": string;
          holdingPercentage: string;
        }>;
      };

      const sheetInvestors = (context.sheetsData as any)?.investors;
      const aiInvestors = aiSummary.investors as InvestorRecord[] | undefined;
      const hasStructuredInvestorData =
        (Array.isArray(sheetInvestors) && sheetInvestors.length > 0) ||
        (Array.isArray(aiInvestors) && aiInvestors.length > 0);
      const investors: InvestorRecord[] =
        Array.isArray(sheetInvestors) && sheetInvestors.length > 0
          ? sheetInvestors
          : Array.isArray(aiInvestors) && aiInvestors.length > 0
            ? aiInvestors
            : [
                {
                  investorName:
                    aiSummary.investorName ?? ctxSummary.investorName ?? "",
                  investmentAmount:
                    aiSummary.totalInvestment ??
                    aiSummary.investmentAmount ??
                    ctxSummary.investmentAmount ??
                    "",
                  currentValue:
                    aiSummary.currentValue ?? ctxSummary.currentValue ?? "",
                  gainLoss: aiSummary.gainLoss ?? ctxSummary.gainLoss ?? "",
                  overallReturn:
                    ctxSummary.overallReturn ||
                    aiSummary["Overall Return"] ||
                    aiSummary.overallReturn ||
                    "",
                  holdings:
                    aiSummary.holdings ??
                    (context.sheetsData as any)?.holdings ??
                    ctxSummary.holdings ??
                    [],
                },
              ];
      // Convenience: derive legacy summaryData from the first investor (used by
      // the placeholder replaceAllText pass that already ran above).
      const summaryData: Record<string, string> = {
        investorName: investors[0]?.investorName ?? "",
        investmentAmount: investors[0]?.investmentAmount ?? "",
        currentValue: investors[0]?.currentValue ?? "",
        gainLoss: investors[0]?.gainLoss ?? "",
        overallReturn: investors[0]?.overallReturn ?? "",
        date: aiSummary.date ?? ctxSummary.date ?? "",
      };
      // ─────────────────────────────────────────────────────────────────────────

      // ── Holdings array ──
      // When multi-investor mode is active (investors.length > 1), ALWAYS use
      // investors[0].holdings. This avoids the polluted global sheetsData.holdings
      // which contains all-investor data merged together.
      // In single-investor mode, fall back to the legacy priority chain.
      let holdings: Array<{
        schemeName: string;
        investments: string;
        currentValue: string;
        "unrealisedGain/Loss": string;
        holdingPercentage: string;
      }> = hasStructuredInvestorData
        ? (investors[0]?.holdings ??
          (context.sheetsData as any)?.holdings ??
          [])
        : (aiSummary.holdings ??
          (context.sheetsData as any)?.holdings ??
          ctxSummary.holdings ??
          []);

      // If no holdings from AI or sheetsData, try to build from raw sheetsData rows
      if (holdings.length === 0) {
        const sheetsRows: Record<string, string>[] =
          (context.sheetsData as any)?.rows ?? [];

        const pickCol = (
          row: Record<string, string>,
          ...candidates: string[]
        ): string => {
          for (const c of candidates) {
            const match = Object.keys(row).find(
              (k) =>
                k.toLowerCase().replace(/[^a-z0-9]/g, "") ===
                c.toLowerCase().replace(/[^a-z0-9]/g, ""),
            );
            if (match && row[match]) return String(row[match]).trim();
          }
          return "";
        };

        holdings = sheetsRows
          .filter((row) => {
            const scheme = pickCol(
              row,
              "Scheme",
              "SchemeName",
              "FundName",
              "Name",
            );
            return (
              scheme && !/^(grand\s*total|total|sub\s*total)/i.test(scheme)
            );
          })
          .map((row) => ({
            schemeName: pickCol(
              row,
              "Scheme",
              "SchemeName",
              "FundName",
              "Name",
            ),
            investments: pickCol(
              row,
              "InvAmt",
              "InvestmentAmount",
              "Investment",
              "Invested",
              "Inv.Amt.()",
              "InvAmt()",
            ),
            currentValue: pickCol(
              row,
              "CurrentValue",
              "CurrentValue()",
              "CurVal",
              "MarketValue",
            ),
            "unrealisedGain/Loss": pickCol(
              row,
              "UnrealisedGainLoss",
              "UnrealisedGain/Loss",
              "UnrealisedGain/Loss()",
              "GainLoss",
              "Gain/Loss",
              "UnrealizedGainLoss",
            ),
            holdingPercentage: pickCol(
              row,
              "Holdings",
              "HoldingPercentage",
              "Holdings",
              "%Holdings",
              "HoldingPercent",
            ),
          }));
      }

      // ── Multi-investor: override replacementMap with investors[0] data ────────
      // The Gemini node summarizes the ENTIRE sheet text, so when the sheet has
      // multiple investors it always returns the LAST investor's data.
      // We must overwrite those placeholder values with investors[0] so that
      // the initial replaceAllText pass (which targets the whole deck) fills
      // slides 2 & 3 with the FIRST investor's correct data.
      if (investors.length > 1 && investors[0]) {
        const inv0 = investors[0];
        const overrideMap: Record<string, string> = {
          investorName: inv0.investorName ?? "",
          totalInvestment: inv0.investmentAmount ?? "",
          investmentAmount: inv0.investmentAmount ?? "",
          currentValue: inv0.currentValue ?? "",
          gainLoss: inv0.gainLoss ?? "",
          overallReturn: inv0.overallReturn ?? "",
        };
        for (const [k, v] of Object.entries(overrideMap)) {
          if (v) {
            replacementMap[`{{${k}}}`] = v;
            replacementMap[`{{ ${k} }}`] = v;
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────────────

      let occurrencesChanged = 0;
      let initialPresentation: { data: slides_v1.Schema$Presentation };
      try {
        initialPresentation = await slides.presentations.get({
          presentationId,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new NonRetriableError(
          ["Google Slides node: Unable to read presentation: ", message].join(
            "",
          ),
        );
      }
      const editableSlideIds = (initialPresentation.data.slides || [])
        .slice(0, 3)
        .map((slide) => slide.objectId)
        .filter((id): id is string => Boolean(id));
      const requests: Array<{
        replaceAllText?: {
          containsText: { text: string; matchCase: boolean };
          replaceText: string;
          pageObjectIds: string[];
        };
      }> = [];

      for (const [placeholder, replacement] of Object.entries(replacementMap)) {
        const cleanKey = placeholder.trim();
        const cleanReplacement = String(replacement ?? "").trim();
        // NEVER replace with empty string so text boxes are not wiped blank
        if (
          cleanKey &&
          cleanKey !== "{{}}" &&
          cleanKey !== "{{  }}" &&
          cleanReplacement
        ) {
          requests.push({
            replaceAllText: {
              containsText: {
                text: cleanKey,
                matchCase: false,
              },
              replaceText: cleanReplacement,
              pageObjectIds: editableSlideIds,
            },
          });
        }
      }

      if (requests.length > 0) {
        let response: {
          data: slides_v1.Schema$BatchUpdatePresentationResponse;
        };
        try {
          response = await slides.presentations.batchUpdate({
            presentationId,
            requestBody: {
              requests,
            },
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          throw new NonRetriableError(
            [
              "Google Slides node: Unable to update cover and first investor slides: ",
              message,
            ].join(""),
          );
        }

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

      if (hasSummaryData || holdings.length > 0 || hasStructuredInvestorData) {
        try {
          const pres = await slides.presentations.get({ presentationId });
          const shapeRequests: any[] = [];

          // Helper: add a replaceAllText only if oldText is non-empty and different from newText
          const pushReplace = (
            oldText: string | undefined | null,
            newText: string,
          ) => {
            const old = (oldText ?? "").trim();
            const next = (newText ?? "").trim();
            if (old && next && old !== next) {
              shapeRequests.push({
                replaceAllText: {
                  containsText: { text: old, matchCase: false },
                  replaceText: next,
                  pageObjectIds: editableSlideIdsForCards,
                },
              });
            }
          };

          // Only scan slides 1..N (N = holdingsSlideIndex, default 3).
          // Slides beyond this boundary are treated as static/protected and are
          // never touched — no shape text is read or replaced on them.
          const maxEditSlide = data.holdingsSlideIndex ?? 3;
          const allSlides = pres.data.slides || [];
          const protectedSlideIds = new Set(
            allSlides
              .slice(Math.max(3, allSlides.length - 3))
              .map((slide) => slide.objectId)
              .filter(Boolean),
          );
          const editableSlideIdsForCards = allSlides
            .slice(0, 3)
            .map((slide) => slide.objectId)
            .filter(Boolean);
          const shapeSlidesToScan =
            maxEditSlide === 0
              ? allSlides.filter(
                  (slide) => !protectedSlideIds.has(slide.objectId),
                )
              : allSlides
                  .slice(0, maxEditSlide)
                  .filter((slide) => !protectedSlideIds.has(slide.objectId));
          const firstSummarySlide = allSlides[1];
          const firstSummaryHeadingShape =
            getSummaryHeadingShape(firstSummarySlide);
          const firstSummaryInvestorShape = getSummaryInvestorNameShape(
            firstSummarySlide,
            firstSummaryHeadingShape,
          );
          const firstSummaryHeadingId = firstSummaryHeadingShape?.objectId;
          const firstSummaryInvestorId = firstSummaryInvestorShape?.objectId;
          const summaryInvestorRequests: any[] = [];

          for (const slide of shapeSlidesToScan) {
            const isHoldings = isInvestorHoldingsSlide(slide);

            for (const el of slide.pageElements || []) {
              if (!el.shape?.text?.textElements) continue;

              if (
                slide.objectId === firstSummarySlide?.objectId &&
                (el.objectId === firstSummaryHeadingId ||
                  isSummaryCardShapeText(getShapeText(el)))
              ) {
                continue;
              }

              if (
                slide.objectId === firstSummarySlide?.objectId &&
                el.objectId === firstSummaryInvestorId
              ) {
                if (summaryData.investorName && el.objectId) {
                  summaryInvestorRequests.push(
                    ...buildReplaceShapeTextRequests(
                      el.objectId,
                      summaryData.investorName,
                      getFirstTextStyle(el),
                    ),
                  );
                }
                continue;
              }

              const fullText = getShapeText(el);
              const fullTextLower = fullText.toLowerCase();
              // Split by \n or vertical tab (\x0B) used for soft-returns in Slides
              const lines = fullText
                .split(/\r?\n/)
                .flatMap((line) => line.split(String.fromCharCode(11)))
                .map((l) => l.trim())
                .filter(Boolean);

              // Slide 1: Date box — detect any date-like pattern and replace with new date
              if (
                summaryData.date &&
                (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*[-–]\s*\d{4}/i.test(
                  fullText.trim(),
                ) ||
                  /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(fullText.trim()))
              ) {
                pushReplace(fullText.trim(), summaryData.date);
              }

              // Slide 1: Investor label block. Slides may encode the line
              // break as a newline or a soft return, so use the parsed lines.
              if (
                summaryData.investorName &&
                lines[0]?.toLowerCase() === "investor" &&
                lines[1]
              ) {
                pushReplace(lines[1], summaryData.investorName);
              }

              // Slide 3: Holdings slide headline MUST be "Current Holdings Mutual Funds"
              // If previously replaced with an investor's name (e.g. "Kabeer Agrawal"), restore it!
              if (isHoldings) {
                if (
                  !fullTextLower.includes("current holding") &&
                  !fullTextLower.includes("mutual fund") &&
                  fullText.trim().length > 2 &&
                  fullText.trim().length < 80 &&
                  /^[A-Za-z\s&.',()-]+$/.test(fullText.trim())
                ) {
                  pushReplace(fullText.trim(), "Current Holdings Mutual Funds");
                }
                // Never replace investor name into other shapes on holdings slide
                continue;
              }

              // Other standalone shapes are intentionally not treated as
              // investor names. The first summary slide's name shape is
              // updated by object ID above so identical title text remains safe.

              // Slide 2: Invested Amount card — replace the value line only
              if (
                summaryData.investmentAmount &&
                fullTextLower.includes("invested")
              ) {
                const currentValue =
                  lines[1] ?? fullText.match(/(-?₹?\s*[\d.,]+)/)?.[1];
                if (currentValue)
                  pushReplace(currentValue, summaryData.investmentAmount);
              }

              // Slide 2: Current Value card — replace the value line only
              if (
                summaryData.currentValue &&
                fullTextLower.includes("current value") &&
                !fullTextLower.includes("gain")
              ) {
                const currentValue =
                  lines[1] ?? fullText.match(/(-?₹?\s*[\d.,]+)/)?.[1];
                if (currentValue)
                  pushReplace(currentValue, summaryData.currentValue);
              }

              // Slide 2: Overall Return card — replace the value line only
              if (
                summaryData.overallReturn &&
                !fullTextLower.includes("gain") &&
                fullTextLower.includes("return")
              ) {
                const currentValue =
                  lines[1] ?? fullText.match(/(-?[\d.,]+%)/)?.[1];
                console.log(
                  `[google-slides] Found Overall Return shape. fullText: ${JSON.stringify(fullText)}, lines: ${JSON.stringify(lines)}, extracted value: ${currentValue}, summaryData.overallReturn: ${summaryData.overallReturn}`,
                );
                if (currentValue)
                  pushReplace(currentValue, summaryData.overallReturn);
              }

              // Slide 2: Gain/Loss card — replace the value line only
              if (summaryData.gainLoss && fullTextLower.includes("gain")) {
                const currentValue =
                  lines[1] ?? fullText.match(/(-?₹?\s*[\d.,]+)/)?.[1];
                if (currentValue)
                  pushReplace(currentValue, summaryData.gainLoss);
              }
            }
          }

          const summaryHeadingRequests = firstSummarySlide
            ? buildSummaryHeadingRequests(firstSummarySlide)
            : [];

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
              occurrencesChanged +=
                reply.replaceAllText?.occurrencesChanged || 0;
            });
          }

          // ── TABLE CELL UPDATES (separate batch so errors don't block cards) ──
          const summaryCardRequests = firstSummarySlide
            ? buildSummaryCardRequests(firstSummarySlide, summaryData)
            : [];
          const summaryShapeRequests = [
            ...summaryHeadingRequests,
            ...summaryInvestorRequests,
            ...summaryCardRequests,
          ];
          if (summaryShapeRequests.length > 0) {
            await slides.presentations.batchUpdate({
              presentationId,
              requestBody: { requests: summaryShapeRequests },
            });
          }
          if (holdings.length > 0 || hasStructuredInvestorData) {
            const tableRequests: any[] = [];

            // Reuse maxEditSlide + allSlides hoisted from the shape-scan section above.
            // holdingsSlideIndex: 1-based (default 3 = slide 3). 0 = all slides.

            // Build the subset of slides to scan for a holdings table
            const editableSlides = allSlides.filter(
              (slide) => !protectedSlideIds.has(slide.objectId),
            );
            const detectedHoldingsSlide = editableSlides.find((s) =>
              isInvestorHoldingsSlide(s),
            );
            const slidesToScan =
              maxEditSlide === 0
                ? editableSlides
                : detectedHoldingsSlide
                  ? [detectedHoldingsSlide]
                  : editableSlides.filter((_, idx) => idx === maxEditSlide - 1);
            for (const slide of slidesToScan) {
              for (const el of slide.pageElements || []) {
                if (!el.table) continue;

                const tableRows = el.table.tableRows ?? [];
                // Detect if this is the holdings table by checking header row text
                const headerRow = tableRows[0];
                const headerText = (headerRow?.tableCells ?? [])
                  .map((c: any) =>
                    (c.text?.textElements ?? [])
                      .map((te: any) => te.textRun?.content ?? "")
                      .join("")
                      .trim()
                      .toLowerCase(),
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

                const existingDataRows = tableRows.length - 1; // subtract header
                const chunk0 = holdings.slice(0, existingDataRows);
                const reqs = buildPopulateTableRequests(el, chunk0);
                tableRequests.push(...reqs);
              }
            }

            tableRequestsCount = tableRequests.length;

            if (tableRequests.length > 0) {
              const tableRes = await slides.presentations.batchUpdate({
                presentationId,
                requestBody: { requests: tableRequests },
              });
              occurrencesChanged += (tableRes.data.replies || []).length;
            }
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          throw new NonRetriableError(
            [
              "Google Slides node: Failed to populate report slides: ",
              message,
            ].join(""),
          );
        }
      }

      // \u2500\u2500 Multi-investor: duplicate template slides for investors[1..N] \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      // investors[0] is handled by the smart update above (it edits slides 2 & 3 in-place).
      // For every additional investor, we:
      //   1. Duplicate slide 2 (summary) and slide 3 (holdings) from the template.
      //   2. Fill the duplicated pair with that investor's data.
      //   3. After all investors are done, delete the original template slides 2 & 3
      //      so only the filled copies remain.
      // ── Multi-investor & Holdings Pagination ──────────────────────────────────
      // Presentation slide layout:
      //   Slide 1: Cover slide (preserved)
      //   Slide 2: Template Summary slide (Investor 1)
      //   Slide 3: Template Holdings slide (Investor 1, Chunk 0)
      //   Slide 4..: Investor 1 Holdings continuation chunks (Chunk 1, Chunk 2...)
      //   Followed by: Additional investors (Investor 2, 3...) with Summary + paginated Holdings
      //   FINAL SLIDES: Static ending/outro slides (e.g. Insurance) that MUST
      //                 NEVER be changed, NEVER be deleted, and ALWAYS stick at the very end.
      let multiInvestorError: string | undefined;

      try {
        // Re-fetch presentation to get current slide IDs
        const presForLoop = await slides.presentations.get({ presentationId });
        const allSlidesForLoop = presForLoop.data.slides || [];

        // Detect the first static outro by slide structure instead of assuming
        // the last three slides are outros. Old generated investor slides are
        // themselves summary/holdings slides and must be eligible for cleanup.
        const firstOutroIndex = allSlidesForLoop.findIndex(
          (slide, index) =>
            index >= 3 &&
            !isInvestorSummarySlide(slide) &&
            !isInvestorHoldingsSlide(slide),
        );
        const investorSlideEnd =
          firstOutroIndex === -1 ? allSlidesForLoop.length : firstOutroIndex;
        const outroSlideIds = allSlidesForLoop
          .slice(investorSlideEnd)
          .map((slide) => slide.objectId)
          .filter((id): id is string => Boolean(id));

        // Preserve the first summary and the first holdings table as templates.
        const investorSlides = allSlidesForLoop.slice(0, investorSlideEnd);
        const firstSummaryId = investorSlides[1]?.objectId;
        const firstHoldingsSlide =
          investorSlides
            .slice(2)
            .find((slide) => isInvestorHoldingsSlide(slide)) ??
          investorSlides[2];
        const templateInvestorSlideIds = new Set(
          [firstSummaryId, firstHoldingsSlide?.objectId].filter(
            (id): id is string => Boolean(id),
          ),
        );
        const oldGeneratedInvestorSlideIds = investorSlides
          .slice(1)
          .filter(
            (slide) => !templateInvestorSlideIds.has(slide.objectId ?? ""),
          )
          .map((slide) => slide.objectId)
          .filter((id): id is string => Boolean(id));

        // Clean up ONLY old generated investor slides from prior runs.
        if (oldGeneratedInvestorSlideIds.length > 0) {
          const deleteOldSlidesReqs = oldGeneratedInvestorSlideIds.map(
            (objectId) => ({
              deleteObject: { objectId },
            }),
          );
          await slides.presentations.batchUpdate({
            presentationId,
            requestBody: { requests: deleteOldSlidesReqs },
          });
        }

        // Re-fetch after cleaning to get exact template slides 2 & 3
        const freshPres = await slides.presentations.get({ presentationId });
        const freshSlides = freshPres.data.slides || [];
        const coverSlideId = freshSlides[0]?.objectId;
        const templateSummarySlide = freshSlides[1];
        const templateHoldingsSlide =
          freshSlides
            .slice(2)
            .find((slide) => isInvestorHoldingsSlide(slide)) ?? freshSlides[2];

        if (!templateSummarySlide || !templateHoldingsSlide) {
          throw new Error(
            "Template slides 2 and 3 not found. Ensure the presentation has at least 3 slides.",
          );
        }

        // Dynamically determine page capacity from template table (fallback to 15)
        const templateHoldingsTableEl = (
          templateHoldingsSlide.pageElements || []
        ).find(
          (el: any) =>
            el.table && isInvestorHoldingsSlide({ pageElements: [el] }),
        );
        const templateTable = templateHoldingsTableEl?.table;
        const templateDataRows = (templateTable?.tableRows?.length ?? 16) - 1;
        const pageSize = Math.max(
          1,
          templateDataRows > 0 ? templateDataRows : 15,
        );

        // 1. Investor 0 Continuation Slides (if holdings.length > pageSize)
        const inv0Holdings = investors[0]?.holdings ?? [];
        const inv0Chunks = chunkHoldings(inv0Holdings, pageSize);
        const inv0ContinuationIds: string[] = [];

        if (inv0Chunks.length > 1) {
          const inv0ExtraChunks = inv0Chunks.slice(1);
          const dupRequests = inv0ExtraChunks.map(() => ({
            duplicateObject: {
              objectId: templateHoldingsSlide.objectId,
            },
          }));

          const dupRes = await slides.presentations.batchUpdate({
            presentationId,
            requestBody: { requests: dupRequests },
          });

          const createdIds = (dupRes.data.replies || [])
            .map((r) => r.duplicateObject?.objectId as string | undefined)
            .filter((id): id is string => Boolean(id));

          inv0ContinuationIds.push(...createdIds);

          const presAfterInv0Dup = await slides.presentations.get({
            presentationId,
          });
          const allSlidesAfterInv0Dup = presAfterInv0Dup.data.slides || [];

          const tableReqsList: slides_v1.Schema$Request[] = [];
          for (let i = 0; i < createdIds.length; i++) {
            const slideId = createdIds[i];
            const chunk = inv0ExtraChunks[i];
            const slideObj = allSlidesAfterInv0Dup.find(
              (s) => s.objectId === slideId,
            );
            const tableEl = (slideObj?.pageElements || []).find(
              (el: any) => el.table,
            );
            if (tableEl && chunk) {
              tableReqsList.push(...buildPopulateTableRequests(tableEl, chunk));
            }
          }

          if (tableReqsList.length > 0) {
            await slides.presentations.batchUpdate({
              presentationId,
              requestBody: { requests: tableReqsList },
            });
          }
        }

        // 2. Additional Investors (investors[1..N])
        const additionalInvestorSlideIds: string[] = [];

        if (investors.length > 1) {
          for (let invIdx = 1; invIdx < investors.length; invIdx++) {
            const investor = investors[invIdx];
            const invChunks = chunkHoldings(investor.holdings ?? [], pageSize);

            // Duplicate 1 Summary slide + N Holdings slides in a single batch
            const dupRequests = [
              {
                duplicateObject: {
                  objectId: templateSummarySlide.objectId,
                },
              },
              ...invChunks.map(() => ({
                duplicateObject: {
                  objectId: templateHoldingsSlide.objectId,
                },
              })),
            ];

            const dupRes = await slides.presentations.batchUpdate({
              presentationId,
              requestBody: { requests: dupRequests },
            });

            const dupReplies = dupRes.data.replies || [];
            const newSummaryId = dupReplies[0]?.duplicateObject?.objectId as
              | string
              | undefined;
            const newHoldingsIds = dupReplies
              .slice(1)
              .map((r) => r.duplicateObject?.objectId as string | undefined)
              .filter((id): id is string => Boolean(id));

            if (!newSummaryId) continue;

            additionalInvestorSlideIds.push(newSummaryId, ...newHoldingsIds);

            const presAfterDup = await slides.presentations.get({
              presentationId,
            });
            const currentSlides = presAfterDup.data.slides || [];
            const newSummarySlide = currentSlides.find(
              (s) => s.objectId === newSummaryId,
            );
            const summaryHeadingShape = getSummaryHeadingShape(newSummarySlide);
            const summaryHeadingObjectId = summaryHeadingShape?.objectId;

            const invRequests: any[] = [];
            const addReplace = (
              oldText: string | undefined | null,
              newText: string,
            ) => {
              const old = (oldText ?? "").trim();
              const next = (newText ?? "").trim();
              if (old && next && old !== next) {
                invRequests.push({
                  replaceAllText: {
                    containsText: { text: old, matchCase: false },
                    replaceText: next,
                    pageObjectIds: [newSummaryId, ...newHoldingsIds],
                  },
                });
              }
            };

            for (const el of newSummarySlide?.pageElements || []) {
              if (!el.shape?.text?.textElements) continue;
              if (
                el.objectId === summaryHeadingObjectId ||
                isSummaryCardShapeText(getShapeText(el))
              ) {
                continue;
              }
              const ft = getShapeText(el);
              const ftl = ft.toLowerCase();
              const ls = ft
                .split(/\r?\n/)
                .flatMap((line) => line.split(String.fromCharCode(11)))
                .map((l) => l.trim())
                .filter(Boolean);

              if (
                investor.investorName &&
                /^[A-Za-z\s&.',()-]+$/.test(ft.trim()) &&
                !ftl.includes("investor\n") &&
                !ftl.includes("overall") &&
                !ftl.includes("invested") &&
                !ftl.includes("current value") &&
                !ftl.includes("return") &&
                !ftl.includes("gain") &&
                ft.trim().length > 2 &&
                ft.trim().length < 80
              ) {
                addReplace(ft.trim(), investor.investorName);
              }
              if (investor.investorName && ftl.includes("investor\n"))
                addReplace(ls[1], investor.investorName);
              if (investor.investmentAmount && ftl.includes("invested"))
                addReplace(
                  ls[1] ?? ft.match(/(-?₹?\s*[\d.,]+)/)?.[1],
                  investor.investmentAmount,
                );
              if (
                investor.currentValue &&
                ftl.includes("current value") &&
                !ftl.includes("gain")
              )
                addReplace(
                  ls[1] ?? ft.match(/(-?₹?\s*[\d.,]+)/)?.[1],
                  investor.currentValue,
                );
              if (
                investor.overallReturn &&
                ftl.includes("return") &&
                !ftl.includes("gain")
              )
                addReplace(
                  ls[1] ?? ft.match(/(-?[\d.,]+%)/)?.[1],
                  investor.overallReturn,
                );
              if (investor.gainLoss && ftl.includes("gain"))
                addReplace(
                  ls[1] ?? ft.match(/(-?₹?\s*[\d.,]+)/)?.[1],
                  investor.gainLoss,
                );
            }

            if (invRequests.length > 0) {
              await slides.presentations.batchUpdate({
                presentationId,
                requestBody: { requests: invRequests },
              });
            }

            const summaryHeadingRequestsInv =
              buildSummaryHeadingRequests(newSummarySlide);
            if (summaryHeadingRequestsInv.length > 0) {
              await slides.presentations.batchUpdate({
                presentationId,
                requestBody: { requests: summaryHeadingRequestsInv },
              });
            }

            const presAfterCardFix = await slides.presentations.get({
              presentationId,
            });
            const summarySlideAfterCardFix = (
              presAfterCardFix.data.slides || []
            ).find((slide) => slide.objectId === newSummaryId);
            const summaryCardRequestsInv = buildSummaryCardRequests(
              summarySlideAfterCardFix,
              investor,
            );
            if (summaryCardRequestsInv.length > 0) {
              await slides.presentations.batchUpdate({
                presentationId,
                requestBody: { requests: summaryCardRequestsInv },
              });
            }

            // Populate all holdings chunks for this investor
            const presForHoldings = await slides.presentations.get({
              presentationId,
            });
            const slidesForHoldings = presForHoldings.data.slides || [];
            const allHoldingsRequests: slides_v1.Schema$Request[] = [];

            for (let c = 0; c < invChunks.length; c++) {
              const hSlideId = newHoldingsIds[c];
              if (!hSlideId) continue;
              const hSlide = slidesForHoldings.find(
                (s) => s.objectId === hSlideId,
              );
              const tableEl = (hSlide?.pageElements || []).find(
                (el: any) => el.table,
              );
              if (tableEl) {
                const reqs = buildPopulateTableRequests(tableEl, invChunks[c]);
                allHoldingsRequests.push(...reqs);
              }
            }

            if (allHoldingsRequests.length > 0) {
              await slides.presentations.batchUpdate({
                presentationId,
                requestBody: { requests: allHoldingsRequests },
              });
            }
          }
        }

        // 3. Reorder all slides in exact investor-grouped order, followed by outro slides
        const targetOrder: string[] = [
          coverSlideId,
          templateSummarySlide.objectId,
          templateHoldingsSlide.objectId,
          ...inv0ContinuationIds,
          ...additionalInvestorSlideIds,
          ...outroSlideIds,
        ].filter((id): id is string => Boolean(id));

        const uniqueTargetOrder = Array.from(new Set(targetOrder));

        if (uniqueTargetOrder.length > 0) {
          const reorderRequests = uniqueTargetOrder.map((objectId, index) => ({
            updateSlidesPosition: {
              slideObjectIds: [objectId],
              insertionIndex: index,
            },
          }));
          await slides.presentations.batchUpdate({
            presentationId,
            requestBody: { requests: reorderRequests },
          });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        throw new NonRetriableError(
          [
            "Google Slides node: Failed to build investor slide pairs: ",
            message,
          ].join(""),
        );
      }
      // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

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
                const matches = content.match(
                  /(\{\{[^{}\n]+\}\}|<[^<>\n]+>|\[(?:[^\]\n]+)\])/g,
                );
                if (matches) {
                  detectedPlaceholdersInSlides.push(...matches);
                }
              }
            }
          }
        }

        detectedPlaceholdersInSlides = Array.from(
          new Set(detectedPlaceholdersInSlides),
        );
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
        investorsProcessed: investors.length,
        shapeRequestsCount,
        tableRequestsCount,
        smartUpdateError,
        multiInvestorError,
        appliedPlaceholders: requests
          .map((r) => r.replaceAllText?.containsText.text)
          .filter(Boolean),
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
