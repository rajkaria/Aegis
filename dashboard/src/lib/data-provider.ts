/**
 * Data provider that reads from ~/.ows/aegis/ locally,
 * or falls back to in-memory store (which starts from bundled seed data) on Vercel.
 * If simulated cycles have been added via /api/simulate, the in-memory store takes
 * priority so the dashboard reflects those changes without requiring a filesystem.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type {
  BudgetLedger,
  EarningsLedger,
  PolicyLog,
  BudgetConfig,
  GuardConfig,
  DeadswitchConfig,
  MessageBus,
} from "@/lib/types";

// Bundled seed data (imported as JSON modules)
import bundledBudgetLedger from "@/data/budget-ledger.json";
import bundledEarningsLedger from "@/data/earnings-ledger.json";
import bundledPolicyLog from "@/data/policy-log.json";
import bundledBudgetConfig from "@/data/budget-config.json";
import bundledGuardConfig from "@/data/guard-config.json";
import bundledDeadswitchConfig from "@/data/deadswitch-config.json";
import bundledMessages from "@/data/messages.json";

// In-memory store — updated by /api/simulate, works on Vercel
import {
  getMemoryLedger,
  getMemoryEarnings,
  getMemoryPolicyLog,
  hasSimulatedData,
} from "@/lib/in-memory-store";

const AEGIS_DIR = join(homedir(), ".ows", "aegis");

function isLocal(): boolean {
  try {
    return existsSync(AEGIS_DIR);
  } catch {
    return false;
  }
}

function readLocal<T>(filename: string, fallback: T): T {
  try {
    const path = join(AEGIS_DIR, filename);
    if (!existsSync(path)) return fallback;
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export function readLedger(): BudgetLedger {
  // In-memory store takes priority when simulated data exists (Vercel or local after simulate)
  if (hasSimulatedData()) return getMemoryLedger() as BudgetLedger;
  if (isLocal()) return readLocal("budget-ledger.json", { entries: [] });
  return bundledBudgetLedger as BudgetLedger;
}

export function readEarningsLedger(): EarningsLedger {
  if (hasSimulatedData()) return getMemoryEarnings() as EarningsLedger;
  if (isLocal()) return readLocal("earnings-ledger.json", { entries: [] });
  return bundledEarningsLedger as EarningsLedger;
}

export function readPolicyLog(): PolicyLog {
  if (hasSimulatedData()) return getMemoryPolicyLog() as PolicyLog;
  if (isLocal()) return readLocal("policy-log.json", { entries: [] });
  return bundledPolicyLog as PolicyLog;
}

export function readBudgetConfig(): BudgetConfig | null {
  if (isLocal()) return readLocal<BudgetConfig | null>("budget-config.json", null);
  return bundledBudgetConfig as BudgetConfig;
}

export function readGuardConfig(): GuardConfig | null {
  if (isLocal()) return readLocal<GuardConfig | null>("guard-config.json", null);
  return bundledGuardConfig as GuardConfig;
}

export function readDeadswitchConfig(): DeadswitchConfig | null {
  if (isLocal()) return readLocal<DeadswitchConfig | null>("deadswitch-config.json", null);
  return bundledDeadswitchConfig as DeadswitchConfig;
}

export function readMessages(): MessageBus {
  if (isLocal()) return readLocal("messages.json", { messages: [] });
  return bundledMessages as MessageBus;
}
