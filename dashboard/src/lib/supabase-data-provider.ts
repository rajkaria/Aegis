/**
 * Supabase-backed data provider for authenticated users.
 * Queries are scoped to user_id via RLS.
 * Returns data in the same shape as the seed-data provider.
 */
import { createClient } from "@/lib/supabase/server";
import type {
  BudgetLedger,
  EarningsLedger,
  PolicyLog,
  BudgetConfig,
  LedgerEntry,
  EarningsEntry,
  PolicyLogEntry,
} from "@/lib/types";

// Helper: get Supabase client scoped to the current user session
async function getClient() {
  return createClient();
}

// ---------------------------------------------------------------------------
// Ledger (spending)
// ---------------------------------------------------------------------------

export async function readLedgerForUser(userId: string): Promise<BudgetLedger> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("ledger_entries")
    .select(`
      id, timestamp, chain_id, token, amount, tx_hash, tool, description,
      agents!inner(name)
    `)
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });

  if (error || !data) return { entries: [] };

  const entries: LedgerEntry[] = data.map((row: any) => ({
    timestamp: row.timestamp,
    apiKeyId: row.agents?.name ?? "unknown",
    chainId: row.chain_id,
    token: row.token,
    amount: String(row.amount),
    txHash: row.tx_hash ?? undefined,
    tool: row.tool ?? undefined,
    description: row.description ?? undefined,
  }));

  return { entries };
}

// ---------------------------------------------------------------------------
// Earnings
// ---------------------------------------------------------------------------

export async function readEarningsForUser(userId: string): Promise<EarningsLedger> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("earnings_entries")
    .select(`
      id, timestamp, endpoint, from_agent, token, amount, tx_hash,
      agents!inner(name)
    `)
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });

  if (error || !data) return { entries: [] };

  const entries: EarningsEntry[] = data.map((row: any) => ({
    timestamp: row.timestamp,
    agentId: row.agents?.name ?? "unknown",
    endpoint: row.endpoint,
    fromAgent: row.from_agent,
    token: row.token,
    amount: String(row.amount),
    txHash: row.tx_hash ?? undefined,
  }));

  return { entries };
}

// ---------------------------------------------------------------------------
// Policy log
// ---------------------------------------------------------------------------

export async function readPolicyLogForUser(userId: string): Promise<PolicyLog> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("policy_log")
    .select(`
      id, timestamp, policy_name, chain_id, allowed, reason, transaction_preview,
      agents(name)
    `)
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });

  if (error || !data) return { entries: [] };

  const entries: PolicyLogEntry[] = data.map((row: any) => ({
    timestamp: row.timestamp,
    policyName: row.policy_name,
    apiKeyId: row.agents?.name ?? "unknown",
    chainId: row.chain_id,
    allowed: row.allowed,
    reason: row.reason ?? undefined,
    transactionPreview: row.transaction_preview ?? undefined,
  }));

  return { entries };
}

// ---------------------------------------------------------------------------
// Budget config
// ---------------------------------------------------------------------------

export async function readBudgetConfigForUser(userId: string): Promise<BudgetConfig | null> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("budget_configs")
    .select("chain_id, token, daily_limit, weekly_limit, monthly_limit")
    .eq("user_id", userId);

  if (error || !data || data.length === 0) return null;

  return {
    limits: data.map((row: any) => ({
      chainId: row.chain_id,
      token: row.token,
      daily: row.daily_limit != null ? String(row.daily_limit) : undefined,
      weekly: row.weekly_limit != null ? String(row.weekly_limit) : undefined,
      monthly: row.monthly_limit != null ? String(row.monthly_limit) : undefined,
    })),
  };
}

// ---------------------------------------------------------------------------
// Agents list
// ---------------------------------------------------------------------------

export interface SupabaseAgent {
  id: string;
  name: string;
  displayName: string | null;
  status: string;
  metricsUrl: string | null;
  config: Record<string, unknown>;
}

export async function readAgentsForUser(userId: string): Promise<SupabaseAgent[]> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, display_name, status, metrics_url, config")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    status: row.status,
    metricsUrl: row.metrics_url,
    config: row.config ?? {},
  }));
}

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

export interface SupabaseWallet {
  id: string;
  agentId: string;
  agentName: string;
  chain: "solana" | "evm";
  publicAddress: string;
}

export async function readWalletsForUser(userId: string): Promise<SupabaseWallet[]> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("wallets")
    .select(`
      id, agent_id, chain, public_address,
      agents!inner(name)
    `)
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    agentId: row.agent_id,
    agentName: row.agents?.name ?? "unknown",
    chain: row.chain,
    publicAddress: row.public_address,
  }));
}
