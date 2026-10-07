export type InvestorHolding = {
  schemeName: string;
  investments: string;
  currentValue: string;
  "unrealisedGain/Loss": string;
  holdingPercentage: string;
};

export type InvestorRecord = {
  investorName: string;
  investmentAmount: string;
  currentValue: string;
  gainLoss: string;
  overallReturn: string;
  holdings: InvestorHolding[];
};

const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const findColumn = (headers: string[], ...patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const index = headers.findIndex((header) =>
      pattern.test(normalizeKey(header)),
    );
    if (index !== -1) return index;
  }
  return -1;
};

const withRupeePrefix = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("\u20b9") || trimmed.startsWith("Rs.")) {
    return trimmed;
  }
  return String.fromCodePoint(0x20b9) + trimmed;
};

export function extractInvestorBlock(
  blockRows: readonly string[][],
): InvestorRecord {
  let investorName = "";
  for (const row of blockRows) {
    const match = row.join(" ").match(/Investor\s*:\s*([^,\n]+)/i);
    if (match) {
      investorName = match[1].trim();
      break;
    }
  }

  let tableHeaderIndex = -1;
  let tableHeaders: string[] = [];
  for (let index = 0; index < blockRows.length; index++) {
    const row = blockRows[index];
    if (row.some((cell) => /^scheme$/i.test(String(cell ?? "").trim()))) {
      tableHeaderIndex = index;
      tableHeaders = row.map((cell) => String(cell ?? "").trim());
      break;
    }
  }

  const summary: Record<string, string> = {};
  const preamble =
    tableHeaderIndex > 0 ? blockRows.slice(0, tableHeaderIndex) : blockRows;

  for (let index = 0; index < preamble.length; index++) {
    const row = preamble[index];
    const nextRow = preamble[index + 1];
    if (
      !nextRow ||
      !row.some((cell) => /Investment\s*Amount/i.test(String(cell ?? "")))
    ) {
      continue;
    }

    row.forEach((cell, columnIndex) => {
      const label = String(cell ?? "");
      const value = String(nextRow[columnIndex] ?? "").trim();
      if (!value) return;
      if (/Investment\s*Amount/i.test(label)) summary.investmentAmount = value;
      if (/Current\s*Value/i.test(label)) summary.currentValue = value;
      if (/Unrealised\s*Gain/i.test(label)) summary.gainLoss = value;
    });
  }

  const schemeColumn = findColumn(tableHeaders, /^scheme$/, /^fund$/, /^name$/);
  const investmentColumn = findColumn(
    tableHeaders,
    /invamt/,
    /investmentamount/,
    /invested/,
    /investment/,
  );
  const currentValueColumn = findColumn(
    tableHeaders,
    /currentvalue/,
    /curval/,
    /marketvalue/,
  );
  const gainColumn = findColumn(
    tableHeaders,
    /unrealisedgainloss/,
    /unrealizedgainloss/,
    /gainloss/,
  );
  const holdingColumn = findColumn(
    tableHeaders,
    /holding$/,
    /holdingpercentage/,
    /holdingpercent/,
    /percent/,
  );

  if (tableHeaderIndex !== -1) {
    for (let index = tableHeaderIndex + 1; index < blockRows.length; index++) {
      const row = blockRows[index];
      const firstCell = String(
        row[schemeColumn !== -1 ? schemeColumn : 0] ?? "",
      ).trim();
      if (!/^(grand\s*total|total|sub\s*total)/i.test(firstCell)) continue;

      if (
        !summary.investmentAmount &&
        investmentColumn !== -1 &&
        row[investmentColumn]
      ) {
        summary.investmentAmount = withRupeePrefix(
          String(row[investmentColumn]),
        );
      }
      if (
        !summary.currentValue &&
        currentValueColumn !== -1 &&
        row[currentValueColumn]
      ) {
        summary.currentValue = withRupeePrefix(String(row[currentValueColumn]));
      }
      if (!summary.gainLoss && gainColumn !== -1 && row[gainColumn]) {
        summary.gainLoss = withRupeePrefix(String(row[gainColumn]));
      }
      break;
    }
  }

  for (const row of blockRows) {
    const joined = row.join(" ");

    if (!summary.overallReturn && /Weighted\s*Avg/i.test(joined)) {
      const absoluteReturn = joined.match(
        /Abs\.?\s*Return\s*:\s*(-?[\d.,]+%)/i,
      );
      const annualReturn = joined.match(/Ann\.?\s*Return\s*:\s*(-?[\d.,]+%)/i);
      summary.overallReturn =
        (absoluteReturn ?? annualReturn)?.[1]?.trim() ?? "";
    }

    if (
      !summary.currentValue &&
      /Current\s*Value\s*of\s*your\s*Total/i.test(joined)
    ) {
      const match = joined.match(
        /Current\s*Value\s*of\s*your\s*Total\s*Investment\s*is\s*(?:\u20b9|Rs\.?)?\s*([\d.,]+)/i,
      );
      if (match) summary.currentValue = withRupeePrefix(match[1]);
    }

    if (
      !summary.gainLoss &&
      /Unrealised\s*Gain\s*\/\s*\(?Loss\)?\s*:/i.test(joined)
    ) {
      const match = joined.match(
        /Unrealised\s*Gain\s*\/\s*\(?Loss\)?\s*:\s*(?:\u20b9|Rs\.?)?\s*(-?[\d.,]+)/i,
      );
      if (match) summary.gainLoss = withRupeePrefix(match[1]);
    }
  }

  const holdings: InvestorHolding[] = [];
  if (tableHeaderIndex !== -1 && schemeColumn !== -1) {
    for (let index = tableHeaderIndex + 1; index < blockRows.length; index++) {
      const row = blockRows[index];
      const schemeName = String(row[schemeColumn] ?? "").trim();
      if (!schemeName || /^(grand\s*total|total|sub\s*total)/i.test(schemeName))
        continue;
      if (/weighted\s*avg|note\s*:|^\s*\u2022/i.test(schemeName)) continue;

      const holding: InvestorHolding = {
        schemeName,
        investments:
          investmentColumn === -1
            ? ""
            : String(row[investmentColumn] ?? "").trim(),
        currentValue:
          currentValueColumn === -1
            ? ""
            : String(row[currentValueColumn] ?? "").trim(),
        "unrealisedGain/Loss":
          gainColumn === -1 ? "" : String(row[gainColumn] ?? "").trim(),
        holdingPercentage:
          holdingColumn === -1 ? "" : String(row[holdingColumn] ?? "").trim(),
      };

      if (
        holding.investments ||
        holding.currentValue ||
        holding["unrealisedGain/Loss"] ||
        holding.holdingPercentage
      ) {
        holdings.push(holding);
      }
    }
  }

  return {
    investorName,
    investmentAmount: summary.investmentAmount ?? "",
    currentValue: summary.currentValue ?? "",
    gainLoss: summary.gainLoss ?? "",
    overallReturn: summary.overallReturn ?? "",
    holdings,
  };
}

export function splitInvestorBlocks(
  rawValues: readonly string[][],
): string[][][] {
  const reportHeaderIndices: number[] = [];
  rawValues.forEach((row, index) => {
    const joined = row.join(" ");
    if (
      /Mutual\s*Fund\s*Current\s*Holdings/i.test(joined) ||
      /Scheme\s*Wise\s*Summary/i.test(joined)
    ) {
      reportHeaderIndices.push(index);
    }
  });

  if (reportHeaderIndices.length >= 2) {
    return reportHeaderIndices.map((start, index) =>
      rawValues.slice(
        start,
        reportHeaderIndices[index + 1] ?? rawValues.length,
      ),
    );
  }

  const investorIndices = rawValues.reduce<number[]>((indices, row, index) => {
    if (/Investor\s*:/i.test(row.join(" "))) indices.push(index);
    return indices;
  }, []);

  if (investorIndices.length <= 1) return [Array.from(rawValues)];

  const boundaries = [0];
  for (let index = 0; index < investorIndices.length - 1; index++) {
    const current = investorIndices[index];
    const next = investorIndices[index + 1];
    let splitAt = next;

    for (let rowIndex = current + 1; rowIndex < next; rowIndex++) {
      const text = rawValues[rowIndex].join(" ");
      if (/Note\s*:/i.test(text) || /\u2022\s*This\s*Report/i.test(text)) {
        splitAt = rowIndex + 1;
      }
    }

    boundaries.push(splitAt);
  }
  boundaries.push(rawValues.length);

  return boundaries
    .slice(0, -1)
    .map((start, index) => rawValues.slice(start, boundaries[index + 1]));
}

export function parseInvestorReports(
  rawValues: readonly string[][],
): InvestorRecord[] {
  return splitInvestorBlocks(rawValues)
    .map(extractInvestorBlock)
    .filter((investor) => investor.investorName.trim().length > 0);
}
