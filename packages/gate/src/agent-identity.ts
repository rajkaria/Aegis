import { getXMTPAddress } from "./xmtp-transport.js";

export interface AgentIdentity {
  agentId: string;
  xmtpAddress: string | null;
  walletAddresses: Record<string, string>;
  services: Array<{
    endpoint: string;
    price: string;
    token: string;
    description: string;
  }>;
  reputation: {
    score: number;
    level: string;
    totalTransactions: number;
  };
  stats: {
    totalRevenue: number;
    totalSpending: number;
    profitLoss: number;
    activeSince: string | null;
  };
  slaTerms?: {
    maxResponseTimeMs: number;
    minUptime: number;
  };
}

export interface AgentBusinessCard {
  type: "business_card";
  identity: AgentIdentity;
  timestamp: string;
  signature?: string;
}

/** Optional ledger data — pass these to enrich identity with payment history */
export interface AgentLedgerData {
  earnings?: Array<{ agentId: string; endpoint: string; amount: string; token: string; timestamp: string }>;
  spending?: Array<{ apiKeyId: string; amount: string; timestamp: string }>;
  reputation?: { score: number; level: string; totalTransactions: number };
}

/**
 * Build an agent identity profile.
 * Works standalone with zero dependencies — pass optional ledgerData to enrich with payment history.
 * When used with the full Aegis gate, ledger data is loaded automatically.
 */
export function buildAgentIdentity(
  agentId: string,
  walletAddresses?: Record<string, string>,
  ledgerData?: AgentLedgerData,
): AgentIdentity {
  const earningsEntries = ledgerData?.earnings ?? [];
  const spendingEntries = ledgerData?.spending ?? [];

  // Get services this agent sells
  const serviceMap = new Map<string, { price: string; token: string; count: number }>();
  for (const e of earningsEntries.filter(e => e.agentId === agentId)) {
    if (!serviceMap.has(e.endpoint)) {
      serviceMap.set(e.endpoint, { price: e.amount, token: e.token, count: 0 });
    }
    serviceMap.get(e.endpoint)!.count++;
  }

  const services = Array.from(serviceMap.entries()).map(([endpoint, data]) => ({
    endpoint,
    price: data.price,
    token: data.token,
    description: `${endpoint} (${data.count} calls served)`,
  }));

  // Use provided reputation or default
  const reputation = ledgerData?.reputation ?? { score: 0, level: "new", totalTransactions: 0 };

  // Compute stats from ledger data
  const rev = earningsEntries.filter(e => e.agentId === agentId).reduce((s, e) => s + parseFloat(e.amount), 0);
  const spend = spendingEntries.filter(e => e.apiKeyId === agentId).reduce((s, e) => s + parseFloat(e.amount), 0);

  const allTimestamps = [
    ...earningsEntries.filter(e => e.agentId === agentId).map(e => e.timestamp),
    ...spendingEntries.filter(e => e.apiKeyId === agentId).map(e => e.timestamp),
  ].sort();

  return {
    agentId,
    xmtpAddress: getXMTPAddress(),
    walletAddresses: walletAddresses ?? {},
    services,
    reputation,
    stats: {
      totalRevenue: rev,
      totalSpending: spend,
      profitLoss: rev - spend,
      activeSince: allTimestamps[0] ?? null,
    },
  };
}

/**
 * Build identity with automatic ledger loading (requires full Aegis installation).
 * Falls back gracefully if ledger files don't exist.
 */
export function buildAgentIdentityFromLedger(agentId: string, walletAddresses?: Record<string, string>): AgentIdentity {
  try {
    const { readEarningsLedger, readLedger, computeReputation } = require("@aegis-ows/shared");
    const earnings = readEarningsLedger();
    const spending = readLedger();
    let reputation: { score: number; level: string; totalTransactions: number } | undefined;
    try {
      reputation = computeReputation(agentId);
    } catch { /* no data yet */ }

    return buildAgentIdentity(agentId, walletAddresses, {
      earnings: earnings.entries,
      spending: spending.entries,
      reputation,
    });
  } catch {
    // Shared package not available or no ledger data — return empty identity
    return buildAgentIdentity(agentId, walletAddresses);
  }
}

export function createBusinessCard(
  agentId: string,
  walletAddresses?: Record<string, string>,
  ledgerData?: AgentLedgerData,
): AgentBusinessCard {
  return {
    type: "business_card",
    identity: buildAgentIdentity(agentId, walletAddresses, ledgerData),
    timestamp: new Date().toISOString(),
  };
}
