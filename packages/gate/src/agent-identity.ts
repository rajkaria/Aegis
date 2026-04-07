import { readEarningsLedger, readLedger, computeReputation } from "@aegis-ows/shared";
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

export function buildAgentIdentity(agentId: string, walletAddresses?: Record<string, string>): AgentIdentity {
  const earnings = readEarningsLedger();
  const spending = readLedger();

  // Get services this agent sells
  const serviceMap = new Map<string, { price: string; token: string; count: number }>();
  for (const e of earnings.entries.filter(e => e.agentId === agentId)) {
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

  // Compute reputation
  let reputation = { score: 0, level: "new" as string, totalTransactions: 0 };
  try {
    const rep = computeReputation(agentId);
    reputation = { score: rep.score, level: rep.level, totalTransactions: rep.totalTransactions };
  } catch { /* no data yet */ }

  // Compute stats
  const rev = earnings.entries.filter(e => e.agentId === agentId).reduce((s, e) => s + parseFloat(e.amount), 0);
  const spend = spending.entries.filter(e => e.apiKeyId === agentId).reduce((s, e) => s + parseFloat(e.amount), 0);

  const allTimestamps = [
    ...earnings.entries.filter(e => e.agentId === agentId).map(e => e.timestamp),
    ...spending.entries.filter(e => e.apiKeyId === agentId).map(e => e.timestamp),
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

export function createBusinessCard(agentId: string, walletAddresses?: Record<string, string>): AgentBusinessCard {
  return {
    type: "business_card",
    identity: buildAgentIdentity(agentId, walletAddresses),
    timestamp: new Date().toISOString(),
  };
}
