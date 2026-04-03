import { readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import type { BudgetConfig, GuardConfig, DeadswitchConfig } from "./types.js";
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

// === Deadswitch Config ===

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(path: string, data: unknown): void {
  ensureAegisDir();
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

export function readDeadswitchConfig(): DeadswitchConfig | null {
  return readJson<DeadswitchConfig | null>(PATHS.deadswitchConfig, null);
}

export function writeDeadswitchConfig(config: DeadswitchConfig): void {
  writeJson(PATHS.deadswitchConfig, config);
}

export function updateHeartbeat(): void {
  const config = readDeadswitchConfig();
  if (config) {
    config.lastHeartbeat = new Date().toISOString();
    writeDeadswitchConfig(config);
  }
}
