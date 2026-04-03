import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync, existsSync } from "node:fs";

const OWS_DIR = join(homedir(), ".ows");
const AEGIS_DIR = join(OWS_DIR, "aegis");

export const PATHS = {
  owsDir: OWS_DIR,
  aegisDir: AEGIS_DIR,
  budgetLedger: join(AEGIS_DIR, "budget-ledger.json"),
  budgetConfig: join(AEGIS_DIR, "budget-config.json"),
  guardConfig: join(AEGIS_DIR, "guard-config.json"),
  policyLog: join(AEGIS_DIR, "policy-log.json"),
  deadswitchConfig: join(AEGIS_DIR, "deadswitch-config.json"),
  earningsLedger: join(AEGIS_DIR, "earnings-ledger.json"),
} as const;

export function ensureAegisDir(): void {
  if (!existsSync(AEGIS_DIR)) {
    mkdirSync(AEGIS_DIR, { recursive: true });
  }
}
