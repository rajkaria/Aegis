import { z } from "zod";
import { readBudgetConfig, readLedger, getSpentInPeriod } from "@aegis-ows/shared";

export const checkBudgetSchema = {
  walletName: z.string().describe("Name of the wallet to check"),
  chain: z.string().optional().describe("Filter by chain ID"),
  period: z.enum(["daily", "weekly", "monthly"]).optional().describe("Budget period to check"),
};

export async function checkBudgetHandler(params: {
  walletName: string;
  chain?: string;
  period?: "daily" | "weekly" | "monthly";
}): Promise<{ content: [{ type: "text"; text: string }] }> {
  const { walletName, chain, period } = params;

  const config = readBudgetConfig();
  const ledger = readLedger();

  if (!config) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ walletName, budgets: [], message: "No budget config found" }),
        },
      ],
    };
  }

  const periods: Array<"daily" | "weekly" | "monthly"> = period
    ? [period]
    : ["daily", "weekly", "monthly"];

  const budgets: Array<{
    chain: string;
    token: string;
    period: string;
    spent: string;
    limit: string;
    remaining: string;
  }> = [];

  for (const limit of config.limits) {
    if (chain && limit.chainId !== chain) continue;

    for (const p of periods) {
      const limitAmount = limit[p];
      if (!limitAmount) continue;

      const spent = getSpentInPeriod(ledger, walletName, limit.chainId, limit.token, p);
      const limitNum = parseFloat(limitAmount);
      const remaining = Math.max(0, limitNum - spent);

      budgets.push({
        chain: limit.chainId,
        token: limit.token,
        period: p,
        spent: spent.toFixed(6),
        limit: limitAmount,
        remaining: remaining.toFixed(6),
      });
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ walletName, budgets }, null, 2),
      },
    ],
  };
}
