/**
 * Write config files to ~/.ows/aegis/.
 * Works locally; on Vercel (no filesystem) the API route catches the error gracefully.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { BudgetConfig, GuardConfig, DeadswitchConfig } from "@/lib/types";

const AEGIS_DIR = join(homedir(), ".ows", "aegis");

function ensureDir(): void {
  if (!existsSync(AEGIS_DIR)) {
    mkdirSync(AEGIS_DIR, { recursive: true });
  }
}

export function writeBudgetConfig(config: BudgetConfig): void {
  ensureDir();
  writeFileSync(join(AEGIS_DIR, "budget-config.json"), JSON.stringify(config, null, 2));
}

export function writeGuardConfig(config: GuardConfig): void {
  ensureDir();
  writeFileSync(join(AEGIS_DIR, "guard-config.json"), JSON.stringify(config, null, 2));
}

export function writeDeadswitchConfig(config: DeadswitchConfig): void {
  ensureDir();
  writeFileSync(join(AEGIS_DIR, "deadswitch-config.json"), JSON.stringify(config, null, 2));
}
