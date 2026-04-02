import {
  ensureAegisDir,
  writeBudgetConfig,
  writeGuardConfig,
  writeApproveConfig,
  appendLedgerEntry,
  appendPolicyLog,
  registerService,
  addPendingApproval,
} from "@aegis-ows/shared";

// ─── 1. Ensure ~/.ows/aegis/ exists ─────────────────────────────────────────
console.log("[1/8] Ensuring ~/.ows/aegis/ directory...");
ensureAegisDir();
console.log("      Done.");

// ─── 2. Budget Config ────────────────────────────────────────────────────────
console.log("[2/8] Writing budget config...");
writeBudgetConfig({
  limits: [
    {
      chainId: "eip155:1",
      token: "USDC",
      daily: "10",
      weekly: "50",
      monthly: "200",
    },
    {
      chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      token: "USDC",
      daily: "25",
    },
    {
      chainId: "*",
      token: "USDC",
      daily: "100",
    },
  ],
});
console.log("      eip155:1/USDC  → $10/day, $50/week, $200/month");
console.log("      solana:*/USDC  → $25/day");
console.log("      */USDC (global) → $100/day");

// ─── 3. Guard Config ─────────────────────────────────────────────────────────
console.log("[3/8] Writing guard config...");
writeGuardConfig({
  mode: "allowlist",
  addresses: {
    "eip155:1": [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
    ],
    "solana:*": [
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC on Solana
    ],
  },
  blockAddresses: [
    "0xDEADBEEF0000000000000000000000000000SCAM",
  ],
});
console.log("      Allowlist mode with EVM + Solana USDC contracts");
console.log("      Blocked: 0xDEADBEEF...SCAM");

// ─── 4. Approve Config ───────────────────────────────────────────────────────
console.log("[4/8] Writing approve config...");
writeApproveConfig({
  thresholds: {
    auto_approve_below: "1",
    require_approval_above: "1",
    hard_block_above: "100",
  },
  approval_ttl_minutes: 30,
});
console.log("      Auto-approve < $1 | Require approval ≥ $1 | Hard block > $100");
console.log("      TTL: 30 minutes");

// ─── 5. Seed Ledger Entries ──────────────────────────────────────────────────
console.log("[5/8] Seeding ledger entries (10 entries across 24h)...");

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();

const ledgerEntries = [
  {
    timestamp: h(23),
    apiKeyId: "research-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.01",
    txHash: "0xabc1234000000000000000000000000000000000000000000000000000000001",
    tool: "web_scrape",
    description: "Web Scraper API: scraped financial news headlines",
  },
  {
    timestamp: h(21),
    apiKeyId: "trading-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.05",
    txHash: "0xabc1234000000000000000000000000000000000000000000000000000000002",
    tool: "market_data",
    description: "Market Data Feed: ETH/USDC real-time price tick",
  },
  {
    timestamp: h(19),
    apiKeyId: "research-agent",
    chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    token: "USDC",
    amount: "0.02",
    txHash: "5xSol111111111111111111111111111111111111111111111111111111111111",
    tool: "sentiment_analysis",
    description: "Sentiment Analysis: Twitter crypto sentiment batch",
  },
  {
    timestamp: h(17),
    apiKeyId: "trading-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.05",
    txHash: "0xabc1234000000000000000000000000000000000000000000000000000000004",
    tool: "market_data",
    description: "Market Data Feed: BTC/USDC OHLCV 1h candles",
  },
  {
    timestamp: h(15),
    apiKeyId: "audit-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.10",
    txHash: "0xabc1234000000000000000000000000000000000000000000000000000000005",
    tool: "code_audit",
    description: "Code Audit Scanner: Solidity contract vulnerability scan",
  },
  {
    timestamp: h(13),
    apiKeyId: "research-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.01",
    txHash: "0xabc1234000000000000000000000000000000000000000000000000000000006",
    tool: "web_scrape",
    description: "Web Scraper API: scraped DeFi protocol TVL data",
  },
  {
    timestamp: h(10),
    apiKeyId: "trading-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.05",
    txHash: "0xabc1234000000000000000000000000000000000000000000000000000000007",
    tool: "market_data",
    description: "Market Data Feed: SOL/USDC real-time price tick",
  },
  {
    timestamp: h(8),
    apiKeyId: "research-agent",
    chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    token: "USDC",
    amount: "0.02",
    txHash: "5xSol222222222222222222222222222222222222222222222222222222222222",
    tool: "sentiment_analysis",
    description: "Sentiment Analysis: Reddit /r/CryptoCurrency sentiment",
  },
  {
    timestamp: h(5),
    apiKeyId: "audit-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.10",
    txHash: "0xabc1234000000000000000000000000000000000000000000000000000000009",
    tool: "code_audit",
    description: "Code Audit Scanner: ERC-20 token contract audit",
  },
  {
    timestamp: h(2),
    apiKeyId: "trading-agent",
    chainId: "eip155:1",
    token: "USDC",
    amount: "0.01",
    txHash: "0xabc123400000000000000000000000000000000000000000000000000000000a",
    tool: "web_scrape",
    description: "Web Scraper API: scraped Coinbase blog for market news",
  },
];

for (const entry of ledgerEntries) {
  appendLedgerEntry(entry);
  console.log(`      + ${entry.apiKeyId} / ${entry.tool} / $${entry.amount} USDC`);
}

// ─── 6. Seed Policy Log ──────────────────────────────────────────────────────
console.log("[6/8] Seeding policy log entries (7 entries)...");

const policyEntries = [
  {
    timestamp: h(23.1),
    policyName: "budget",
    apiKeyId: "research-agent",
    chainId: "eip155:1",
    allowed: true,
    reason: "Within daily budget ($0.01 of $10.00 used)",
    transactionPreview: "USDC transfer $0.01 → Web Scraper API",
  },
  {
    timestamp: h(21.1),
    policyName: "guard",
    apiKeyId: "trading-agent",
    chainId: "eip155:1",
    allowed: true,
    reason: "Recipient 0x7a250d...488D is allowlisted (Uniswap Router)",
    transactionPreview: "USDC transfer $0.05 → Market Data Feed",
  },
  {
    timestamp: h(18),
    policyName: "guard",
    apiKeyId: "unknown-agent",
    chainId: "eip155:1",
    allowed: false,
    reason: "Recipient 0xDEADBEEF...SCAM is in block list",
    transactionPreview: "USDC transfer $50.00 → 0xDEADBEEF...SCAM",
  },
  {
    timestamp: h(15.1),
    policyName: "approve",
    apiKeyId: "audit-agent",
    chainId: "eip155:1",
    allowed: true,
    reason: "Amount $0.10 is below auto-approve threshold of $1.00",
    transactionPreview: "USDC transfer $0.10 → Code Audit Scanner",
  },
  {
    timestamp: h(12),
    policyName: "budget",
    apiKeyId: "trading-agent",
    chainId: "eip155:1",
    allowed: false,
    reason: "Weekly budget exceeded ($52.30 of $50.00 limit)",
    transactionPreview: "USDC transfer $5.00 → Market Data Feed (bulk)",
  },
  {
    timestamp: h(6),
    policyName: "approve",
    apiKeyId: "trading-agent",
    chainId: "eip155:1",
    allowed: false,
    reason: "Amount $15.00 exceeds auto-approve threshold; human approval required",
    transactionPreview: "USDC transfer $15.00 → Uniswap swap ETH→USDC",
  },
  {
    timestamp: h(1),
    policyName: "guard",
    apiKeyId: "research-agent",
    chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    allowed: true,
    reason: "Recipient EPjFWdd5...Dt1v is allowlisted (Solana USDC)",
    transactionPreview: "USDC transfer $0.02 → Sentiment Analysis",
  },
];

for (const entry of policyEntries) {
  appendPolicyLog(entry);
  const verdict = entry.allowed ? "PASS" : "BLOCK";
  console.log(`      [${verdict}] ${entry.policyName} / ${entry.apiKeyId}: ${entry.reason?.slice(0, 50)}...`);
}

// ─── 7. Register Services ────────────────────────────────────────────────────
console.log("[7/8] Registering 4 services...");

const services = [
  {
    name: "Web Scraper API",
    description: "Extracts structured data from public web pages. Supports JS rendering and pagination.",
    endpoint: "http://localhost:4020/api/scrape",
    price: "0.01",
    token: "USDC",
    protocol: "x402" as const,
    chains: ["eip155:1", "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
    registeredBy: "demo-setup",
  },
  {
    name: "Market Data Feed",
    description: "Real-time and historical OHLCV price data for crypto markets. Covers 500+ trading pairs.",
    endpoint: "http://localhost:4020/api/market-data",
    price: "0.05",
    token: "USDC",
    protocol: "x402" as const,
    chains: ["eip155:1"],
    registeredBy: "demo-setup",
  },
  {
    name: "Sentiment Analysis",
    description: "NLP-powered sentiment scoring for crypto social media. Twitter, Reddit, and Telegram.",
    endpoint: "http://localhost:4020/api/sentiment",
    price: "0.02",
    token: "USDC",
    protocol: "mpp" as const,
    chains: ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
    registeredBy: "demo-setup",
  },
  {
    name: "Code Audit Scanner",
    description: "Automated smart contract security analysis. Detects reentrancy, overflow, and access control issues.",
    endpoint: "http://localhost:4020/api/audit",
    price: "0.10",
    token: "USDC",
    protocol: "x402" as const,
    chains: ["eip155:1"],
    registeredBy: "demo-setup",
  },
];

for (const svc of services) {
  const registered = registerService(svc);
  console.log(`      + [${svc.protocol.toUpperCase()}] ${svc.name} @ $${svc.price} USDC (id: ${registered.id.slice(0, 8)}...)`);
}

// ─── 8. Add Pending Approvals ────────────────────────────────────────────────
console.log("[8/8] Adding 2 pending approvals...");

const approval1 = addPendingApproval({
  apiKeyId: "trading-agent",
  chainId: "eip155:1",
  transaction: {
    to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    value: "0x0",
    data: "0x38ed1739000000000000000000000000000000000000000000000000000000000DE0B6B3", // swapExactTokensForTokens
  },
  estimatedValue: "15",
  token: "USDC",
  reason: "Uniswap V2 swap: 15 USDC → ETH (exceeds $1 auto-approve threshold)",
  ttlMinutes: 30,
});
console.log(`      + trading-agent: $15.00 USDC Uniswap swap (id: ${approval1.id.slice(0, 8)}...)`);

const approval2 = addPendingApproval({
  apiKeyId: "research-agent",
  chainId: "eip155:1",
  transaction: {
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    value: "0x0",
    data: "0xa9059cbb000000000000000000000000DATAPROVIDER00000000000000000000000000000", // transfer
  },
  estimatedValue: "5",
  token: "USDC",
  reason: "Bulk data purchase: 5 USDC for 30-day market sentiment dataset",
  ttlMinutes: 30,
});
console.log(`      + research-agent: $5.00 USDC bulk data purchase (id: ${approval2.id.slice(0, 8)}...)`);

// ─── Done ────────────────────────────────────────────────────────────────────
console.log("");
console.log("Demo seed complete! Files written to ~/.ows/aegis/:");
console.log("  budget-config.json    — budget limits per chain/token");
console.log("  guard-config.json     — allowlist with EVM + Solana addresses");
console.log("  approve-config.json   — $1 auto-approve, $100 hard block");
console.log("  budget-ledger.json    — 10 realistic x402 payment entries");
console.log("  policy-log.json       — 7 PASS/BLOCK policy decisions");
console.log("  service-registry.json — 4 registered services");
console.log("  pending-approvals.json — 2 pending human approvals");
