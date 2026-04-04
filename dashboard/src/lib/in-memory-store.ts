/**
 * In-memory store that starts from bundled seed data and allows mutations.
 * Works on Vercel where there is no filesystem.
 */
import bundledLedger from "@/data/budget-ledger.json";
import bundledEarnings from "@/data/earnings-ledger.json";
import bundledPolicyLog from "@/data/policy-log.json";

// Clone the bundled data as starting state so mutations don't affect the original imports
let ledgerEntries: any[] = [...(bundledLedger as any).entries];
let earningsEntries: any[] = [...(bundledEarnings as any).entries];
let policyLogEntries: any[] = [...(bundledPolicyLog as any).entries];

export function getMemoryLedger() {
  return { entries: ledgerEntries };
}

export function getMemoryEarnings() {
  return { entries: earningsEntries };
}

export function getMemoryPolicyLog() {
  return { entries: policyLogEntries };
}

/** Returns true if any simulated cycles have been added beyond bundled seed data. */
export function hasSimulatedData() {
  return (
    ledgerEntries.length > (bundledLedger as any).entries.length ||
    earningsEntries.length > (bundledEarnings as any).entries.length ||
    policyLogEntries.length > (bundledPolicyLog as any).entries.length
  );
}

export function addSimulatedCycle() {
  const now = new Date();
  const ts1 = now.toISOString();
  const ts2 = new Date(now.getTime() + 100).toISOString();

  // research-buyer pays analyst
  ledgerEntries.push({
    timestamp: ts1,
    apiKeyId: "research-buyer",
    chainId: "solana:devnet",
    token: "SOL",
    amount: "0.005",
    tool: "http://analyst:4002/analyze",
    description: "x402 payment to analyst for /analyze",
    txHash: `sim-${Date.now()}-1`,
  });

  earningsEntries.push({
    timestamp: ts1,
    agentId: "analyst",
    endpoint: "/analyze",
    fromAgent: "research-buyer",
    token: "SOL",
    amount: "0.005",
    txHash: `sim-${Date.now()}-1`,
  });

  // analyst pays data-miner
  ledgerEntries.push({
    timestamp: ts2,
    apiKeyId: "analyst",
    chainId: "solana:devnet",
    token: "SOL",
    amount: "0.001",
    tool: "http://data-miner:4001/scrape",
    description: "x402 payment to data-miner for /scrape",
    txHash: `sim-${Date.now()}-2`,
  });

  earningsEntries.push({
    timestamp: ts2,
    agentId: "data-miner",
    endpoint: "/scrape",
    fromAgent: "analyst",
    token: "SOL",
    amount: "0.001",
    txHash: `sim-${Date.now()}-2`,
  });

  // Policy log
  policyLogEntries.push({
    timestamp: ts1,
    policyName: "aegis-budget",
    apiKeyId: "research-buyer",
    chainId: "solana:devnet",
    allowed: true,
    reason: "Within daily budget",
  });

  policyLogEntries.push({
    timestamp: ts2,
    policyName: "aegis-guard",
    apiKeyId: "analyst",
    chainId: "solana:devnet",
    allowed: true,
    reason: "Address on allowlist",
  });

  return {
    cycle: {
      buyer_spent: "0.005 SOL",
      analyst_earned: "0.005 SOL",
      analyst_spent: "0.001 SOL",
      miner_earned: "0.001 SOL",
    },
    timestamp: ts1,
  };
}
