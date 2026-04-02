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
  approveConfig: join(AEGIS_DIR, "approve-config.json"),
  pendingApprovals: join(AEGIS_DIR, "pending-approvals.json"),
  serviceRegistry: join(AEGIS_DIR, "service-registry.json"),
  policyLog: join(AEGIS_DIR, "policy-log.json"),
  mppSessions: join(AEGIS_DIR, "mpp-sessions.json"),
} as const;

export function ensureAegisDir(): void {
  if (!existsSync(AEGIS_DIR)) {
    mkdirSync(AEGIS_DIR, { recursive: true });
  }
}
