# Aegis — The Agent Commerce Protocol for OWS

## Build Spec for OWS Hackathon

**Hackathon:** OWS Hackathon — Build with the Open Wallet Standard
**URL:** https://hackathon.openwallet.sh/
**Submissions Open:** Friday, April 3 at 9 AM EDT (TODAY)
**Format:** Three rounds of building, back to back
**Primary Track:** Track 3 — Pay-Per-Call Services & API Monetization ($3K 1st, $1K 2nd)
**Grand Prize Target:** $10,000 (1st place overall — project spans Track 2 + 3 + 4)
**Total Prize Pool:** $50,000

---

## PRIZE STRUCTURE

| Prize | Amount | Our Target |
|-------|--------|------------|
| Grand Prize (1st overall) | $10,000 | 🎯 PRIMARY |
| 1st per Track × 5 | $3,000 each | 🎯 Track 3 |
| 2nd per Track × 5 | $1,000 each | Fallback |
| Bonus Credits | $20,000 | Nice to have |

**Strategy:** Win Track 3 ($3K) AND compete for Grand Prize ($10K) by building a project that spans Track 2 + 3 + 4. The Grand Prize goes to the most impressive overall project — not the best single-track entry.

---

## STRATEGIC ANALYSIS

### What Will Lose (Ideas listed publicly — everyone will clone these)

**Track 2 clones (20+ expected):**
- SpendOS dashboard (idea #1) — every team with Claude will build this
- Audit log viewer (idea #8) — simple, low differentiation
- Dead man's switch (idea #4) — single policy, not enough for 1st

**Track 3 clones (15+ expected):**
- Simple x402 API wrapper (idea #1) — trivial to build
- Pay-per-query database (idea #2) — needs real data, hard to demo
- Generic paywall middleware (idea #6) — commodity

**Track 5 clones (10+ expected):**
- AI Poker (idea #1) — flashy but everyone will try it
- 100 Agents simulation (idea #2) — complex, most will fail

### What Wins Grand Prize

The Grand Prize goes to whoever demonstrates the most complete, working, novel agent economy. This means:

1. **Multiple agents transacting with real money (testnet)**
2. **Policies actually enforcing safety**
3. **A live visualization showing the economy**
4. **Novel architecture, not just a wrapper**
5. **Uses OWS deeply — wallets, policies, API keys, signing**

### Why Aegis Wins

Nobody will build all three layers (monetization + governance + economy visualization) into one cohesive project. Everyone will pick one track and build a single-purpose tool. Aegis is the only project that tells a COMPLETE STORY: agents earn (Gate), agents spend safely (Policies), and humans see everything (Nexus).

---

## PRODUCT VISION

### One-liner
**Aegis — the commerce protocol for agent economies. Monetize any API with x402, govern agent spending with OWS policies, and visualize the economy in real-time.**

### Vision (< 256 chars)
Aegis turns AI agents into economic actors. Agents earn via x402-gated services, spend within policy guardrails, and operate transparently — one OWS wallet, one dashboard, one protocol.

---

## THE THREE LAYERS

### Layer 1: Aegis Gate (Track 3 — API Monetization)

**What:** Express middleware that wraps any API endpoint behind x402 micropayments on any OWS-supported chain. One config file → your API earns USDC per call.

**Track 3 alignment:** This IS idea #5 "Paid MCP server toolkit" + idea #1 "Zero-account API gateway" combined into one reusable package.

**Developer Experience:**
```typescript
import express from "express";
import { aegisGate } from "@aegis/gate";

const app = express();

// One line: this endpoint now costs $0.01 per call via x402
app.get("/api/scrape", aegisGate({ price: "0.01", token: "USDC" }), (req, res) => {
  // Your existing handler — Aegis already verified payment
  res.json({ data: scrapedResults });
});
```

**Config: `aegis.config.json`**
```json
{
  "walletName": "data-agent",
  "network": "eip155:1",
  "endpoints": {
    "/api/scrape": {
      "price": "0.01",
      "token": "USDC",
      "description": "Web scraping service"
    },
    "/api/analyze": {
      "price": "0.05",
      "token": "USDC",
      "description": "Sentiment analysis"
    },
    "/api/health": {
      "price": "0",
      "description": "Free health check"
    }
  }
}
```

**x402 Flow:**
```
Client Agent                        Aegis Gate                    Service
    │                                   │                            │
    │  GET /api/scrape                  │                            │
    │──────────────────────────────────>│                            │
    │                                   │                            │
    │  402 Payment Required             │                            │
    │  { x402Version: 1,               │                            │
    │    price: "0.01",                 │                            │
    │    payTo: "OWS_WALLET_ADDR",      │                            │
    │    token: "USDC" }                │                            │
    │<──────────────────────────────────│                            │
    │                                   │                            │
    │  OWS signs payment tx             │                            │
    │  Retries with X-PAYMENT header    │                            │
    │──────────────────────────────────>│                            │
    │                                   │  Verifies payment on-chain │
    │                                   │  Logs to Aegis ledger      │
    │                                   │  Forwards to handler       │
    │                                   │─────────────────────────>  │
    │                                   │  <── result ──────────────  │
    │  <── result ──────────────────────│                            │
```

### Layer 2: Aegis Policies (Track 2 — Spend Governance)

**What:** Three OWS policy executables that plug into the standard policy engine interface. Each is a standalone Node.js script that receives `PolicyContext` on stdin and returns `PolicyResult` on stdout.

#### Policy 1: `aegis-budget` — Spending Caps

Per-chain, per-token, per-period spending limits. Maintains a local spending ledger.

```json
// ~/.ows/aegis/policies/budget.config.json
{
  "limits": [
    { "chainId": "eip155:1", "token": "USDC", "daily": "10.00", "monthly": "200.00" },
    { "chainId": "solana:*", "token": "USDC", "daily": "25.00" },
    { "chainId": "*", "token": "*", "daily": "100.00" }
  ]
}
```

**OWS Integration:**
```json
// Policy registered in OWS config
{
  "id": "aegis-budget",
  "name": "Aegis Budget Policy",
  "executable": "/usr/local/bin/aegis-policy-budget",
  "config": { "configPath": "~/.ows/aegis/policies/budget.config.json" },
  "action": "deny"
}
```

#### Policy 2: `aegis-guard` — Address Allowlist/Blocklist

Only allow transactions to known-safe contract/wallet addresses.

```json
{
  "mode": "allowlist",
  "addresses": {
    "eip155:1": ["0xUSDC_CONTRACT...", "0xUNISWAP..."],
    "solana:*": ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]
  }
}
```

#### Policy 3: `aegis-deadswitch` — Dead Man's Switch

If the agent hasn't signed a transaction within N minutes, auto-revokes its API key. Prevents runaway agents from sitting on funds.

```json
{
  "maxInactiveMinutes": 30,
  "onTrigger": "revoke_key",
  "recoveryWallet": "0xHUMAN_WALLET...",
  "sweepFunds": true
}
```

**This directly implements Track 2 idea #4 — "Dead man's switch"** — one of the most novel safety primitives listed.

### Layer 3: Aegis Nexus Dashboard (Grand Prize Differentiator)

**What:** A real-time web dashboard showing the entire agent economy: who's earning, who's spending, policy enforcement events, per-agent P&L, and money flow between agents.

**This is NOT just Track 2's "audit log forensics" (idea #8).** It's a FULL ECONOMY VISUALIZER that combines earning data (from Gate) + spending data (from Policies) + inter-agent flows into one view.

#### Dashboard Pages

**Overview — The Economy at a Glance**
```
┌──────────────────────────────────────────────────────────────┐
│  AEGIS NEXUS — Agent Economy Dashboard                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Agents: 3          │ Total Volume: $2.47  │ Policies: 3 active│
│                                                               │
│  ┌─── MONEY FLOW (Sankey Diagram) ──────────────────────────┐│
│  │                                                           ││
│  │  Research Buyer ──$0.50──> Analyst ──$0.10──> Data Miner  ││
│  │       ($0.50 spent)       ($0.40 profit)   ($0.10 earned) ││
│  │                                                           ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─── AGENT P&L ────────────────────────────────────────────┐│
│  │  Agent            │ Revenue  │ Cost    │ P&L     │ Status ││
│  │  Data Miner       │ $0.10    │ $0.03   │ +$0.07  │ 🟢     ││
│  │  Analyst          │ $0.50    │ $0.10   │ +$0.40  │ 🟢     ││
│  │  Research Buyer   │ $0.00    │ $0.50   │ -$0.50  │ 🔴     ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─── LIVE ACTIVITY FEED ───────────────────────────────────┐│
│  │  12:03 ✅ Research Buyer → x402 pay → $0.05 → Analyst    ││
│  │  12:02 ✅ Analyst → x402 pay → $0.01 → Data Miner        ││
│  │  12:01 🚫 Research Buyer → BLOCKED by aegis-budget        ││
│  │       "Daily USDC limit exceeded: $0.50/$0.50"            ││
│  │  11:59 ⚡ aegis-deadswitch → heartbeat OK for Data Miner  ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  [Export CSV]  [View Policy Log]  [Manage Agents]             │
└──────────────────────────────────────────────────────────────┘
```

**Per-Agent Detail**
- Revenue breakdown by endpoint (which services are earning)
- Spending breakdown by vendor (which services the agent is buying)
- Policy enforcement history (blocks, warnings)
- Budget consumption bars
- Wallet balance across chains

**Policy Control Center**
- Visual policy editor (generate config JSON from form inputs)
- Active/inactive toggle per policy per agent
- Enforcement statistics

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT CLIENTS                                  │
│     (Claude Code, Cursor, any x402-capable HTTP client)          │
└──────────┬────────────────────────────────────────┬──────────────┘
           │ x402 payments                          │ x402 payments
           ▼                                        ▼
┌─────────────────────┐              ┌─────────────────────────────┐
│  DATA MINER AGENT   │              │    ANALYST AGENT            │
│  Express + Aegis Gate│              │    Express + Aegis Gate     │
│  /scrape → $0.01    │              │    /analyze → $0.05         │
│  OWS wallet: "miner"│              │    OWS wallet: "analyst"    │
│  Earns: $0.10       │◄─── x402 ───│    Buys from miner: $0.10   │
│  Policies: budget,  │              │    Earns from buyer: $0.50  │
│    guard             │              │    Policies: budget, guard   │
└──────────┬──────────┘              └──────────────┬──────────────┘
           │                                        │
           │  All tx data logged to                  │
           │  ~/.ows/aegis/                          │
           ▼                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OWS CORE                                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              AEGIS POLICY EXECUTABLES                     │   │
│  │  aegis-budget │ aegis-guard │ aegis-deadswitch            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Wallet Vault (~/.ows/)  │  API Keys  │  Signing Enclave         │
└──────────────────────────────────────────────────────────────────┘
           │
           │  Reads tx logs, policy events, earnings data
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                AEGIS NEXUS DASHBOARD (Next.js 15)                │
│                                                                  │
│  Money Flow Viz │ Per-Agent P&L │ Policy Log │ Budget Bars       │
└─────────────────────────────────────────────────────────────────┘
```

---

## TECH STACK

| Component | Technology |
|-----------|-----------|
| Aegis Gate (middleware) | TypeScript + Express middleware |
| x402 Payment Handling | Custom x402 server implementation (parse 402, verify payment) |
| Policy Executables | TypeScript (Node.js scripts, OWS-compatible stdin/stdout) |
| Nexus Dashboard | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Economy Visualization | Recharts (Sankey diagram for money flow) + custom components |
| Data Persistence | File-based JSON at `~/.ows/aegis/` (follows OWS local-first philosophy) |
| OWS Integration | `@open-wallet-standard/core` npm + `ows` CLI |
| Partner Tools | MoonPay CLI (for on-ramp), Zerion API (for balance queries) |

---

## PARTNER TOOL INTEGRATION (Bonus Points)

Using hackathon partner tools signals "this builder read the brief":

| Partner | Integration | How |
|---------|------------|-----|
| **MoonPay CLI** | Agent on-ramp: fund OWS wallets with `mp buy` | Agents top up their wallets when balance is low |
| **Zerion API** | Dashboard: query multi-chain wallet balances | Nexus shows live wallet state across all chains |
| **XMTP** | Agent-to-agent messaging for service discovery | Agents announce services via XMTP, negotiate before x402 payment |
| **Allium** | Dashboard: query on-chain tx data for verification | Verify x402 payments hit the chain |

XMTP integration is the most novel: agents discover each other's services via wallet-to-wallet messages, THEN pay via x402. Nobody else will combine messaging + payments.

---

## FILE STRUCTURE

```
aegis/
├── packages/
│   ├── gate/                        # Aegis Gate — x402 payment middleware
│   │   ├── src/
│   │   │   ├── index.ts             # aegisGate() Express middleware
│   │   │   ├── x402/
│   │   │   │   ├── response.ts      # Generate 402 response with payment details
│   │   │   │   ├── verify.ts        # Verify X-PAYMENT header (check on-chain)
│   │   │   │   └── types.ts         # x402 types
│   │   │   ├── earnings.ts          # Track revenue per endpoint
│   │   │   └── config.ts            # Parse aegis.config.json
│   │   └── package.json
│   │
│   ├── policies/                    # OWS Policy Executables
│   │   ├── budget/
│   │   │   ├── index.ts             # stdin → PolicyContext → evaluate → stdout
│   │   │   └── ledger.ts            # Read/write ~/.ows/aegis/budget-ledger.json
│   │   ├── guard/
│   │   │   └── index.ts
│   │   ├── deadswitch/
│   │   │   ├── index.ts
│   │   │   └── heartbeat.ts         # Track last activity timestamp
│   │   └── package.json
│   │
│   └── cli/                         # Aegis CLI
│       ├── src/
│       │   ├── index.ts
│       │   └── commands/
│       │       ├── init.ts           # aegis init → scaffold config + install policies
│       │       ├── approve.ts        # aegis approve <id>
│       │       ├── budget.ts         # aegis budget show / aegis budget set
│       │       └── status.ts         # aegis status → show agent P&L
│       └── package.json
│
├── dashboard/                       # Aegis Nexus Dashboard
│   ├── src/app/
│   │   ├── page.tsx                 # Economy overview + Sankey flow
│   │   ├── agents/[id]/page.tsx     # Per-agent detail
│   │   ├── policies/page.tsx        # Policy control center
│   │   └── api/
│   │       ├── economy/route.ts     # Read from ~/.ows/aegis/ → return economy state
│   │       ├── agents/route.ts      # List agents with P&L
│   │       └── events/route.ts      # Policy enforcement log
│   └── package.json
│
├── demo/                            # Hackathon Demo — 3-agent economy
│   ├── agents/
│   │   ├── data-miner/              # Sells web scraping at $0.01/call
│   │   │   ├── server.ts            # Express + Aegis Gate
│   │   │   └── aegis.config.json
│   │   ├── analyst/                 # Buys from miner, sells analysis at $0.05
│   │   │   ├── server.ts
│   │   │   └── aegis.config.json
│   │   └── research-buyer/          # Buys from analyst, has $0.50 budget
│   │       └── agent.ts             # Client agent that discovers + pays
│   ├── setup.sh                     # Create 3 OWS wallets, install policies, fund
│   └── run-economy.sh               # Start all 3 agents + dashboard
│
├── turbo.json
├── package.json
└── README.md
```

---

## BUILD SEQUENCE

### Phase 1: OWS Foundation + Policies (Day 1-2)

1. **Install OWS, create wallets, study the codebase:**
   ```bash
   curl -fsSL https://openwallet.sh/install.sh | bash
   ows wallet create --name "data-miner"
   ows wallet create --name "analyst"
   ows wallet create --name "research-buyer"
   ls ~/.ows/
   ```

2. **Read spec docs in order:**
   - `docs/03-policy-engine.md` — HOW POLICIES WORK (critical)
   - `docs/04-agent-access-layer.md` — MCP server + API keys
   - `docs/02-signing-interface.md` — sign operations
   - `skills/ows/` — existing MCP server code

3. **Write "hello world" policy:**
   - Script that reads PolicyContext from stdin, logs it, returns `{allow: true}`
   - Register with OWS, verify it gets called during signing
   - **THIS IS THE MAKE-OR-BREAK STEP.** If this works, everything else flows.

4. **Build aegis-budget policy:**
   - Read PolicyContext → check spending ledger → evaluate limits → return result
   - Spending ledger at `~/.ows/aegis/budget-ledger.json`
   - Test: sign tx → budget logs spend → sign again → verify limit check

5. **Build aegis-guard and aegis-deadswitch:**
   - Guard: parse tx → extract target address → check allowlist
   - Deadswitch: check last activity timestamp → revoke if stale

### Phase 2: Aegis Gate Middleware (Day 2-4)

6. **Build x402 payment verification:**
   - Understand x402 flow: 402 response format → payment header → on-chain verification
   - For hackathon: can start with mock verification (check signature validity) and add on-chain verification if time permits
   - Key: the 402 response must include OWS wallet address as `payTo`

7. **Build aegisGate() Express middleware:**
   - Check request for X-PAYMENT header
   - If missing → return 402 with payment details
   - If present → verify payment → forward to handler
   - Log earning to `~/.ows/aegis/earnings-ledger.json`

8. **Build demo Data Miner agent:**
   - Express server with `/scrape` endpoint behind Aegis Gate
   - Simple implementation: fetch a URL, return text content
   - Price: $0.01/call
   - Verify: call without payment → get 402; call with payment → get data

9. **Build demo Analyst agent:**
   - Express server with `/analyze` endpoint behind Aegis Gate
   - Implementation: calls Data Miner (pays via x402), summarizes result
   - Price: $0.05/call
   - This agent is both a SELLER (via Gate) and a BUYER (via x402 client)

### Phase 3: Nexus Dashboard (Day 4-6)

10. **Build economy data API:**
    - Reads earnings ledger + budget ledger + policy enforcement log
    - Aggregates per-agent P&L
    - Returns economy state as JSON

11. **Build dashboard pages:**
    - Overview: Sankey money flow diagram + agent P&L table + activity feed
    - Per-agent detail: revenue, costs, policy events, budget bars
    - Policy control: view active policies, edit configs via forms

12. **Add Zerion API integration:**
    - Query real wallet balances across chains
    - Show in dashboard alongside Aegis-tracked spending

### Phase 4: Demo Economy + Polish (Day 6-8)

13. **Wire up the full 3-agent economy:**
    - Research Buyer agent with $0.50/day budget
    - Buys from Analyst → Analyst buys from Data Miner
    - Run all three simultaneously
    - Dashboard shows real-time money flow

14. **Add XMTP agent discovery (if time):**
    - Agents announce services via XMTP wallet-to-wallet messages
    - Research Buyer discovers Analyst via XMTP before paying via x402
    - Novel combination nobody else will do

15. **Record demo video (2-3 minutes)**

16. **Write comprehensive README**

17. **Deploy dashboard to Vercel**

---

## DEMO VIDEO SCRIPT (2-3 minutes)

```
0:00-0:15 — The Problem
"AI agents can think. With OWS, they can hold money.
But an economy needs more than wallets —
it needs commerce, governance, and transparency."

0:15-0:30 — Aegis in 15 Seconds
"Aegis is a commerce protocol for OWS.
Agents earn via x402-gated services.
Agents spend within policy guardrails.
A live dashboard shows the economy."

0:30-1:00 — Aegis Gate: Agents Earn
[Terminal] Start Data Miner server with Aegis Gate
[Terminal] curl → gets 402 → show payment details
[Terminal] Agent pays via OWS wallet → gets scraped data
"One middleware. Any API becomes a paid service."

1:00-1:30 — Aegis Policies: Agents Spend Safely
[Terminal] Research Buyer tries to buy 50 reports ($2.50)
[Terminal] aegis-budget BLOCKS at $0.50 daily limit
[Dashboard] Policy enforcement log shows the block with reason
"The agent tried to overspend. Aegis said no."

1:30-2:10 — The Economy Running Live
[Dashboard] Full Nexus view:
  - Sankey diagram: money flowing Buyer → Analyst → Miner
  - P&L table: Miner +$0.07 profit, Analyst +$0.40, Buyer -$0.50
  - Activity feed updating in real-time
  - Budget bars showing consumption
"Three agents. Three OWS wallets. One economy.
Every transaction tracked. Every policy enforced.
This is what autonomous commerce looks like."

2:10-2:30 — Closing
"Aegis Gate for earning. Aegis Policies for safety.
Aegis Nexus for visibility.
OWS is the vault. Aegis is the economy."
```

---

## WINNING EDGE: Why This Beats Every Other Submission

### 1. Spans 3 Tracks (Grand Prize Play)
- Track 3: Aegis Gate (API monetization via x402)
- Track 2: Aegis Policies (spend governance)
- Track 4: 3-agent demo economy (multi-agent systems)
No single-track project can compete with this breadth.

### 2. The Demo Shows a Running Economy
Most projects will demo a single agent doing one thing. Aegis demos an ECONOMY: supply chains, P&L, policy enforcement, money flow — all live. Judges remember spectacle.

### 3. Uses Partner Tools (Bonus Points)
Zerion API for balance queries, XMTP for agent discovery, MoonPay CLI for on-ramp. Each partner integration = one more sponsor who wants you to win.

### 4. Extends OWS (Not Just Uses It)
Policy executables are OWS-native extensions. MoonPay can ship these as official recommended policies. You're contributing to the ecosystem, not just building on top.

### 5. Practical Novelty
"Paid MCP toolkit" and "SpendOS" exist as ideas. Nobody has combined them into a protocol where agents are simultaneously buyers AND sellers, governed by the same policy engine, with a unified P&L dashboard. That's the novel insight.

### 6. The Sankey Diagram
The money flow visualization is the "screenshot that wins." When judges share the project in their Slack, it's the Sankey diagram of money flowing between agents that gets people to click. Visual distinction matters.

---

## KEY REFERENCE LINKS

### OWS Core
| Resource | URL |
|----------|-----|
| OWS Website | https://openwallet.sh/ |
| OWS Docs | https://docs.openwallet.sh/ |
| OWS GitHub | https://github.com/open-wallet-standard/core |
| OWS npm | `@open-wallet-standard/core` |
| Install | `curl -fsSL https://openwallet.sh/install.sh \| bash` |
| Policy Engine Spec | `docs/03-policy-engine.md` in repo |
| Agent Access Spec | `docs/04-agent-access-layer.md` in repo |
| OWS Skills (MCP) | `skills/ows/` in repo |

### Hackathon
| Resource | URL |
|----------|-----|
| Hackathon Page | https://hackathon.openwallet.sh/ |
| MoonPay CLI Docs | MoonPay Skills — 54 tools across 17 skills |
| MoonPay MCP Server | `mp mcp` command |

### Partner Tools
| Partner | URL / Package |
|---------|--------------|
| Zerion API | Multi-chain portfolio/token API |
| Zerion MCP Server | Connect AI tools to onchain data |
| XMTP JS SDK | Wallet-to-wallet messaging |
| XMTP React SDK | React hooks for XMTP chat |
| Allium Explorer API | Query decoded blockchain data |
| MoonPay CLI | `mp` command — swaps, bridges, on-ramp |
| Myriad SDK | On-chain prediction markets |

### x402 Protocol
| Resource | URL |
|----------|-----|
| x402 Spec | https://www.x402.org/ |
| Coinbase x402 Docs | https://docs.cdp.coinbase.com/x402/docs/welcome |

---

## CRITICAL FIRST STEP (Do This Tonight)

```bash
# 1. Install OWS
curl -fsSL https://openwallet.sh/install.sh | bash

# 2. Create test wallets
ows wallet create --name "test-agent"
ows wallet list

# 3. Explore the vault
ls -la ~/.ows/
cat ~/.ows/wallets/  # understand the structure

# 4. Read the policy engine spec
# Clone the repo and read docs/03-policy-engine.md

# 5. Write hello-world policy
echo '{"allow": true}' > /tmp/test-policy.sh
chmod +x /tmp/test-policy.sh
# Figure out how to register it with OWS

# 6. If policy executable interface works → you're golden
# If it doesn't → dig into source code or ask in their Discord
```

**The #1 risk remains the policy executable interface.** OWS is 10 days old. Test it before building anything else. If it works as documented, the entire Aegis build is straightforward TypeScript. If it doesn't, you need to adapt.
