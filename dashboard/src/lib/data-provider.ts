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

// ---------------------------------------------------------------------------
// Async facade — userId → Supabase, no userId → seed/local data
// ---------------------------------------------------------------------------

import {
  readLedgerForUser,
  readEarningsForUser,
  readPolicyLogForUser,
  readBudgetConfigForUser,
} from "@/lib/supabase-data-provider";

export async function readLedgerAsync(userId?: string): Promise<BudgetLedger> {
  if (userId) return readLedgerForUser(userId);
  return readLedger();
}

export async function readEarningsLedgerAsync(userId?: string): Promise<EarningsLedger> {
  if (userId) return readEarningsForUser(userId);
  return readEarningsLedger();
}

export async function readPolicyLogAsync(userId?: string): Promise<PolicyLog> {
  if (userId) return readPolicyLogForUser(userId);
  return readPolicyLog();
}

export async function readBudgetConfigAsync(userId?: string): Promise<BudgetConfig | null> {
  if (userId) return readBudgetConfigForUser(userId);
  return readBudgetConfig();
}

// ---------------------------------------------------------------------------
// Live metrics from Railway agents (optional)
// ---------------------------------------------------------------------------

export interface LiveAgentMetrics {
  agent: string;
  earned: number;
  costs?: number;
  calls: number;
  netMargin: number;
  solanaAddress: string;
  evmAddress: string;
  txHistory: Array<{ timestamp: string; amount: number; txHash: string; topic?: string; revenue?: number; cost?: number; net?: number }>;
  reachable: boolean;
}

async function fetchAgentMetrics(url: string): Promise<LiveAgentMetrics | null> {
  try {
    const res = await fetch(`${url}/metrics`, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json() as Omit<LiveAgentMetrics, "reachable">;
    return { ...data, reachable: true };
  } catch {
    return null;
  }
}

/**
 * Fetch live metrics from a single deployed Railway agent.
 * Set METRICS_URL to the agent's public Railway URL.
 * Falls back to null if not set or unreachable.
 */
export async function readLiveMetrics(): Promise<LiveAgentMetrics | null> {
  const metricsUrl = process.env.METRICS_URL;
  if (!metricsUrl) return null;
  return fetchAgentMetrics(metricsUrl);
}

/**
 * Fetch live metrics from all configured Railway agents.
 * Uses ANALYST_URL (or METRICS_URL fallback) and DATA_MINER_URL env vars.
 */
export async function readAllLiveMetrics(): Promise<LiveAgentMetrics[]> {
  const agentUrls = [
    process.env.ANALYST_URL ?? process.env.METRICS_URL,
    process.env.DATA_MINER_URL,
  ].filter(Boolean) as string[];

  if (agentUrls.length === 0) return [];

  const results = await Promise.allSettled(agentUrls.map(fetchAgentMetrics));
  return results
    .filter((r): r is PromiseFulfilledResult<LiveAgentMetrics> => r.status === "fulfilled" && r.value !== null)
    .map(r => r.value);
}
