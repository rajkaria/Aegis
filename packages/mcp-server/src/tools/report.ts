import { z } from "zod";
import { readLedger } from "@aegis-ows/shared";
import type { LedgerEntry } from "@aegis-ows/shared";

export const spendingReportSchema = {
  walletName: z.string().describe("Wallet name to generate report for"),
  period: z
    .enum(["today", "week", "month", "all"])
    .optional()
    .describe("Time period to report on"),
  format: z
    .enum(["summary", "detailed", "csv"])
    .optional()
    .describe("Output format (default: summary)"),
};

function getPeriodCutoff(period: "today" | "week" | "month" | "all"): Date | null {
  const now = new Date();
  if (period === "today") {
    const cutoff = new Date(now);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  } else if (period === "week") {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  } else if (period === "month") {
    const cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    return cutoff;
  }
  return null; // all time
}

export async function spendingReportHandler(params: {
  walletName: string;
  period?: "today" | "week" | "month" | "all";
  format?: "summary" | "detailed" | "csv";
}): Promise<{ content: [{ type: "text"; text: string }] }> {
  const { walletName, period = "all", format = "summary" } = params;

  const ledger = readLedger();
  const cutoff = getPeriodCutoff(period);

  const entries = ledger.entries.filter((e) => {
    if (e.apiKeyId !== walletName) return false;
    if (cutoff && new Date(e.timestamp) < cutoff) return false;
    return true;
  });

  if (entries.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No spending records found for wallet "${walletName}" in period "${period}".`,
        },
      ],
    };
  }

  if (format === "csv") {
    const header = "timestamp,chain,token,amount,tool,description";
    const rows = entries.map((e) =>
      [
        e.timestamp,
        e.chainId,
        e.token,
        e.amount,
        e.tool ?? "",
        `"${(e.description ?? "").replace(/"/g, '""')}"`,
      ].join(",")
    );
    return {
      content: [{ type: "text", text: [header, ...rows].join("\n") }],
    };
  }

  if (format === "detailed") {
    const lines: string[] = [
      `Spending Report: ${walletName}`,
      `Period: ${period}`,
      `Entries: ${entries.length}`,
      "",
    ];
    for (const e of entries) {
      lines.push(
        `[${e.timestamp}] ${e.amount} ${e.token} on ${e.chainId}${e.tool ? ` via ${e.tool}` : ""}${e.description ? ` — ${e.description}` : ""}`
      );
    }
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }

  // summary format
  const total = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Aggregate by chain + token
  const byChain: Record<string, number> = {};
  for (const e of entries) {
    const key = `${e.chainId}:${e.token}`;
    byChain[key] = (byChain[key] ?? 0) + parseFloat(e.amount);
  }

  const lines: string[] = [
    `Spending Report: ${walletName}`,
    `Period: ${period}`,
    `Total transactions: ${entries.length}`,
    `Total spent: ${total.toFixed(6)}`,
    "",
    "By chain/token:",
  ];

  for (const [key, amount] of Object.entries(byChain)) {
    const [chainId, token] = key.split(":");
    lines.push(`  ${chainId} / ${token}: ${amount.toFixed(6)}`);
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}
