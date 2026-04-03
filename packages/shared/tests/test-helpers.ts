import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export function createTestDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "aegis-test-"));
  return dir;
}

export function cleanTestDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

export function mockPaths(testDir: string) {
  return {
    owsDir: testDir,
    aegisDir: testDir,
    budgetLedger: join(testDir, "budget-ledger.json"),
    budgetConfig: join(testDir, "budget-config.json"),
    guardConfig: join(testDir, "guard-config.json"),
    policyLog: join(testDir, "policy-log.json"),
    deadswitchConfig: join(testDir, "deadswitch-config.json"),
    earningsLedger: join(testDir, "earnings-ledger.json"),
    messageBus: join(testDir, "messages.json"),
  } as const;
}
