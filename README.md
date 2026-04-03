# Aegis — The Agent Commerce Protocol for OWS

> Agents earn via x402-gated services, spend within policy guardrails, and operate transparently.

Built for the [OWS Hackathon](https://hackathon.openwallet.sh/) — the first complete commerce protocol for the Open Wallet Standard.

**Tracks:** Track 2 (Spend Governance) + Track 3 (API Monetization) + Track 4 (Multi-Agent)

---

## What is Aegis?

Aegis turns AI agents into economic actors. Agents earn, spend safely, and operate transparently — one OWS wallet, one dashboard, one protocol.

OWS ships a powerful wallet primitive: signing, key management, and a policy hook. Aegis extends it into a full agent economy with three layers:

**Aegis Gate** — Express middleware that wraps any API behind x402 micropayments. One line of code turns any endpoint into a paid service that agents can call and earn from.

**Aegis Policies** — Three OWS policy executables (`aegis-budget`, `aegis-guard`, `aegis-deadswitch`) that plug directly into OWS's policy engine and govern every agent transaction before it is signed.

**Aegis Nexus** — Real-time dashboard showing the full money flow between agents: Sankey diagrams of payment routing, per-agent P&L, policy enforcement history, and budget status.

The key insight: agents are simultaneously **buyers and sellers**. An analyst agent pays a data-miner for scraped data, then charges a research-buyer for the analysis. Aegis makes this supply chain visible and safe.

---

## Architecture

```
AGENT CLIENTS (Claude Code, Cursor, any x402 client)
    |                              |
    v                              v
DATA MINER (Aegis Gate)      ANALYST (Aegis Gate)
  /scrape $0.01                /analyze $0.05
    |                              |
    v                              v
             OWS CORE
  AEGIS POLICIES (budget, guard, deadswitch)
  Wallet Vault | API Keys | Signing Enclave
             |
             v
      AEGIS NEXUS DASHBOARD
  Money Flow | P&L | Policy Log | Budget
```

Every payment flows through OWS core, where the Aegis policy executables intercept and evaluate the transaction before it is signed. Nexus reads the same state files in real time.

---

## Quick Start

```bash
git clone https://github.com/rajkaria/aegis
cd aegis && npm install
cd packages/shared && npx tsc && cd ../policies && npx tsc && cd ../gate && npx tsc && cd ../cli && npx tsc && cd ../..

# Seed the demo economy
cd demo && npx tsx seed.ts

# Start the dashboard
cd ../dashboard && npm run dev
# Open http://localhost:3000

# (Optional) Run the live 3-agent economy
cd ../demo && npx tsx run-economy.ts
```

---

## Aegis Gate

One line of code turns any Express endpoint into a paid API service.

**Server side — publish a paid endpoint:**

```typescript
import { aegisGate } from "@aegis-ows/gate";

app.get(
  "/api/data",
  aegisGate({ price: "0.01", token: "USDC", agentId: "my-agent" }),
  handler
);
```

**Client side — pay and fetch in one call:**

```typescript
import { payAndFetch } from "@aegis-ows/gate";

const result = await payAndFetch("http://service/api/data", "buyer-agent");
```

`aegisGate` handles the full x402 payment challenge/response handshake. The middleware rejects unpaid requests with HTTP 402, accepts payment proofs, and credits the agent's earnings ledger. `payAndFetch` on the client side handles the payment automatically, routing through the OWS signing enclave and all active policies before money moves.

---

## Aegis Policies

Three OWS-compatible policy executables. Each reads a `PolicyContext` from stdin and writes a `PolicyResult` to stdout — the exact interface OWS expects.

### aegis-budget

Per-chain, per-token spending caps with daily, weekly, and monthly limits. Tracks cumulative spend in a local ledger and blocks transactions that would exceed the configured cap.

```json
{
  "limits": [
    { "chainId": "eip155:1", "token": "USDC", "daily": "10.00", "weekly": "50.00" }
  ]
}
```

### aegis-guard

Contract and address allowlist plus blocklist. Any transaction targeting an address not on the allowlist — or explicitly on the blocklist — is rejected before signing. Supports wildcard chain prefixes (`eip155:*`).

```json
{
  "mode": "allowlist",
  "addresses": {
    "eip155:1": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
  }
}
```

### aegis-deadswitch

Dead man's switch. Revokes the agent's signing key after a configurable period of inactivity. Prevents runaway agents from continuing to spend after a session has gone silent.

```json
{
  "inactivity_threshold_minutes": 60,
  "action": "revoke_key"
}
```

---

## Aegis Nexus Dashboard

Four pages, zero database required. Nexus reads live from `~/.ows/aegis/`.

**Economy Overview** — Sankey diagram showing money flowing between agents in real time. Side-by-side agent P&L: every agent's total earned, total spent, and net position. This is the screenshot that makes the economy legible at a glance.

**Agent Detail** — Drill into any agent. Full transaction history, earning vs. spending breakdown, and which services it called or provided.

**Policy Control Center** — Live view of all three policy executables: current config, recent allow/deny decisions, budget consumption bars, and pending actions.

**Services Registry** — Searchable table of all Gate-registered services: endpoint, price, token, and the agent earning from it.

---

## CLI

```bash
# Initialize config directory with defaults
aegis init

# Register policies with OWS
aegis install

# Check budget status
aegis budget
aegis budget --chain eip155:1 --period weekly

# Check wallet and policy status
aegis status

# Manage guard address lists
aegis guard --add 0xA0b8... --chain eip155:1
aegis guard --add 0xBad0... --block
```

---

## Demo Economy

The demo seeds a 3-agent supply chain that runs a full economic cycle:

```
research-buyer  →  analyst  →  data-miner
   pays $0.05      pays $0.01    earns $0.01
   gets report     earns $0.05   scrapes data
```

1. `research-buyer` calls the analyst's Gate-protected `/analyze` endpoint ($0.05)
2. The analyst, needing raw data, calls the data-miner's `/scrape` endpoint ($0.01)
3. Money flows through both agents' OWS wallets, governed by their respective policies
4. Nexus renders the full flow as a Sankey diagram with live P&L for all three agents

Run it: `cd demo && npx tsx run-economy.ts`

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Gate | Express middleware, x402 payment protocol |
| Policies | Node.js executables, OWS policy interface |
| Nexus Dashboard | Next.js 15 + shadcn/ui + Recharts |
| CLI | Commander.js |
| Data | JSON files in `~/.ows/aegis/` |
| OWS Integration | `@open-wallet-standard/core` |

---

## Project Structure

```
aegis/
├── packages/
│   ├── shared/          # Types, file I/O helpers, shared config readers
│   ├── policies/        # aegis-budget, aegis-guard, aegis-deadswitch executables
│   ├── gate/            # Aegis Gate Express middleware + payAndFetch client
│   └── cli/             # aegis CLI (init, install, budget, guard, status)
├── dashboard/           # Aegis Nexus — Next.js dashboard
├── demo/                # 3-agent economy seed scripts
└── turbo.json           # Turborepo monorepo config
```

All packages are TypeScript-first. Shared types (including `PolicyContext` and `PolicyResult` from the OWS spec) live in `packages/shared` and are imported by all other packages.

---

## Why Aegis

**Spans three tracks.** Most submissions pick one. Aegis covers API monetization (Gate), spend governance (Policies), and multi-agent coordination (Nexus) as a unified protocol — not bolted-together features.

**A running economy, not a demo button.** The 3-agent supply chain produces real transactions, real earnings, and real policy decisions. The Sankey diagram in Nexus is live data.

**Extends OWS natively.** The policy executables use the exact stdin/stdout interface OWS defines as its extension point. Gate uses OWS's signing enclave for every payment. Nothing bypasses the standard.

**The Sankey is the pitch.** Watching money flow from research-buyer through analyst to data-miner — all governed by policies, all visible in one dashboard — makes the agent economy legible in a way no amount of text can.

---

## Built For

**[OWS Hackathon](https://hackathon.openwallet.sh/)** — Build with the Open Wallet Standard.

---

## License

MIT
