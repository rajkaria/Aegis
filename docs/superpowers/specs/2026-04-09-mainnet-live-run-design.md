# Aegis Mainnet Live Run — Design Spec
**Date:** 2026-04-09  
**Author:** Raj  
**Status:** Approved

---

## Overview

Deploy the Aegis 3-agent economy to Railway with real mainnet money ($50). Agents transact autonomously across Solana and Base using OWS-signed payments. Document the full journey — tx proofs, agent behavior, economics, and P&L — as a hybrid narrative/technical article published at `useaegis.xyz/docs/live-run`. Open seller endpoints to external agents for real-world interop.

---

## Goals

1. **Prove the tech works on mainnet** — real tx hashes on Solana + Base
2. **Demonstrate cross-chain auto-routing** — PaymentRouter picks cheapest chain per tx
3. **Show agent P&L** — seller agents (miner, analyst) net positive; answers "can agents grow money?"
4. **Open to external agents** — any HTTP agent can discover and pay our endpoints
5. **Publish the article** — narrative + embedded real data on Aegis docs

---

## Scope

**In scope:**
- OWS wallet provider (real signing behind the standard)
- Cross-chain PaymentRouter with `chain: "auto"`
- Real agent capabilities (CoinGecko + DeFiLlama + Claude Haiku)
- Railway deployment (3 services)
- `/metrics` endpoint for dashboard live data
- Interop docs page (`/docs/interop`)
- Article page (`/docs/live-run`)
- Structured logging for article capture

**Out of scope:**
- Reinvestment loop (Option C — future article)
- MoonPay fiat on-ramp (separate integration)
- New agent types beyond the existing 3

---

## Architecture

### Agent Economy

```
External agents (anyone)
        ↓  $0.05 USDC/SOL
  research-buyer (ours, demo only)
        ↓  pays $0.05/analysis
    analyst agent                ← earns, net $0.039/call after costs
        ↓  pays $0.01/scrape
   data-miner agent              ← earns, net $0.01/call (pure profit)
        ↓  calls free APIs
  CoinGecko + DeFiLlama
```

### Agent Capabilities (replacing stubs)

**data-miner** (`/scrape`):
- Fetches real data from CoinGecko (token prices, market cap, volume) and DeFiLlama (protocol TVL)
- Charges: $0.01 USDC per call
- Cost: $0 (free public APIs)
- Net margin: $0.01/call

**analyst** (`/analyze`):
- Receives topic, calls data-miner to get real market data ($0.01)
- Feeds data into Claude Haiku to generate genuine analysis (confidence score, sentiment, key signals)
- Charges: $0.05 USDC per call
- Cost: $0.01 (miner) + ~$0.001 (Haiku) = ~$0.011
- Net margin: ~$0.039/call

**research-buyer** (one-shot):
- Runs 20 autonomous cycles, 10s apart
- Per cycle: discovers analyst via XMTP, health-checks, negotiates if price > 30% of remaining budget, decides buy/skip, pays, logs result
- Budget: $45 in buyer wallet (leaves $5 as reserve)
- Total spend: up to $1.00 (20 × $0.05)
- Exits cleanly after 20 cycles

---

## Wallet & Signing Layer

### OWS Wallet Provider (`packages/gate/src/ows-wallet-provider.ts`)

New module that implements a real OWS-compatible wallet:
- Loads private keys from env vars on startup
- Registers each agent wallet with the OWS runtime via `registerWallet()`
- Handles `signTransaction(agentId, "solana", hex)` with real Solana `Keypair.fromSecretKey()`
- Handles `signTransaction(agentId, "evm", payload)` with viem `privateKeyToAccount()`
- Existing `solana-pay.ts` and EVM adapter call `signTransaction` unchanged — OWS remains the genuine interface

### Wallet Funding Plan

| Wallet | Chain | Amount | Purpose |
|--------|-------|--------|---------|
| buyer-sol | Solana | $22.50 SOL | Pay analyst (Solana path) |
| buyer-base | Base | $22.50 USDC | Pay analyst (Base path) |
| analyst-sol | Solana | $1.25 SOL | Float + gas |
| analyst-base | Base | $1.25 USDC | Float + gas |
| miner-sol | Solana | $1.25 SOL | Float + gas |
| miner-base | Base | $1.25 USDC | Float + gas |

Total: $50. Private keys stored only in Railway secrets — never in code or git.

### Railway Secrets (per service)

```
SOLANA_RPC_URL
BASE_RPC_URL  
ANTHROPIC_API_KEY          # analyst only
DATA_MINER_SOL_KEY         # base58
DATA_MINER_BASE_KEY        # hex 0x...
ANALYST_SOL_KEY
ANALYST_BASE_KEY
BUYER_SOL_KEY
BUYER_BASE_KEY
```

---

## Cross-Chain Payment Router

`PaymentRouter.sendPaymentAuto()` is wired into `payAndFetch()`:

1. Fetch fee estimates from Solana adapter + Base EVM adapter in parallel
2. Pick cheapest — Solana wins most times (~$0.00025/tx vs ~$0.001 on Base)
3. Auto-switch to Base if Solana RPC is slow or fees spike
4. Return `{ txHash, chain, feePaid, amount }` — all logged

Every payment decision is logged as:
```json
{ "cycle": 7, "chain": "solana", "fee": 0.00024, "amount": 0.05, "txHash": "3xK9...", "topic": "DeFi yield farming" }
```

---

## Railway Deployment

### Services

| Service | Runs 24/7? | Public URL |
|---------|-----------|------------|
| `aegis-data-miner` | Yes | `https://aegis-data-miner.up.railway.app` |
| `aegis-analyst` | Yes | `https://aegis-analyst.up.railway.app` |
| `aegis-buyer` | No (one-shot) | Internal only |

Each service has a `Dockerfile` (Node 20, tsx). Miner and analyst announce themselves via XMTP on startup with their Railway public URLs.

### Dashboard Live Data

Seller agents expose `GET /metrics` returning:
```json
{ "earned": 0.45, "calls": 45, "netMargin": 0.039, "txHistory": [...] }
```

`dashboard/src/lib/data-provider.ts` reads `METRICS_URL` env var → live data flows into Nexus dashboard on Vercel.

---

## Structured Logging for Article

Each agent emits structured JSON lines to stdout:
```
[AEGIS] {"event":"payment","cycle":1,"chain":"solana","amount":0.05,"fee":0.00024,"txHash":"...","topic":"...","timestamp":"..."}
[AEGIS] {"event":"decision","cycle":2,"action":"skip","reason":"cost optimization"}
[AEGIS] {"event":"earn","amount":0.05,"net":0.039,"totalEarned":0.45}
```

Buyer exposes `GET /run-report` returning full session JSON — used to generate the article's data tables.

---

## Article: `useaegis.xyz/docs/live-run`

New page at `dashboard/src/app/(landing)/docs/live-run/page.tsx`.

**Sections:**
1. The Setup — what we built, which chains, why $50
2. Funding the Wallets — wallet addresses, funding tx links (Solscan + Basescan)
3. Going Live — Railway deploy, XMTP announcement
4. The Run — real log output, cycle-by-cycle, chain selections, tx hashes
5. The Economics — final P&L table (miner: +$X, analyst: +$Y net, buyer: -$Z, gas: -$W)
6. External Agents — any txs from third-party agents paying our endpoints
7. What's Next — reinvestment loop, more sellers, the network effect

---

## Interop Docs: `useaegis.xyz/docs/interop`

New page at `dashboard/src/app/(landing)/docs/interop/page.tsx`.

Covers:
- Any HTTP agent can call our endpoints (no Aegis required)
- How x402 works: send request → get 402 → sign payment → retry
- Three tiers: raw HTTP, `payAndFetch()` npm, full `aegisGate()` seller
- Code examples in JS/TS and curl
- Live endpoint URLs for miner and analyst

---

## P&L Model (20-cycle run)

| Agent | Revenue | Costs | Net |
|-------|---------|-------|-----|
| data-miner | $0.20 (20 calls × $0.01) | $0 | **+$0.20** |
| analyst | $1.00 (20 calls × $0.05) | $0.22 (miner + Haiku) | **+$0.78** |
| research-buyer | $0 | $1.00 | **-$1.00** |
| Gas (all agents) | — | ~$0.02 | **-$0.02** |

Remaining in buyer wallet: ~$49. Available to external buyers or future cycles.

**Answer to "can agents grow money?":** Yes — seller agents net positive on every call as long as there are buyers. The economy is self-sustaining.

---

## Files to Create / Modify

### New files
- `packages/gate/src/ows-wallet-provider.ts`
- `demo/agents/data-miner.Dockerfile`
- `demo/agents/analyst.Dockerfile`
- `demo/agents/buyer.Dockerfile`
- `dashboard/src/app/(landing)/docs/live-run/page.tsx`
- `dashboard/src/app/(landing)/docs/interop/page.tsx`

### Modified files
- `packages/gate/src/solana-pay.ts` — use OWS wallet provider, not stub
- `packages/integrations/src/payments/evm/adapter.ts` — use OWS wallet for Base signing
- `demo/agents/data-miner.ts` — real CoinGecko + DeFiLlama data
- `demo/agents/analyst.ts` — Claude Haiku integration, structured logging
- `demo/agents/autonomous-buyer.ts` — `chain: "auto"` routing, structured logging, `/run-report`
- `dashboard/src/lib/data-provider.ts` — `METRICS_URL` live data support
- `dashboard/src/app/(landing)/docs/page.tsx` — add Live Run + Interop cards

---

## Success Criteria

- [ ] All 3 agents deployed on Railway with real wallets
- [ ] At least one real Solana tx and one real Base tx executed
- [ ] Miner and analyst show net positive P&L
- [ ] Public endpoints accessible to any HTTP agent
- [ ] Dashboard shows live metrics from Railway agents
- [ ] Article published with real tx hashes embedded
- [ ] Interop docs page live
