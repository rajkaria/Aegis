import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { PATHS, ensureAegisDir } from "./paths.js";
import type { EarningsLedger, EarningsEntry } from "./types.js";
import { withFileLock } from "./file-lock.js";

export function readEarningsLedger(): EarningsLedger {
  if (!existsSync(PATHS.earningsLedger)) return { entries: [] };
  return JSON.parse(readFileSync(PATHS.earningsLedger, "utf-8")) as EarningsLedger;
}

export function appendEarningsEntry(entry: EarningsEntry): void {
  withFileLock(PATHS.earningsLedger, () => {
    ensureAegisDir();
    const ledger = readEarningsLedger();
    ledger.entries.push(entry);
    writeFileSync(PATHS.earningsLedger, JSON.stringify(ledger, null, 2));
  });
}

export function getEarningsByAgent(agentId: string): EarningsEntry[] {
  return readEarningsLedger().entries.filter(e => e.agentId === agentId);
}
