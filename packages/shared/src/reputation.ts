import { readLedger } from "./ledger.js";
import { readEarningsLedger } from "./earnings.js";
import { readPolicyLog } from "./policy-log.js";
import { readReceipts } from "./receipts.js";

export interface AgentReputation {
  agentId: string;
  score: number;          // 0-100
  totalTransactions: number;
  successfulPayments: number;
  blockedTransactions: number;
  receiptsAnchored: number;
  level: "new" | "trusted" | "verified" | "elite";
}

export function computeReputation(agentId: string): AgentReputation {
  const ledger = readLedger();
  const earnings = readEarningsLedger();
  const policyLog = readPolicyLog();
  const receipts = readReceipts();

  // Count successful payments (as buyer + seller)
  const asBuyer = ledger.entries.filter(e => e.apiKeyId === agentId).length;
  const asSeller = earnings.entries.filter(e => e.agentId === agentId).length;
  const successfulPayments = asBuyer + asSeller;

  // Count blocked transactions
  const blocked = policyLog.entries.filter(e => e.apiKeyId === agentId && !e.allowed).length;
  const passed = policyLog.entries.filter(e => e.apiKeyId === agentId && e.allowed).length;

  // Count anchored receipts (on-chain proof)
  const anchored = receipts.receipts.filter(
    r => (r.from === agentId || r.to === agentId) && r.status === "anchored"
  ).length;

  const totalTransactions = successfulPayments + blocked;

  // Score calculation (0-100):
  // Base: 50 points for having any activity
  // +20 for success rate (successful / total)
  // +15 for volume (capped at 15 for 10+ transactions)
  // +15 for on-chain receipts (capped at 15 for 3+ receipts)
  // -10 per block (capped at -30)
  let score = 0;

  if (totalTransactions > 0) {
    score += 50; // Active agent
    const successRate = successfulPayments / Math.max(totalTransactions, 1);
    score += Math.round(successRate * 20);
    score += Math.min(Math.round((successfulPayments / 10) * 15), 15);
    score += Math.min(Math.round((anchored / 3) * 15), 15);
    score -= Math.min(blocked * 10, 30);
    score = Math.max(0, Math.min(100, score));
  }

  const level: AgentReputation["level"] =
    score >= 85 ? "elite" :
    score >= 65 ? "verified" :
    score >= 40 ? "trusted" : "new";

  return {
    agentId,
    score,
    totalTransactions,
    successfulPayments,
    blockedTransactions: blocked,
    receiptsAnchored: anchored,
    level,
  };
}

export function computeAllReputations(): AgentReputation[] {
  const ledger = readLedger();
  const earnings = readEarningsLedger();
  const agentIds = new Set<string>();
  for (const e of ledger.entries) agentIds.add(e.apiKeyId);
  for (const e of earnings.entries) agentIds.add(e.agentId);
  return Array.from(agentIds).map(id => computeReputation(id));
}
