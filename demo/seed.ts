import {
  ensureAegisDir,
  writeBudgetConfig,
  writeGuardConfig,
  writeDeadswitchConfig,
  appendLedgerEntry,
  appendEarningsEntry,
  appendPolicyLog,
  postMessage,
  PATHS,
} from "@aegis-ows/shared";
import { writeFileSync } from "node:fs";

console.log("Seeding Aegis v2 economy data...\n");
ensureAegisDir();

// Clear existing data
writeFileSync(PATHS.budgetLedger, JSON.stringify({ entries: [] }));
writeFileSync(PATHS.earningsLedger, JSON.stringify({ entries: [] }));
writeFileSync(PATHS.policyLog, JSON.stringify({ entries: [] }));
writeFileSync(PATHS.messageBus, JSON.stringify({ messages: [] }));

// 1. Budget config
writeBudgetConfig({
  limits: [
    { chainId: "eip155:8453", token: "USDC", daily: "0.50", monthly: "10.00" },
    { chainId: "*", token: "*", daily: "1.00" },
  ],
});
console.log("Budget: $0.50/day USDC on Base, $1.00/day global");

// 2. Guard config
writeGuardConfig({
  mode: "allowlist",
  addresses: {
    "eip155:8453": ["0xUSDC_BASE", "0xUNISWAP_BASE"],
    "eip155:1": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
  },
  blockAddresses: ["0xDEADBEEF0000000000000000000000000000SCAM"],
});
console.log("Guard: allowlist mode with known contracts");

// 3. Deadswitch config
writeDeadswitchConfig({
  maxInactiveMinutes: 30,
  onTrigger: "revoke_key",
  sweepFunds: false,
  enabled: true,
  lastHeartbeat: new Date().toISOString(),
});
console.log("Deadswitch: 30min timeout, enabled");

// 4. Seed the 3-agent supply chain transactions (3 real on-chain cycles)
// research-buyer pays analyst, analyst pays data-miner
// Using real Solana devnet tx hashes from executed on-chain transfers
const baseTime = Date.now();

// Real devnet tx hashes for 3 supply chain cycles (txs 1–6 from executed transfers)
// Cycle 1: tx1 (research-buyer → analyst 0.005 SOL), tx2 (analyst → data-miner 0.001 SOL)
// Cycle 2: tx3 (research-buyer → analyst 0.005 SOL), tx4 (analyst → data-miner 0.001 SOL)
// Cycle 3: tx5 (research-buyer → analyst 0.005 SOL), tx6 (analyst → data-miner 0.001 SOL)
const cycles = [
  {
    buyerToAnalystTx: "JEX7PjWZLia2NpRVSZGFBUvhqP6cqXMWv5NKXHf2JjZZxkim8Ni5wuiVziNmdLwo4kBLVV7pGM1X3cnhywqb5GA",
    analystToMinerTx: "zBARyaWkhfedVrnXEWB9LzGCERwWfkeXm5Fk3GuFJ1fuW2JBxiUDHmHC7NQF3Jz26C9nBJAy5EFDdCkv7iLGB7V",
  },
  {
    buyerToAnalystTx: "5tsNpRhnaksJ5BXUdjNMfDA7oZUWAy1YXJB1AAbTcHCz7gqj8pGHKuFheuqGb4j1g2jvdncgX87PMrbEe3WKCXbj",
    analystToMinerTx: "QyxHktA6QsaNGVYFepaqRgipquAiSPL7bwh73fHMBAE1mqfFDwvUopf3tJkSAq8cEW7Ary7yENQ4T3JxyjhCSxN",
  },
  {
    buyerToAnalystTx: "sGwQzNQAD2zfJ3JLhinjAoNHzQGHMwZ72UYw6XWxufrhaypSrdtPbmHdXtVc9qb58mNJKJNE9A6zHf1gTo2Mmby",
    analystToMinerTx: "3QVCwpJJoKgkQZc4fp5G3FrnHY5HqrRANtiMCRVGwjbkDnWXKgxcGDDcZkknqwPr1UdXdhEVz2gKh8hjyvHVu4eW",
  },
];

for (let i = 0; i < cycles.length; i++) {
  const ts = new Date(baseTime - (cycles.length - i) * 300000).toISOString(); // 5min apart
  const { buyerToAnalystTx, analystToMinerTx } = cycles[i];

  // research-buyer pays analyst 0.005 SOL
  appendLedgerEntry({
    timestamp: ts,
    apiKeyId: "research-buyer",
    chainId: "solana:devnet",
    token: "SOL",
    amount: "0.005",
    tool: "http://localhost:4002/analyze",
    description: "x402 payment to analyst for /analyze",
    txHash: buyerToAnalystTx,
  });

  appendEarningsEntry({
    timestamp: ts,
    agentId: "analyst",
    endpoint: "/analyze",
    fromAgent: "research-buyer",
    token: "SOL",
    amount: "0.005",
    txHash: buyerToAnalystTx,
  });

  // analyst pays data-miner 0.001 SOL
  const ts2 = new Date(new Date(ts).getTime() + 100).toISOString();
  appendLedgerEntry({
    timestamp: ts2,
    apiKeyId: "analyst",
    chainId: "solana:devnet",
    token: "SOL",
    amount: "0.001",
    tool: "http://localhost:4001/scrape",
    description: "x402 payment to data-miner for /scrape",
    txHash: analystToMinerTx,
  });

  appendEarningsEntry({
    timestamp: ts2,
    agentId: "data-miner",
    endpoint: "/scrape",
    fromAgent: "analyst",
    token: "SOL",
    amount: "0.001",
    txHash: analystToMinerTx,
  });
}

console.log("Seeded 6 ledger + 6 earnings entries (3 real on-chain Solana devnet cycles)");

// 5. Seed policy log
const policyEvents = [
  { policyName: "aegis-budget", apiKeyId: "research-buyer", allowed: true },
  { policyName: "aegis-guard", apiKeyId: "analyst", allowed: true },
  { policyName: "aegis-budget", apiKeyId: "research-buyer", allowed: false, reason: "Daily USDC limit on eip155:8453 exceeded: $0.52/$0.50" },
  { policyName: "aegis-deadswitch", apiKeyId: "data-miner", allowed: true, reason: "Heartbeat OK (2min since last activity)" },
  { policyName: "aegis-guard", apiKeyId: "research-buyer", allowed: true },
  { policyName: "aegis-budget", apiKeyId: "analyst", allowed: true },
  { policyName: "aegis-guard", apiKeyId: "analyst", allowed: false, reason: "Address 0xUNKNOWN not in allowlist for eip155:8453" },
  { policyName: "aegis-deadswitch", apiKeyId: "analyst", allowed: true, reason: "Heartbeat OK (5min since last activity)" },
];

for (let i = 0; i < policyEvents.length; i++) {
  appendPolicyLog({
    timestamp: new Date(baseTime - (8 - i) * 600000).toISOString(),
    chainId: "eip155:8453",
    ...policyEvents[i],
  });
}
console.log(`Seeded ${policyEvents.length} policy log entries`);

// 6. Seed XMTP message bus — service discovery flow
postMessage({
  type: "service_announcement",
  agentId: "data-miner",
  timestamp: new Date(baseTime - 3600000).toISOString(), // 1 hour ago
  services: [
    {
      endpoint: "/scrape",
      price: "0.01",
      token: "USDC",
      description: "Web scraping service — scrape and parse any URL",
      baseUrl: "http://localhost:4001",
    },
  ],
});

postMessage({
  type: "service_announcement",
  agentId: "analyst",
  timestamp: new Date(baseTime - 3000000).toISOString(), // 50 min ago
  services: [
    {
      endpoint: "/analyze",
      price: "0.05",
      token: "USDC",
      description: "AI-powered market analysis — buys raw data from data-miner",
      baseUrl: "http://localhost:4002",
    },
  ],
});

postMessage({
  type: "service_query",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 2400000).toISOString(), // 40 min ago
  query: "analysis",
});

postMessage({
  type: "service_response",
  agentId: "analyst",
  timestamp: new Date(baseTime - 2399000).toISOString(),
  inResponseTo: "research-buyer",
  matches: [
    {
      endpoint: "/analyze",
      price: "0.05",
      description: "AI-powered market analysis — buys raw data from data-miner",
      fullUrl: "http://localhost:4002/analyze",
    },
  ],
});

postMessage({
  type: "service_query",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 1800000).toISOString(), // 30 min ago
  query: "scrape",
});

// 6b. Negotiation offer + response
postMessage({
  type: "negotiation_offer",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 2350000).toISOString(),
  toAgent: "analyst",
  service: "/analyze",
  offeredPrice: "0.04",
  originalPrice: "0.05",
  reason: "Budget constraint — requesting 20% discount",
});

postMessage({
  type: "negotiation_response",
  agentId: "analyst",
  timestamp: new Date(baseTime - 2340000).toISOString(),
  toAgent: "research-buyer",
  accepted: false,
  counterPrice: "0.045",
  reason: "Can offer 10% discount for repeat buyers",
});

// 6c. Health ping/pong pairs
postMessage({
  type: "health_ping",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 2300000).toISOString(),
  targetAgent: "analyst",
});

postMessage({
  type: "health_pong",
  agentId: "analyst",
  timestamp: new Date(baseTime - 2299000).toISOString(),
  targetAgent: "research-buyer",
  status: "online",
  queueDepth: 2,
  uptime: "3600s",
});

postMessage({
  type: "health_ping",
  agentId: "analyst",
  timestamp: new Date(baseTime - 2200000).toISOString(),
  targetAgent: "data-miner",
});

postMessage({
  type: "health_pong",
  agentId: "data-miner",
  timestamp: new Date(baseTime - 2199000).toISOString(),
  targetAgent: "analyst",
  status: "online",
  queueDepth: 0,
  uptime: "7200s",
});

// 6d. Payment receipt
postMessage({
  type: "payment_receipt",
  agentId: "analyst",
  timestamp: new Date(baseTime - 2100000).toISOString(),
  toAgent: "research-buyer",
  amount: "0.005",
  token: "SOL",
  txHash: cycles[0].buyerToAnalystTx,
  receiptHash: "sha256:abc123def456",
  service: "/analyze",
});

// 6e. Reputation gossip
postMessage({
  type: "reputation_gossip",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 2000000).toISOString(),
  aboutAgent: "analyst",
  rating: "positive",
  reason: "Fast response, data quality good",
  txHash: cycles[0].buyerToAnalystTx,
});

postMessage({
  type: "reputation_gossip",
  agentId: "analyst",
  timestamp: new Date(baseTime - 1900000).toISOString(),
  aboutAgent: "data-miner",
  rating: "neutral",
  reason: "Response time acceptable but could be faster",
  txHash: cycles[0].analystToMinerTx,
});

// 6f. SLA agreement (accepted)
postMessage({
  type: "sla_agreement",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 1700000).toISOString(),
  toAgent: "analyst",
  service: "/analyze",
  terms: {
    maxResponseTimeMs: 5000,
    minUptime: 95,
    refundOnViolation: true,
    validUntil: new Date(baseTime + 7 * 86400000).toISOString(),
  },
  accepted: true,
});

// 6g. Supply chain invite
postMessage({
  type: "supply_chain_invite",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 1600000).toISOString(),
  chainId: "chain-demo-abc123",
  participants: ["research-buyer", "analyst", "data-miner"],
  roles: {
    "research-buyer": "Consumer — purchases analysis reports",
    "analyst": "Intermediary — buys raw data, sells analysis",
    "data-miner": "Producer — scrapes and provides raw data",
  },
  description: "DeFi research supply chain — scrape, analyze, consume",
});

// 6h. Business cards
postMessage({
  type: "business_card",
  agentId: "analyst",
  timestamp: new Date(baseTime - 1500000).toISOString(),
  services: [
    { endpoint: "/analyze", price: "0.05", token: "USDC", description: "AI-powered market analysis" },
  ],
  reputation: { score: 72, level: "verified", totalTransactions: 9 },
  walletAddresses: {
    "eip155:1": "0x4ef5aaef757B4180512a52A17023E3471BA3e361",
    "solana:mainnet": "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
  },
  stats: { totalRevenue: 0.015, totalSpending: 0.003, profitLoss: 0.012 },
} as unknown as import("@aegis-ows/shared").AgentMessage);

postMessage({
  type: "business_card",
  agentId: "data-miner",
  timestamp: new Date(baseTime - 1400000).toISOString(),
  services: [
    { endpoint: "/scrape", price: "0.01", token: "USDC", description: "Web scraping and parsing" },
  ],
  reputation: { score: 65, level: "verified", totalTransactions: 6 },
  walletAddresses: {
    "eip155:1": "0x6344D6E94BbeBB612bA5eC55f3125Bf7a0B8666F",
    "solana:mainnet": "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
  },
  stats: { totalRevenue: 0.003, totalSpending: 0, profitLoss: 0.003 },
} as unknown as import("@aegis-ows/shared").AgentMessage);

// 6i. Dispute (open) + dispute response (accepted)
postMessage({
  type: "dispute",
  disputeId: "dispute-demo-001",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 1300000).toISOString(),
  againstAgent: "analyst",
  txHash: cycles[2].buyerToAnalystTx,
  reason: "Timeout after payment — no response within SLA window",
  evidence: "Paid 0.005 SOL for /analyze but received timeout after 8 seconds (SLA: 5000ms)",
  requestedResolution: "refund",
  status: "open",
} as unknown as import("@aegis-ows/shared").AgentMessage);

postMessage({
  type: "dispute_response",
  disputeId: "dispute-demo-001",
  agentId: "analyst",
  timestamp: new Date(baseTime - 1200000).toISOString(),
  toAgent: "research-buyer",
  accepted: true,
  resolution: "Refund issued — downstream data-miner was temporarily overloaded",
  refundTxHash: "mock-refund-tx-demo-001",
} as unknown as import("@aegis-ows/shared").AgentMessage);

// 6j. XMTP notifications (policy block + budget alert)
postMessage({
  type: "xmtp_notification",
  agentId: "aegis-budget",
  timestamp: new Date(baseTime - 1100000).toISOString(),
  toAgent: "research-buyer",
  severity: "warning",
  title: "Policy Block: aegis-budget",
  message: "Agent research-buyer was blocked by aegis-budget: Daily USDC limit on eip155:8453 exceeded",
  metadata: { policy: "aegis-budget" },
} as unknown as import("@aegis-ows/shared").AgentMessage);

postMessage({
  type: "xmtp_notification",
  agentId: "aegis-budget",
  timestamp: new Date(baseTime - 1000000).toISOString(),
  toAgent: "analyst",
  severity: "critical",
  title: "Budget Alert: 92% used",
  message: "Agent analyst has used 92% of daily budget (limit: $1.00)",
  metadata: { usage: "92", limit: "1.00" },
} as unknown as import("@aegis-ows/shared").AgentMessage);

console.log("Seeded 26 XMTP message bus entries (full protocol: announcements, discovery, negotiation, health, receipts, reputation, SLA, supply chain, business cards, disputes, notifications)");

// 7. Seed OWS wallet address info for dashboard display
postMessage({
  type: "wallet_info",
  agentId: "data-miner",
  timestamp: new Date(baseTime - 7200000).toISOString(),
  walletAddresses: {
    "eip155:1": "0x6344D6E94BbeBB612bA5eC55f3125Bf7a0B8666F",
    "solana:mainnet": "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
  },
});

postMessage({
  type: "wallet_info",
  agentId: "analyst",
  timestamp: new Date(baseTime - 7200000).toISOString(),
  walletAddresses: {
    "eip155:1": "0x4ef5aaef757B4180512a52A17023E3471BA3e361",
    "solana:mainnet": "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
  },
});

postMessage({
  type: "wallet_info",
  agentId: "research-buyer",
  timestamp: new Date(baseTime - 7200000).toISOString(),
  walletAddresses: {
    "eip155:1": "0x2219FF712dbcf3fEE0a712bAD2E111D0008a2f1d",
    "solana:mainnet": "9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A",
  },
});

console.log("Seeded 3 OWS wallet address entries");

console.log("\nSeed complete! Run 'npm run dev' in dashboard/ to see the economy.");
