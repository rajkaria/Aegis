# Aegis — Policy, Commerce & Visibility for the Open Wallet Standard

## Build Spec for OWS Hackathon

**Hackathon:** OWS Hackathon — Build with the Open Wallet Standard
**Format:** Three rounds of building, back to back
**URL:** https://hackathon.openwallet.sh/
**OWS Launched:** March 23, 2026 (10 days old)
**Backed by:** MoonPay, PayPal, OKX, Ripple, Ethereum Foundation, Solana Foundation, Circle, TON, Tron, Base, Polygon, Sui, Filecoin, LayerZero, Arbitrum, Virtuals, Dynamic, Allium, Simmer.Markets

---

## STRATEGIC CONTEXT

### What OWS Is (Technical Summary)

OWS (Open Wallet Standard) is a local-first wallet standard for AI agents:

- **Vault:** Encrypted keystore at `~/.ows/wallets/` — AES-256-GCM encryption, keys never leave disk unencrypted
- **Multi-chain:** Single seed → EVM, Solana, Bitcoin, Cosmos, Tron, TON, Filecoin, XRP addresses (CAIP-2/CAIP-10)
- **Policy Engine:** Pre-signing policies via custom executables — any script/binary that takes `PolicyContext` and returns `PolicyResult`
- **Agent Access:** MCP server + SDK (Node.js, Python, Rust) + CLI (`ows` command)
- **API Keys:** Scoped to specific wallets and policies — different agents get different access levels
- **Signing Enclave:** Keys decrypted in isolated process, signed, key wiped from memory. Agent never sees private key.
- **Protocol Compatible:** x402 (Coinbase) and MPP (Stripe) ready

### OWS Architecture (From Spec)

```
Agent / CLI / App
       │
       │  OWS Interface (MCP / SDK / CLI)
       ▼
┌─────────────────────┐
│    Access Layer      │     1. Agent calls ows.sign()
│  ┌────────────────┐  │     2. Policy engine evaluates
│  │ Policy Engine   │  │     3. Enclave decrypts key
│  │ (pre-signing)   │  │     4. Transaction signed
│  └───────┬────────┘  │     5. Key wiped from memory
│  ┌───────▼────────┐  │     6. Signature returned
│  │ Signing Enclave │  │
│  │ (isolated proc) │  │     The agent NEVER sees
│  └───────┬────────┘  │     the private key.
│  ┌───────▼────────┐  │
│  │  Wallet Vault   │  │
│  │ ~/.ows/wallets/ │  │
│  └────────────────┘  │
└─────────────────────┘
```

### OWS Core Types (From Spec v1.2.0)

```typescript
// Policy — the extension point we're building on
interface Policy {
  id: string;
  name: string;
  executable: string;           // absolute path to policy executable
  config?: Record<string, unknown>;  // static config passed to executable
  action: "deny" | "warn";
}

interface PolicyContext {
  transaction: SerializedTransaction;
  chainId: ChainId;             // CAIP-2 e.g. "eip155:1"
  wallet: WalletDescriptor;
  simulation?: SimulationResult;
  timestamp: string;
  apiKeyId: string;             // the API key making this request
}

interface PolicyResult {
  allow: boolean;
  reason?: string;
}

// API Keys — scoped access for different agents
interface ApiKey {
  id: string;                   // UUID v4
  name: string;                 // human-readable label
  tokenHash: string;            // SHA-256 of raw token
  createdAt: string;            // ISO 8601
  walletIds: WalletId[];        // wallets this key can access
  policyIds: string[];          // policies evaluated per request
  expiresAt?: string;           // optional expiry
}

// Operations — what agents can do
interface SignRequest {
  walletId: WalletId;
  chainId: ChainId;
  transaction: SerializedTransaction;
  simulate?: boolean;           // default: true
}

interface SignAndSendRequest extends SignRequest {
  maxRetries?: number;
  confirmations?: number;
}
```

### Why This Hackathon Exists (MoonPay's Needs)

OWS is 10 days old. MoonPay needs:
1. **Adoption proof** — "developers built on OWS within weeks of launch"
2. **Extension examples** — the Policy Engine and MCP server are designed to be extended, but have ZERO community extensions yet
3. **Multi-chain proof** — someone demonstrating OWS actually works across chains, not just EVM
4. **x402 + MPP integration** — their press release promises this but nobody has demonstrated it through OWS
5. **A project they can feature** — in their next investor deck, blog post, and GitHub docs

### What Will Lose (What 80% of Submissions Will Be)

- Simple wallet wrapper with a UI
- Basic "create wallet → sign message" demo
- Single-chain toy app
- Dashboard that just reads ~/.ows/ and displays balances
- Chatbot that calls OWS SDK

### What Wins (From Previous x402/Agent Hackathons)

| Winner | Category | Pattern |
|--------|----------|---------|
| AgentFabric ($24K) | Infrastructure | Meta-layer enabling other apps — "connective tissue" |
| Cronos Shield ($5K) | Security | Automated risk management for agent transactions |
| CroIgnite ($2K) | Dev Tooling | Streamlined onboarding for new projects |
| x402 Intent Firewall ($3K) | Dev Tooling | Safety middleware for programmatic payments |

**Pattern: Extend the platform. Build infrastructure. Enable the ecosystem.**

---

## PRODUCT: AEGIS

### Vision (< 256 chars)
Aegis — policy, commerce, and visibility for the Open Wallet Standard. Custom spending policies, x402/MPP commerce tools, and a real-time dashboard for agent wallets. OWS is the vault. Aegis is the shield.

### What Aegis Is

Aegis is the first ecosystem extension for OWS. It delivers three things that OWS shipped without:

1. **Policy Executables** — Real, installable spending policies that plug into OWS's policy engine (the spec defines the interface but ships zero implementations)
2. **Commerce MCP Server** — An MCP server that gives agents the ability to pay for x402/MPP services through OWS, discover paid services, and register their own services for sale
3. **Sentinel Dashboard** — A real-time web dashboard showing agent spending, policy enforcement logs, and budget consumption across all chains

### Why This Wins

- **You're not building ON OWS — you're building INTO OWS.** Policy executables and MCP servers are the two explicitly designed extension points. Whoever builds the first implementations becomes the reference.
- **Three hackathon rounds = three deliverables.** Round 1: Policies. Round 2: Commerce MCP. Round 3: Dashboard. Each round is independently valuable and demoable.
- **MoonPay will link to your repo.** They need policy examples for their docs. They need MCP server examples. You're building what they would have built next — but faster.

---

## ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────┐
│                      AI AGENTS                                  │
│          (Claude Code, Cursor, Windsurf, any MCP client)        │
└───────────┬──────────────────────────────┬─────────────────────┘
            │ MCP Protocol                 │ MCP Protocol
            ▼                              ▼
┌───────────────────────┐    ┌────────────────────────────────────┐
│   OWS Built-in MCP    │    │     AEGIS COMMERCE MCP SERVER      │
│   (wallet/sign ops)   │    │                                    │
│                        │    │  Tools:                            │
│  • ows_create_wallet   │    │  • aegis_pay_x402                 │
│  • ows_sign_tx         │    │  • aegis_pay_mpp                  │
│  • ows_sign_message    │    │  • aegis_check_budget             │
│  • ows_list_wallets    │    │  • aegis_discover_services        │
│                        │    │  • aegis_register_service         │
└───────────┬────────────┘    │  • aegis_spending_report          │
            │                  └──────────┬───────────────────────┘
            │                             │
            ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OWS CORE                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 AEGIS POLICY EXECUTABLES                     ││
│  │                                                              ││
│  │  aegis-budget         aegis-guard         aegis-approve      ││
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐ ││
│  │  │ Daily/weekly/ │   │ Contract     │   │ Human approval   │ ││
│  │  │ monthly spend │   │ allowlist +  │   │ for txs over     │ ││
│  │  │ caps per      │   │ address      │   │ threshold.       │ ││
│  │  │ chain/token   │   │ blocklist    │   │ Writes to        │ ││
│  │  │              │   │              │   │ pending queue.    │ ││
│  │  └──────────────┘   └──────────────┘   └──────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │ Signing Enclave │  │ Wallet Vault   │  │ API Key Manager    │ │
│  │                 │  │ ~/.ows/wallets/│  │ Scoped per-agent   │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AEGIS SENTINEL DASHBOARD                      │
│                       (Next.js 15)                               │
│                                                                  │
│  • Real-time spending per agent, per chain, per token            │
│  • Policy enforcement log (blocked txs + reasons)                │
│  • Budget consumption bars                                       │
│  • Service registry browser                                      │
│  • One-click policy configuration                                │
│  • CSV export for accounting                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## DELIVERABLE 1: AEGIS POLICY EXECUTABLES

### How OWS Policies Work

OWS policies are external executables. Before any signing operation, OWS:
1. Reads the policy list from the API key's `policyIds`
2. For each policy, spawns the executable with `PolicyContext` on stdin (JSON)
3. Reads `PolicyResult` from stdout (JSON)
4. If ANY policy returns `{allow: false}`, the operation is blocked (if `action: "deny"`) or logged (if `action: "warn"`)

This means policies can be ANY language — Node.js scripts, Python scripts, compiled binaries, shell scripts.

### Policy 1: `aegis-budget` — Spending Limits

**What it does:** Enforces daily/weekly/monthly spending caps per chain, per token, per API key (per agent).

**Config:**
```json
{
  "limits": [
    {
      "chainId": "eip155:1",
      "token": "USDC",
      "daily": "10.00",
      "weekly": "50.00",
      "monthly": "200.00"
    },
    {
      "chainId": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      "token": "USDC",
      "daily": "25.00"
    },
    {
      "chainId": "*",
      "token": "*",
      "daily": "100.00"
    }
  ]
}
```

**How it works:**
1. Receives `PolicyContext` with transaction + simulation result
2. Reads spending ledger from `~/.ows/aegis/budget-ledger.json`
3. Estimates tx cost from simulation (or parses transfer amount from tx data)
4. Checks against configured limits for the matching chain/token/period
5. Returns `{allow: true}` or `{allow: false, reason: "Daily USDC limit on EVM exceeded: $10.00/$10.00"}`
6. On successful signing (post-tx), appends to ledger

**Ledger format:**
```json
{
  "entries": [
    {
      "timestamp": "2026-04-05T12:03:00Z",
      "apiKeyId": "research-agent-key",
      "chainId": "eip155:1",
      "token": "USDC",
      "amount": "0.05",
      "txHash": "0xabc...",
      "tool": "aegis_pay_x402"
    }
  ]
}
```

### Policy 2: `aegis-guard` — Contract & Address Guard

**What it does:** Allowlist/blocklist for contract addresses and recipient addresses. Prevents agents from interacting with unknown or malicious contracts.

**Config:**
```json
{
  "mode": "allowlist",
  "addresses": {
    "eip155:1": [
      "0x1234...USDC_CONTRACT",
      "0x5678...UNISWAP_ROUTER"
    ],
    "solana:*": [
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    ]
  },
  "blockAddresses": [
    "0xKNOWN_SCAM_ADDRESS..."
  ]
}
```

**How it works:**
1. Parses transaction to extract target contract/recipient address
2. In allowlist mode: blocks if address not in allowlist
3. Always blocks if address is in blockAddresses
4. Returns clear reason: `"Address 0xabc... not in allowlist for eip155:1"`

### Policy 3: `aegis-approve` — Human Approval Gate

**What it does:** Transactions above a configurable threshold require human approval before signing. Writes to a pending queue; human reviews via dashboard or CLI.

**Config:**
```json
{
  "thresholds": {
    "auto_approve_below": "1.00",
    "require_approval_above": "1.00",
    "hard_block_above": "100.00"
  },
  "approval_ttl_minutes": 30,
  "queue_path": "~/.ows/aegis/pending-approvals.json"
}
```

**How it works:**
1. Estimates tx value from simulation
2. Below `auto_approve_below`: `{allow: true}`
3. Between thresholds: writes to pending queue, returns `{allow: false, reason: "Awaiting human approval. Review at dashboard or run: aegis approve <tx-id>"}`
4. Above `hard_block_above`: `{allow: false, reason: "Transaction exceeds hard limit of $100.00"}`
5. Dashboard shows pending queue with approve/reject buttons
6. CLI: `aegis approve <tx-id>` marks as approved; next attempt passes

### Installation

```bash
# Install all Aegis policies
npm install -g @aegis-ows/policies

# Or individually
npm install -g @aegis-ows/policy-budget
npm install -g @aegis-ows/policy-guard
npm install -g @aegis-ows/policy-approve

# Register with OWS (adds to ~/.ows/policies/)
aegis policies install
```

After installation, policies appear in OWS config and can be attached to any API key's `policyIds`.

---

## DELIVERABLE 2: AEGIS COMMERCE MCP SERVER

### Overview

An MCP server that extends OWS with commerce-specific tools. Agents add this server alongside the built-in OWS MCP server to gain payment and service discovery capabilities.

### MCP Server Configuration

```json
{
  "mcpServers": {
    "ows": {
      "command": "ows",
      "args": ["mcp"]
    },
    "aegis": {
      "command": "aegis",
      "args": ["mcp", "--config", "~/.ows/aegis/config.json"]
    }
  }
}
```

### Tool Definitions

#### `aegis_pay_x402`
Agent receives a 402 from a paid endpoint. This tool handles the OWS-signed payment.

```typescript
{
  name: "aegis_pay_x402",
  description: "Pay for an x402-protected resource using OWS wallet",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "The x402-protected URL" },
      walletName: { type: "string", description: "OWS wallet name to pay from" },
      chain: { type: "string", description: "Chain to pay on (e.g., 'evm', 'solana')" },
      maxAmount: { type: "string", description: "Maximum amount willing to pay" }
    },
    required: ["url", "walletName"]
  }
}
```

**Flow:**
1. Agent calls `aegis_pay_x402` with URL
2. Aegis fetches URL → receives 402 response with payment details
3. Checks budget policy: is this within limits?
4. Calls OWS SDK `signTransaction()` to sign the payment auth
5. Retries URL with signed payment header
6. Returns resource content to agent
7. Logs transaction to Aegis ledger

#### `aegis_pay_mpp`
Open or use an MPP session for bulk paid API calls.

```typescript
{
  name: "aegis_pay_mpp",
  description: "Pay for a resource using MPP session via OWS wallet",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string" },
      walletName: { type: "string" },
      sessionId: { type: "string", description: "Existing MPP session ID, or omit to create new" },
      maxSessionCost: { type: "string", description: "Max total for new session" }
    },
    required: ["url", "walletName"]
  }
}
```

#### `aegis_check_budget`
Agent self-queries its remaining budget.

```typescript
{
  name: "aegis_check_budget",
  description: "Check remaining spending budget for an OWS wallet",
  inputSchema: {
    type: "object",
    properties: {
      walletName: { type: "string" },
      chain: { type: "string", description: "Optional: check specific chain" },
      period: { type: "string", enum: ["daily", "weekly", "monthly"] }
    },
    required: ["walletName"]
  }
}
```

**Returns:**
```json
{
  "wallet": "research-agent",
  "budgets": [
    { "chain": "eip155:1", "token": "USDC", "period": "daily", "spent": "2.45", "limit": "10.00", "remaining": "7.55" },
    { "chain": "*", "token": "*", "period": "daily", "spent": "3.20", "limit": "100.00", "remaining": "96.80" }
  ]
}
```

This is novel — agents don't just hit policy walls, they proactively check their budget BEFORE attempting expensive operations. Self-regulating agents.

#### `aegis_discover_services`
Query a service registry for paid APIs/tools available via x402/MPP.

```typescript
{
  name: "aegis_discover_services",
  description: "Find paid services available for agents",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query (e.g., 'web scraping', 'market data')" },
      maxPrice: { type: "string", description: "Max price per call" },
      chain: { type: "string", description: "Preferred payment chain" },
      protocol: { type: "string", enum: ["x402", "mpp", "any"] }
    },
    required: ["query"]
  }
}
```

#### `aegis_register_service`
Register your own service as discoverable and payable.

```typescript
{
  name: "aegis_register_service",
  description: "Register a paid service in the Aegis service registry",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      endpoint: { type: "string" },
      price: { type: "string" },
      token: { type: "string", default: "USDC" },
      protocol: { type: "string", enum: ["x402", "mpp"] },
      chains: { type: "array", items: { type: "string" } }
    },
    required: ["name", "endpoint", "price", "protocol"]
  }
}
```

#### `aegis_spending_report`
Generate a spending report for a wallet over a time period.

```typescript
{
  name: "aegis_spending_report",
  description: "Generate a spending report for an OWS wallet",
  inputSchema: {
    type: "object",
    properties: {
      walletName: { type: "string" },
      period: { type: "string", enum: ["today", "week", "month", "all"] },
      format: { type: "string", enum: ["summary", "detailed", "csv"] }
    },
    required: ["walletName"]
  }
}
```

### Service Registry

A lightweight JSON-based registry (file-based for hackathon, could be on-chain post-hackathon):

```json
// ~/.ows/aegis/service-registry.json
{
  "services": [
    {
      "id": "svc-001",
      "name": "Competitor Analysis API",
      "description": "Analyze competitor products and pricing",
      "endpoint": "https://api.watchdog.example/analyze",
      "price": "0.05",
      "token": "USDC",
      "protocol": "x402",
      "chains": ["eip155:1", "solana:mainnet"],
      "registeredBy": "wallet-abc",
      "registeredAt": "2026-04-05T10:00:00Z"
    }
  ]
}
```

For the hackathon: local file registry shared via a simple REST endpoint. Post-hackathon: on-chain registry on Stellar/EVM.

---

## DELIVERABLE 3: AEGIS SENTINEL DASHBOARD

### Tech Stack
- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Reads from `~/.ows/aegis/` data directory (budget ledger, policy logs, pending approvals)
- WebSocket or polling for real-time updates
- Deployed on Vercel

### Dashboard Pages

#### 1. Overview
```
┌────────────────────────────────────────────────────────────┐
│  AEGIS — Agent Spending Intelligence                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Wallets: 3     │  Agents: 5     │  Policies Active: 3     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Today's Spending                                     │  │
│  │                                                       │  │
│  │  Total: $4.23 USDC across 3 chains                   │  │
│  │                                                       │  │
│  │  EVM:     ████████░░░░  $2.10 / $10.00 (21%)        │  │
│  │  Solana:  ████░░░░░░░░  $1.13 / $25.00 (5%)         │  │
│  │  Cosmos:  ██░░░░░░░░░░  $1.00 / $50.00 (2%)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Recent Activity:                                           │
│  12:03 ✅ research-agent → x402 pay → $0.05 USDC (EVM)    │
│  12:01 ✅ data-agent → x402 pay → $0.02 USDC (Solana)     │
│  11:58 🚫 research-agent → BLOCKED by aegis-budget         │
│       "Daily USDC limit on EVM exceeded"                    │
│  11:55 ⏳ trading-agent → PENDING approval → $15.00 USDC  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### 2. Policy Management
```
┌────────────────────────────────────────────────────────────┐
│  Policies                                                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  aegis-budget                          [Active] ✅  │    │
│  │  Daily: $10 EVM / $25 SOL / $100 global             │    │
│  │  This week: $42.30 spent │ 3 blocks │ 0 warnings    │    │
│  │  [Edit Limits] [View Log]                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  aegis-guard                           [Active] ✅  │    │
│  │  Mode: Allowlist │ 12 addresses across 3 chains      │    │
│  │  This week: 2 blocks │ 0 warnings                    │    │
│  │  [Edit Allowlist] [View Log]                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  aegis-approve                         [Active] ✅  │    │
│  │  Auto-approve: < $1 │ Require approval: $1-$100      │    │
│  │  Pending: 2 transactions                             │    │
│  │  [Review Pending] [Edit Thresholds]                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### 3. Pending Approvals
```
┌────────────────────────────────────────────────────────────┐
│  Pending Approvals (2)                                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TX-001 │ trading-agent │ 5 min ago                   │  │
│  │  Send 15.00 USDC to 0xDEX_ROUTER on eip155:1         │  │
│  │  Reason: "Swap USDC → ETH on Uniswap"                │  │
│  │  Policy: aegis-approve (threshold: $1.00)             │  │
│  │                                                       │  │
│  │  [✅ Approve]  [❌ Reject]  [🔍 Simulate First]      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TX-002 │ research-agent │ 12 min ago                 │  │
│  │  Send 5.00 USDC to 0xDATA_API on solana:mainnet       │  │
│  │  Reason: "Bulk data purchase via MPP session"          │  │
│  │                                                       │  │
│  │  [✅ Approve]  [❌ Reject]  [🔍 Simulate First]      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### 4. Service Registry Browser
```
┌────────────────────────────────────────────────────────────┐
│  Service Registry                                           │
├────────────────────────────────────────────────────────────┤
│  [Search services...]                    [Register New]     │
│                                                             │
│  ┌───────────────┬────────┬──────────┬─────────┬────────┐  │
│  │ Service       │ Price  │ Protocol │ Chains  │ Calls  │  │
│  │ Web Scraper   │ $0.01  │ x402     │ EVM,SOL │ 342    │  │
│  │ Market Data   │ $0.05  │ x402     │ EVM     │ 89     │  │
│  │ Sentiment API │ $0.02  │ mpp      │ Solana  │ 156    │  │
│  │ Code Audit    │ $0.10  │ x402     │ EVM     │ 23     │  │
│  └───────────────┴────────┴──────────┴─────────┴────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## TECH STACK

| Component | Technology | Why |
|-----------|-----------|-----|
| Policy Executables | TypeScript (Node.js scripts) | OWS supports any executable; TS is fastest for Raj |
| Commerce MCP Server | TypeScript + `@modelcontextprotocol/sdk` | Standard MCP server SDK |
| OWS Integration | `@open-wallet-standard/core` (npm) | Official OWS Node.js SDK |
| Dashboard | Next.js 15 + TypeScript + Tailwind + shadcn/ui | Raj's core stack |
| Data Storage | File-based JSON in `~/.ows/aegis/` | Follows OWS's local-first philosophy |
| x402 Client | HTTP fetch + OWS signing | Parse 402 → sign via OWS → retry |
| MPP Client | Stripe MPP SDK pattern | Session-based payments |
| CLI | Commander.js | `aegis` CLI for policy management |

---

## FILE STRUCTURE

```
aegis/
├── packages/
│   ├── policies/                    # Policy executables
│   │   ├── aegis-budget/
│   │   │   ├── index.ts             # Budget policy executable
│   │   │   ├── ledger.ts            # Spending ledger read/write
│   │   │   └── config.schema.json   # Config validation
│   │   ├── aegis-guard/
│   │   │   ├── index.ts             # Address guard policy
│   │   │   └── config.schema.json
│   │   └── aegis-approve/
│   │       ├── index.ts             # Approval gate policy
│   │       ├── queue.ts             # Pending approval queue
│   │       └── config.schema.json
│   │
│   ├── mcp-server/                  # Commerce MCP server
│   │   ├── src/
│   │   │   ├── index.ts             # MCP server entry
│   │   │   ├── tools/
│   │   │   │   ├── pay-x402.ts      # x402 payment tool
│   │   │   │   ├── pay-mpp.ts       # MPP session tool
│   │   │   │   ├── check-budget.ts  # Budget query tool
│   │   │   │   ├── discover.ts      # Service discovery tool
│   │   │   │   ├── register.ts      # Service registration tool
│   │   │   │   └── report.ts        # Spending report tool
│   │   │   ├── registry/
│   │   │   │   └── service-registry.ts
│   │   │   └── payments/
│   │   │       ├── x402-client.ts   # x402 payment handler
│   │   │       └── mpp-client.ts    # MPP session handler
│   │   └── package.json
│   │
│   └── cli/                         # Aegis CLI
│       ├── src/
│       │   ├── index.ts             # CLI entry
│       │   ├── commands/
│       │   │   ├── install.ts       # Install policies into OWS
│       │   │   ├── approve.ts       # Approve pending transactions
│       │   │   ├── budget.ts        # View/set budgets
│       │   │   ├── guard.ts         # Manage allowlists
│       │   │   └── report.ts        # Generate spending reports
│       │   └── utils/
│       │       └── ows-paths.ts     # ~/.ows/ path utilities
│       └── package.json
│
├── dashboard/                       # Sentinel Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Overview
│   │   │   ├── policies/page.tsx    # Policy management
│   │   │   ├── approvals/page.tsx   # Pending approvals
│   │   │   ├── services/page.tsx    # Service registry
│   │   │   └── api/                 # API routes reading ~/.ows/aegis/
│   │   ├── components/
│   │   │   ├── spending-chart.tsx
│   │   │   ├── budget-bar.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   ├── approval-card.tsx
│   │   │   └── service-table.tsx
│   │   └── lib/
│   │       ├── aegis-data.ts        # Read ~/.ows/aegis/ data files
│   │       └── ows-client.ts        # OWS SDK wrapper
│   ├── next.config.js
│   └── package.json
│
├── demo/                            # Demo agents for hackathon
│   ├── research-agent/              # Agent that buys services
│   │   └── mcp-config.json
│   ├── data-agent/                  # Agent that sells services
│   │   └── mcp-config.json
│   └── scenarios/
│       ├── basic-x402-payment.ts    # Demo: agent pays for x402 service
│       ├── budget-exceeded.ts       # Demo: policy blocks overspend
│       ├── human-approval.ts        # Demo: tx requires approval
│       └── cross-chain-commerce.ts  # Demo: multi-chain service trade
│
├── package.json                     # Monorepo root
├── turbo.json                       # Turborepo config
└── README.md
```

---

## BUILD SEQUENCE

### Phase 1: Foundation + Policies (Day 1-3)

1. **Install and explore OWS:**
   ```bash
   curl -fsSL https://openwallet.sh/install.sh | bash
   npm install @open-wallet-standard/core
   ows wallet create --name "test-wallet"
   ows wallet list
   ows sign message --wallet test-wallet --chain evm --message "hello"
   ```

2. **Read the spec documents in order:**
   - `docs/03-policy-engine.md` — How policies work (CRITICAL)
   - `docs/04-agent-access-layer.md` — MCP server + API key patterns
   - `docs/02-signing-interface.md` — sign, signAndSend, signMessage
   - `skills/ows/` — Existing MCP server implementation to study

3. **Build aegis-budget policy executable:**
   - TypeScript script that reads PolicyContext from stdin
   - Maintains spending ledger at `~/.ows/aegis/budget-ledger.json`
   - Returns PolicyResult to stdout
   - Test manually: pipe JSON in, get result out

4. **Build aegis-guard policy executable:**
   - Address allowlist/blocklist
   - Parse tx data to extract target address
   - Test with known addresses

5. **Build aegis-approve policy executable:**
   - Pending approval queue at `~/.ows/aegis/pending-approvals.json`
   - CLI command `aegis approve <id>` to approve pending

6. **Register policies with OWS:**
   - Add to `~/.ows/policies/` configuration
   - Test full flow: create API key → attach policies → attempt sign → policies evaluate

### Phase 2: Commerce MCP Server (Day 3-6)

7. **Build the MCP server shell:**
   - Standard MCP server using `@modelcontextprotocol/sdk`
   - Register all 6 tools
   - Test with Claude Code or MCP inspector

8. **Implement aegis_pay_x402:**
   - Fetch x402-protected URL → parse 402 response
   - Use OWS SDK to sign payment authorization
   - Retry with signed payment → return result
   - Log to budget ledger
   - Test with a mock x402 server (or use xlm402.com test services if supporting Stellar)

9. **Implement aegis_pay_mpp:**
   - Open MPP session via OWS signing
   - Track session state in `~/.ows/aegis/mpp-sessions.json`
   - Close/settle session

10. **Implement aegis_check_budget:**
    - Read budget ledger + policy config
    - Return remaining budget per chain/token/period

11. **Implement aegis_discover_services + aegis_register_service:**
    - File-based registry for hackathon
    - CRUD operations on `~/.ows/aegis/service-registry.json`
    - Simple REST endpoint for remote discovery

12. **Implement aegis_spending_report:**
    - Aggregate ledger data by period
    - Return summary or CSV format

### Phase 3: Dashboard (Day 6-8)

13. **Build Next.js dashboard:**
    - Overview page: spending totals, budget bars, activity feed
    - Policy management page: view active policies, edit configs
    - Pending approvals page: approve/reject with one click
    - Service registry browser: search, register, view stats

14. **API routes reading from ~/.ows/aegis/:**
    - `GET /api/spending` — budget ledger aggregation
    - `GET /api/policies` — active policy status + enforcement logs
    - `GET /api/approvals` — pending approval queue
    - `POST /api/approvals/:id/approve` — approve a pending tx
    - `GET /api/services` — service registry
    - `GET /api/export/csv` — export spending data

### Phase 4: Demo + Polish (Day 8-10)

15. **Build demo scenarios:**
    - Two OWS wallets: research-agent + data-agent
    - Data-agent registers a paid service
    - Research-agent discovers and pays via x402
    - Budget policy blocks an overspend
    - Approval gate requires human confirmation
    - Dashboard shows everything in real-time

16. **Record demo video (2-3 minutes):**
    - See demo script below

17. **Write comprehensive README:**
    - Architecture diagram
    - Installation guide
    - Policy configuration reference
    - MCP server tool reference
    - Dashboard screenshots
    - Demo walkthrough

18. **Clean up and submit:**
    - Ensure all packages are installable via npm
    - Deploy dashboard to Vercel
    - Public GitHub repo with MIT license

---

## DEMO VIDEO SCRIPT (2-3 minutes)

```
0:00-0:15 — The Gap
"OWS gives agents wallets. But wallets without policy,
commerce, and visibility are just keys in a vault.
Aegis is what goes inside."

0:15-0:35 — Install + Setup
[Terminal] "npm install -g @aegis-ows/policies @aegis-ows/mcp"
[Terminal] "aegis policies install"
[Terminal] Show ~/.ows/aegis/ directory created with config files
"Three commands. Aegis is now part of your OWS vault."

0:35-1:05 — Policies in Action
[Terminal] "ows wallet create --name research-agent"
[Terminal] Set budget: $10/day USDC on EVM
[Terminal] Agent attempts a $0.05 x402 payment → PASSES ✅
[Terminal] Agent attempts a $15 payment → BLOCKED 🚫
"aegis-budget says: Daily limit exceeded."
[Dashboard] Show the spending bar at 100%, blocked transaction in log

1:05-1:35 — Commerce: Agent Pays for a Service
[Claude Code] Agent asks: "Find me a web scraping service"
[Claude Code] → aegis_discover_services → finds "Web Scraper API" at $0.01/call
[Claude Code] Agent calls aegis_pay_x402 → OWS signs → payment verified → data returned
[Dashboard] Transaction appears in real-time: $0.01 USDC, x402, EVM
"The agent found a service, paid for it, and got results.
OWS signed. Aegis verified the budget. The agent never saw a key."

1:35-2:00 — Human Approval Gate
[Claude Code] Agent attempts a $5 purchase
[Dashboard] "Pending Approval" notification appears
[Dashboard] Click "Approve" → agent retries → transaction succeeds
"Agents act. Humans approve. Aegis is the boundary."

2:00-2:20 — The Dashboard
[Dashboard] Full tour: spending overview, policy enforcement log,
budget consumption bars, service registry
"Every transaction. Every policy decision. Every chain.
One dashboard."

2:20-2:40 — Closing
"OWS launched 2 weeks ago. Aegis is the first ecosystem
extension — policies, commerce, and visibility.
The vault is open. The shield is up."

[Screen: github.com/rajkaria/aegis-ows]
```

---

## KEY REFERENCE LINKS

### OWS Core
| Resource | URL |
|----------|-----|
| OWS Website | https://openwallet.sh/ |
| OWS Docs | https://docs.openwallet.sh/ |
| OWS GitHub | https://github.com/open-wallet-standard/core |
| OWS npm | `@open-wallet-standard/core` |
| OWS PyPI | `open-wallet-standard` |
| OWS Install Script | `curl -fsSL https://openwallet.sh/install.sh \| bash` |

### OWS Specification
| Document | Path in Repo |
|----------|-------------|
| Storage Format | `docs/01-storage-format.md` |
| Signing Interface | `docs/02-signing-interface.md` |
| **Policy Engine** | `docs/03-policy-engine.md` ← MOST IMPORTANT |
| **Agent Access Layer** | `docs/04-agent-access-layer.md` ← SECOND MOST IMPORTANT |
| Key Isolation | `docs/05-key-isolation.md` |
| Wallet Lifecycle | `docs/06-wallet-lifecycle.md` |
| Supported Chains | `docs/07-supported-chains.md` |
| OWS Skills (MCP) | `skills/ows/` directory |

### OWS Ecosystem
| Resource | URL |
|----------|-----|
| MoonPay Launch Post | https://www.moonpay.com/newsroom/open-wallet-standard |
| MoonPay Press Release | https://www.prnewswire.com/news-releases/moonpay-open-sources-the-wallet-layer-for-the-agent-economy-302722116.html |
| OWS Hackathon | https://hackathon.openwallet.sh/ |

### Payment Protocols (for Commerce Layer)
| Resource | URL |
|----------|-----|
| x402 Protocol Spec | https://www.x402.org/ |
| Coinbase x402 Docs | https://docs.cdp.coinbase.com/x402/docs/welcome |
| Stripe MPP Docs | https://docs.stripe.com/machine-payments |
| Stripe MPP Quickstart | https://docs.stripe.com/machine-payments/quickstart |

### MCP Development
| Resource | URL |
|----------|-----|
| MCP SDK | `@modelcontextprotocol/sdk` |
| MCP Specification | https://modelcontextprotocol.io/ |

---

## CRITICAL FIRST STEPS

Before writing any code:

1. **Install OWS and create a wallet:**
   ```bash
   curl -fsSL https://openwallet.sh/install.sh | bash
   ows wallet create --name "test-agent"
   ows wallet list
   ls ~/.ows/
   ```
   Understand the vault structure. Look at what files exist in `~/.ows/`.

2. **Read `docs/03-policy-engine.md` completely.** This is the extension point you're building on. Understand exactly how policy executables are invoked, what they receive, and what they return.

3. **Read `docs/04-agent-access-layer.md`.** Understand the MCP server pattern OWS already uses. Your commerce MCP server should follow the same patterns.

4. **Study `skills/ows/` directory in the repo.** This is the existing MCP server implementation. Your Aegis MCP server complements it.

5. **Write a minimal policy executable** that just logs the PolicyContext it receives and returns `{allow: true}`. Verify it actually gets called by OWS during signing. This is the "hello world" that proves the extension point works.

6. **Test OWS signing on at least 2 chains** (EVM + Solana) to verify multi-chain works. Your demo should show cross-chain commerce.

**The #1 risk is the policy executable integration.** OWS is 10 days old — the policy engine might have undocumented behaviors or bugs. Get a minimal policy working FIRST before building anything else. If the policy executable interface works as specified, everything else is straightforward.

---

## NAMING & BRANDING

**Project:** Aegis
**Tagline:** "OWS is the vault. Aegis is the shield."
**Repo:** `aegis-ows` or `aegis`
**npm scope:** `@aegis-ows/`
**Packages:**
- `@aegis-ows/policy-budget`
- `@aegis-ows/policy-guard`
- `@aegis-ows/policy-approve`
- `@aegis-ows/mcp-server`
- `@aegis-ows/cli`
- `@aegis-ows/dashboard`

---

## README STRUCTURE (For Submission)

```markdown
# Aegis — Policy, Commerce & Visibility for OWS

> OWS is the vault. Aegis is the shield.

## What is Aegis?

The first ecosystem extension for the Open Wallet Standard.
[2-sentence description of three components]

## Quick Start

[Install → configure → run — 3 commands]

## Components

### Policy Executables
[aegis-budget, aegis-guard, aegis-approve — with config examples]

### Commerce MCP Server
[6 tools, how to add to Claude Code / Cursor]

### Sentinel Dashboard
[Screenshots, how to run]

## Demo

[Walkthrough of agent-to-agent commerce with policy enforcement]

## Architecture

[Full diagram]

## Built With

[OWS, MCP, Next.js, TypeScript — hackathon credits]

## License

MIT
```
