import { readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import type { BudgetLedger, LedgerEntry } from "./types.js";
import { PATHS, ensureAegisDir } from "./paths.js";

export function readLedger(): BudgetLedger {
  if (!existsSync(PATHS.budgetLedger)) {
    return { entries: [] };
  }
  try {
    const raw = readFileSync(PATHS.budgetLedger, "utf-8");
    return JSON.parse(raw) as BudgetLedger;
  } catch {
    return { entries: [] };
  }
}

export function appendLedgerEntry(entry: LedgerEntry): void {
  ensureAegisDir();
  const ledger = readLedger();
  ledger.entries.push(entry);
  writeFileSync(PATHS.budgetLedger, JSON.stringify(ledger, null, 2), "utf-8");
}

export function getSpentInPeriod(
  ledger: BudgetLedger,
  apiKeyId: string,
  chainId: string,
  token: string,
  period: "daily" | "weekly" | "monthly"
): number {
  const now = new Date();
  let cutoff: Date;

  if (period === "daily") {
    cutoff = new Date(now);
    cutoff.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    cutoff = new Date(now);
    cutoff.setDate(now.getDate() - now.getDay());
    cutoff.setHours(0, 0, 0, 0);
  } else {
    cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return ledger.entries
    .filter(
      (e) =>
        e.apiKeyId === apiKeyId &&
        e.chainId === chainId &&
        e.token === token &&
        new Date(e.timestamp) >= cutoff
    )
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
}
