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

// 4. Seed the 3-agent supply chain transactions
// research-buyer pays analyst, analyst pays data-miner
const baseTime = Date.now();

for (let i = 0; i < 10; i++) {
  const ts = new Date(baseTime - (10 - i) * 300000).toISOString(); // 5min apart

  // research-buyer pays analyst $0.05
  appendLedgerEntry({
    timestamp: ts,
    apiKeyId: "research-buyer",
    chainId: "eip155:8453",
    token: "USDC",
    amount: "0.05",
    tool: "http://localhost:4002/analyze",
    description: "x402 payment to analyst for /analyze",
  });

  appendEarningsEntry({
    timestamp: ts,
    agentId: "analyst",
    endpoint: "/analyze",
    fromAgent: "research-buyer",
    token: "USDC",
    amount: "0.05",
  });

  // analyst pays data-miner $0.01
  const ts2 = new Date(new Date(ts).getTime() + 100).toISOString();
  appendLedgerEntry({
    timestamp: ts2,
    apiKeyId: "analyst",
    chainId: "eip155:8453",
    token: "USDC",
    amount: "0.01",
    tool: "http://localhost:4001/scrape",
    description: "x402 payment to data-miner for /scrape",
  });

  appendEarningsEntry({
    timestamp: ts2,
    agentId: "data-miner",
    endpoint: "/scrape",
    fromAgent: "analyst",
    token: "USDC",
    amount: "0.01",
  });
}

console.log("Seeded 20 ledger + 20 earnings entries (10 cycles of supply chain)");

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

console.log("Seeded 5 XMTP message bus entries (announcements + discovery)");

console.log("\nSeed complete! Run 'npm run dev' in dashboard/ to see the economy.");
