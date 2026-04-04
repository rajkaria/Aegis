# Aegis — The Agent Commerce Protocol for OWS

[![CI](https://github.com/rajkaria/aegis/actions/workflows/ci.yml/badge.svg)](https://github.com/rajkaria/aegis/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@aegis-ows/gate)](https://www.npmjs.com/package/@aegis-ows/gate)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/demo-useaegis.xyz-blue)](https://useaegis.xyz)

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

**XMTP Discovery** — Agents announce and discover each other's services via wallet-to-wallet messaging before paying. The research-buyer finds the analyst through XMTP, negotiates, then pays via x402. Nobody else combines messaging + payments.

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

Payment verification includes timestamp-based replay protection (payments expire after a configurable window) and cryptographic signature validation to ensure payment proofs cannot be forged or reused.

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

**Economy Overview** — Sankey diagram showing money flowing between agents in real time. Side-by-side agent P&L: every agent's total earned, total spent, and net position. XMTP discovery feed showing agents finding each other. This is the screenshot that makes the economy legible at a glance.

**Agent Detail** — Drill into any agent. Wallet balances (via Zerion), full transaction history, earning vs. spending breakdown, and which services it called or provided. Fund agents via MoonPay on-ramp.

**Policy Control Center** — Interactive editors for all three policy executables. Edit budget limits, guard addresses, and deadswitch thresholds via form inputs. Live enforcement statistics and JSON config preview.

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

Before purchasing, `research-buyer` discovers the analyst via XMTP wallet-to-wallet messaging — browsing service announcements on the shared message bus. The discovery events appear in the Nexus dashboard alongside payment events.

Run it: `cd demo && npx tsx run-economy.ts`

---

## On-Chain Transactions

Aegis executes real payments on Solana devnet. Every supply chain cycle produces verifiable on-chain transactions:

| Payment | Tx Hash | Explorer |
|---------|---------|----------|
| research-buyer → analyst | `JEX7PjWZ...` | [View on Solana Explorer](https://explorer.solana.com/tx/JEX7PjWZLia2NpRVSZGFBUvhqP6cqXMWv5NKXHf2JjZZxkim8Ni5wuiVziNmdLwo4kBLVV7pGM1X3cnhywqb5GA?cluster=devnet) |
| analyst → data-miner | `zBARyaWk...` | [View on Solana Explorer](https://explorer.solana.com/tx/zBARyaWkhfedVrnXEWB9LzGCERwWfkeXm5Fk3GuFJ1fuW2JBxiUDHmHC7NQF3Jz26C9nBJAy5EFDdCkv7iLGB7V?cluster=devnet) |
| + 4 more cycles | | |

Transactions are signed through OWS's secure enclave and broadcast via `ows sign send-tx`. Agent keys never leave the vault.

---

## Autonomous Agents

Aegis agents make independent decisions. The autonomous buyer agent runs in a continuous loop:

- Discovers available services via XMTP before each purchase
- Checks remaining budget against configured spending limits
- Decides whether to buy, skip, or wait based on budget and cost optimization
- Executes purchases through OWS signing with real on-chain settlement
- Self-terminates when budget is exhausted

Run an autonomous economy:
```bash
cd demo && npx tsx run-economy.ts
```

This starts three agents: two sellers (data-miner, analyst) and one autonomous buyer that independently discovers, evaluates, and pays for services — governed by Aegis policies at every step.

---

## Interactive Dashboard

The live dashboard at [useaegis.xyz](https://useaegis.xyz) is fully interactive:

- **Run Economy Cycle** — Click to trigger a supply chain cycle and watch the money flow update in real-time
- **Auto-refresh** — Dashboard polls every 5 seconds to reflect new transactions
- **Policy Editor** — Edit budget limits, guard addresses, and deadswitch config from the browser
- **Management Console** — Create wallets, register policies, fund agents, and send real payments
- **CSV Export** — Download the complete transaction ledger

---

## Management Dashboard

The `/dashboard/manage` page provides a browser-based control panel for the full agent lifecycle:

- **Create Wallets** — Provision new OWS wallets with addresses across all supported chains
- **Register Policies** — Register aegis-budget, aegis-guard, or aegis-deadswitch with OWS, or create custom policies
- **Create API Keys** — Generate keys bound to specific wallets and policies
- **Fund Agents** — Request Solana devnet airdrops to agent wallets
- **Send Payments** — Send real SOL between agent wallets on Solana devnet via OWS signing

Everything the CLI does, available from the browser. On Vercel, wallet operations are view-only.

---

## Tech Stack

Built with TypeScript, Next.js, Express, Solana Web3.js, and the Open Wallet Standard.

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

**Real on-chain payments.** Not mocks. Not simulations. Real SOL transfers on Solana devnet, verifiable on Solana Explorer.

**Extends OWS natively.** The policy executables use the exact stdin/stdout interface OWS defines as its extension point. Gate uses OWS's signing enclave for every payment. Nothing bypasses the standard.

**Uses partner tools.** Zerion for multi-chain wallet balances, MoonPay for agent on-ramp, XMTP for wallet-to-wallet service discovery. Each integration signals "this builder read the brief."

**The Sankey is the pitch.** Watching money flow from research-buyer through analyst to data-miner — all governed by policies, all visible in one dashboard — makes the agent economy legible in a way no amount of text can.

---

## Built For

**[OWS Hackathon](https://hackathon.openwallet.sh/)** — Build with the Open Wallet Standard.

---

## License

MIT
