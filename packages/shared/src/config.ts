import { readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import type { BudgetConfig, GuardConfig, ApproveConfig } from "./types.js";
import { PATHS, ensureAegisDir } from "./paths.js";

// === Budget Config ===

export function readBudgetConfig(): BudgetConfig | null {
  if (!existsSync(PATHS.budgetConfig)) {
    return null;
  }
  try {
    const raw = readFileSync(PATHS.budgetConfig, "utf-8");
    return JSON.parse(raw) as BudgetConfig;
  } catch {
    return null;
  }
}

export function writeBudgetConfig(config: BudgetConfig): void {
  ensureAegisDir();
  writeFileSync(PATHS.budgetConfig, JSON.stringify(config, null, 2), "utf-8");
}

// === Guard Config ===

export function readGuardConfig(): GuardConfig | null {
  if (!existsSync(PATHS.guardConfig)) {
    return null;
  }
  try {
    const raw = readFileSync(PATHS.guardConfig, "utf-8");
    return JSON.parse(raw) as GuardConfig;
  } catch {
    return null;
  }
}

export function writeGuardConfig(config: GuardConfig): void {
  ensureAegisDir();
  writeFileSync(PATHS.guardConfig, JSON.stringify(config, null, 2), "utf-8");
}

// === Approve Config ===

export function readApproveConfig(): ApproveConfig | null {
  if (!existsSync(PATHS.approveConfig)) {
    return null;
  }
  try {
    const raw = readFileSync(PATHS.approveConfig, "utf-8");
    return JSON.parse(raw) as ApproveConfig;
  } catch {
    return null;
  }
}

export function writeApproveConfig(config: ApproveConfig): void {
  ensureAegisDir();
  writeFileSync(PATHS.approveConfig, JSON.stringify(config, null, 2), "utf-8");
}
