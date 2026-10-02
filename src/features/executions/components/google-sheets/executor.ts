import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import prisma from "@/lib/db";

export interface GoogleSheetsData {
  variableName?: string;
  credentialId?: string;
  spreadsheetId?: string;
  sheetName?: string;
  range?: string;
  includeHeaders?: boolean;
}

export const googleSheetsExecutor: NodeExecutor<GoogleSheetsData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `publish-loading-${nodeId}`,
    googleSheetsChannel.status,
    { nodeId, status: "loading" },
  );

  try {
    const result = await step.run("google-sheets-read", async () => {
      if (!data.credentialId) {
        await step.realtime.publish(
          `publish-error-${nodeId}`,
          googleSheetsChannel.status,
          { nodeId, status: "error" },
        );
        throw new NonRetriableError(
          "Google Sheets node: No credential selected",
        );
      }

      if (!data.spreadsheetId) {
        await step.realtime.publish(
          `publish-error-${nodeId}`,
          googleSheetsChannel.status,
          { nodeId, status: "error" },
        );
        throw new NonRetriableError(
          "Google Sheets node: Spreadsheet ID not configured",
        );
      }

      const credential = await prisma.credential.findUnique({
        where: { id: data.credentialId },
      });

      if (!credential?.value) {
        await step.realtime.publish(
          `publish-error-${nodeId}`,
          googleSheetsChannel.status,
          { nodeId, status: "error" },
        );
        throw new NonRetriableError(
          "Google Sheets node: Selected credential not found or empty",
        );
      }

      // Parse the Service Account JSON key
      let serviceAccountKey: { client_email: string; private_key: string };
      try {
        serviceAccountKey = JSON.parse(credential.value);
      } catch {
        throw new NonRetriableError(
          "Google Sheets node: Credential value is not valid JSON. Please paste your Google Service Account JSON key.",
        );
      }

      // Resolve any Handlebars templates in config values
      const rawSpreadsheetInput = Handlebars.compile(data.spreadsheetId)(context);
      const spreadsheetId =
        rawSpreadsheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ??
        rawSpreadsheetInput.trim();
      const rawSheetName = data.sheetName
        ? Handlebars.compile(data.sheetName)(context).trim()
        : "";
      const rawRange = data.range
        ? Handlebars.compile(data.range)(context).trim()
        : "A1:Z1000";

      // If range already has a sheet prefix like "Sheet0!A1:Z100", use it directly
      let fullRange = rawRange;
      if (!rawRange.includes("!")) {
        if (rawSheetName) {
          const safeSheet = `'${rawSheetName.replace(/'/g, "''")}'`;
          fullRange = `${safeSheet}!${rawRange}`;
        } else {
          fullRange = rawRange;
        }
      }

      const { google } = await import("googleapis");
      const auth = new google.auth.JWT({
        email: serviceAccountKey.client_email,
        key: serviceAccountKey.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      let response;
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: fullRange,
        });
      } catch (rangeError: any) {
        // If range failed (e.g. Sheet1 doesn't exist), inspect spreadsheet to find actual sheet names
        try {
          const meta = await sheets.spreadsheets.get({ spreadsheetId });
          const availableSheets = (meta.data.sheets || [])
            .map((s) => s.properties?.title)
            .filter((t): t is string => Boolean(t));

          if (availableSheets.length > 0) {
            // Attempt with the first available sheet
            const firstSheet = `'${availableSheets[0].replace(/'/g, "''")}'`;
            const cleanCellRange = rawRange.includes("!")
              ? rawRange.split("!").pop() || "A1:Z1000"
              : rawRange;
            const fallbackRange = `${firstSheet}!${cleanCellRange}`;

            response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range: fallbackRange,
            });
          } else {
            throw rangeError;
          }
        } catch {
          // If fallback fails, rethrow with friendly message
          throw new NonRetriableError(
            `Google Sheets node: Unable to read range "${fullRange}". Please verify the sheet tab name matches your spreadsheet.`
          );
        }
      }

      const rawValues: string[][] =
        (response.data.values as string[][] | null | undefined) || [];

      if (!rawValues || rawValues.length === 0) {
        return {
          headers: [],
          rows: [],
          values: [],
          text: "(Empty sheet)",
          rowCount: 0,
          columnCount: 0,
        };
      }

      // Format complete grid representation for downstream LLMs
      const textRepresentation = rawValues
        .filter((r) => r.some((c) => c !== undefined && String(c).trim() !== ""))
        .map((row) => row.map((c) => String(c ?? "").trim()).join(" | "))
        .join("\n");

      // Dynamically locate the main table header row (row with the most columns)
      let headerRowIndex = 0;
      let maxCols = 0;
      rawValues.forEach((row, idx) => {
        const nonEmpty = row.filter((c) => c !== undefined && String(c).trim() !== "").length;
        if (nonEmpty > maxCols) {
          maxCols = nonEmpty;
          headerRowIndex = idx;
        }
      });

      const includeHeaders = data.includeHeaders !== false;
      let headers: string[] = [];
      let rows: Record<string, string>[] = [];

      if (includeHeaders && maxCols > 0) {
        headers = rawValues[headerRowIndex].map((h, i) =>
          h && String(h).trim() ? String(h).trim() : `Column_${i + 1}`,
        );
        const dataRows = rawValues.slice(headerRowIndex + 1);
        rows = dataRows
          .filter((row) => row.some((c) => c !== undefined && String(c).trim() !== ""))
          .map((row) => {
            const rowObj: Record<string, string> = {};
            headers.forEach((header, colIdx) => {
              rowObj[header] =
                row[colIdx] !== undefined ? String(row[colIdx]) : "";
            });
            return rowObj;
          });
      }

      // Quick heuristic summary extraction for financial/report sheets
      const summary: Record<string, string> = {};
      rawValues.forEach((row, i) => {
        const joined = row.join(" ");
        if (/Investor\s*[:]/i.test(joined)) {
          const match = joined.match(/Investor\s*:\s*([^,\n]+)/i);
          if (match) summary.investorName = match[1].trim();
        }
        if (/Investment\s*Amount/i.test(joined) && rawValues[i + 1]) {
          const nextRow = rawValues[i + 1];
          row.forEach((col, colIdx) => {
            if (/Investment\s*Amount/i.test(col) && nextRow[colIdx]) {
              summary.investmentAmount = String(nextRow[colIdx]).trim();
            }
            if (/Current\s*Value/i.test(col) && nextRow[colIdx]) {
              summary.currentValue = String(nextRow[colIdx]).trim();
            }
            if (/Unrealised\s*Gain/i.test(col) && nextRow[colIdx]) {
              summary.gainLoss = String(nextRow[colIdx]).trim();
            }
          });
        }
        if (/Weighted\s*Avg/i.test(joined)) {
          const retMatch = joined.match(/Return\s*:\s*([\d.]+%\s*)/i);
          if (retMatch) summary.overallReturn = retMatch[1].trim();
        }
      });

      // ── Holdings array extraction ──
      // Extract directly from rawValues using a header-row scan.
      // We cannot rely on rows[] / headers[] because the sheet has many metadata rows
      // above the actual fund table, which confuses the auto-detect logic.
      const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Find the row in rawValues that contains the fund table header
      // (the row with "Scheme" or "Fund" as one of its cells)
      let tableHeaderRowIdx = -1;
      let rawHeaders: string[] = [];
      for (let i = 0; i < rawValues.length; i++) {
        const row = rawValues[i];
        const schemeCell = row.findIndex((c) => /^scheme$/i.test(String(c ?? "").trim()));
        if (schemeCell !== -1) {
          tableHeaderRowIdx = i;
          rawHeaders = row.map((c) => String(c ?? "").trim());
          break;
        }
      }

      const findRawColIdx = (...patterns: RegExp[]): number => {
        for (const pat of patterns) {
          const idx = rawHeaders.findIndex((h) => pat.test(normalizeKey(h)));
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const schemeColIdx  = findRawColIdx(/^scheme$/, /^fund$/, /^name$/);
      const invColIdx     = findRawColIdx(/invamt/, /investmentamount/, /invested/, /investment/);
      const curValColIdx  = findRawColIdx(/currentvalue/, /curval/, /marketvalue/);
      const gainColIdx    = findRawColIdx(/unrealisedgainloss/, /unrealizedgainloss/, /gainloss/);
      const holdColIdx    = findRawColIdx(/holding$/, /holdingpercentage/, /holdingpercent/, /percent/);

      const holdings: Array<{
        schemeName: string;
        investments: string;
        currentValue: string;
        "unrealisedGain/Loss": string;
        holdingPercentage: string;
      }> = [];

      if (tableHeaderRowIdx !== -1 && schemeColIdx !== -1) {
        // Data rows start immediately after the header row
        for (let i = tableHeaderRowIdx + 1; i < rawValues.length; i++) {
          const row = rawValues[i];
          const schemeName = String(row[schemeColIdx] ?? "").trim();
          // Stop at Grand Total row or empty rows
          if (!schemeName || /^(grand\s*total|total|sub\s*total)/i.test(schemeName)) continue;
          // Skip if it looks like a footer/note row
          if (/weighted\s*avg|note\s*:|^\s*●/i.test(schemeName)) continue;

          holdings.push({
            schemeName,
            investments:           invColIdx     !== -1 ? String(row[invColIdx]     ?? "").trim() : "",
            currentValue:          curValColIdx  !== -1 ? String(row[curValColIdx]  ?? "").trim() : "",
            "unrealisedGain/Loss": gainColIdx    !== -1 ? String(row[gainColIdx]    ?? "").trim() : "",
            holdingPercentage:     holdColIdx    !== -1 ? String(row[holdColIdx]    ?? "").trim() : "",
          });
        }
      }

      const varName = data.variableName || "sheetsData";
      const sheetResult = {
        headers,
        rows,
        values: rawValues,
        text: textRepresentation,
        summary,
        holdings,
        rowCount: rawValues.length,
        columnCount: maxCols,
      };

      return {
        ...context,
        [varName]: sheetResult,
        ...sheetResult,
      };
    });

    await step.realtime.publish(
      `publish-success-${nodeId}`,
      googleSheetsChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `publish-error-${nodeId}`,
      googleSheetsChannel.status,
      { nodeId, status: "error" },
    );
    throw error;
  }
};
