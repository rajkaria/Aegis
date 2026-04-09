# Aegis Product V1 — Design Spec

**Date:** 2026-04-10
**Status:** Draft
**Goal:** First external agent deployed on Aegis within 1 week of development completion

---

## 1. Positioning

**One sentence:** Aegis is Stripe for AI agents — framework-agnostic financial infrastructure that lets any agent earn, spend, and be governed.

**Why now:** Every major AI framework (LangChain, CrewAI, AutoGPT, Eliza) produces agents that need to call paid APIs, buy data, or sell their outputs. None of them include payment rails, budget controls, or treasury visibility. Developers bolt together Stripe + custom wallet logic + spreadsheet tracking. Aegis replaces all of that with one install.

**Moat:** Network effects. Every agent that earns through Aegis Gate creates demand for other agents to pay through Aegis. Transaction history, reputation scores, and policy configurations accumulate over time — switching costs grow with usage, but entry cost is zero.

---

## 2. Target User

**Primary persona: The AI Tool Builder**

> A developer (solo or small team, 1-5 people) who has built an AI agent or API tool that needs to charge for its work OR pay for services from other agents. They use LangChain, CrewAI, Eliza, or custom Node.js/Python. They don't want to build wallet management, payment signing, budget enforcement, or audit trails.

**Characteristics:**
- Ships fast, evaluates tools in < 10 minutes
- Already has a working agent/tool, needs monetization
- Crypto-comfortable but not crypto-maximalist (wants USD-denominated value, tolerates on-chain rails)
- Reads GitHub READMEs, not whitepapers

**Anti-persona:** Enterprises with compliance teams, non-technical founders wanting no-code, crypto degens looking for token plays.

---

## 3. Monetization

**Model: Freemium + Transaction Fee (Stripe playbook)**

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 3 agents, $500/mo flow, community support |
| Pro | $29/mo | Unlimited agents, $25K/mo flow, priority support, advanced policies, team seats |
| Scale | $99/mo | $250K/mo flow, custom policies, API rate limits 10x, webhook integrations |

**Transaction fee:** 0.5% on all flow above the tier's included amount. First $500 (Free) or $25K (Pro) per month is fee-free.

**Why this works:**
- Zero friction to start (no credit card for Free tier)
- Revenue scales with customer success, not arbitrary feature gates
- 0.5% is low enough that agents won't route around it (Stripe charges 2.9%)
- The dashboard + policies are the value, not the payment rail itself

**Revenue target:** 100 Pro users = ~$35K ARR + transaction fees. Achievable within 6 months of launch if developer onboarding is < 5 minutes.

---

## 4. V1 Scope — What Ships

V1 is ruthlessly scoped to the minimum that gets the first 10 external developers to deploy agents.

### Must Have (Week 1-2)
1. **`npx create-aegis-agent` CLI** — scaffolds a new agent project with Aegis Gate pre-wired. Prompts for: agent name, what it does, which template (or blank). Outputs a deployable Node.js project.
2. **3 starter templates:**
   - **API Monetizer** — wraps any existing API behind x402 payments. Developer points it at their API, Aegis handles auth + payment + metering.
   - **Data Scraper** — a web scraper agent that sells structured data. Pre-built with Puppeteer/Cheerio, Aegis Gate on the output endpoint.
   - **LLM Proxy** — wraps any LLM API (OpenAI, Anthropic, etc.) and resells with markup. Good for specialized system prompts.
3. **Agent Directory (web)** — public page at `/marketplace` listing all agents deployed on Aegis with: name, description, price per call, reputation score, sample request/response. Searchable.
4. **One-click agent creation in dashboard** — the existing Create Agent form, enhanced: pick template, set price, get deployment instructions.
5. **Python SDK** — `pip install aegis-sdk`. Wraps the HTTP API. `aegis.pay(agent_url, params)` to call any Aegis-powered agent. `@aegis.gate(price="0.001")` decorator for Flask/FastAPI.

### Must Have (Week 3)
6. **Usage dashboard** — per-agent: requests served, revenue earned, costs paid, net P&L over time. This already exists but needs polish for multi-tenant.
7. **Webhook notifications** — POST to user's URL on: payment received, budget threshold hit, agent health check failed.
8. **XMTP + Directory hybrid discovery** — agents register capabilities on creation, browsable in web directory, discoverable via XMTP by other agents.

### Nice to Have (Week 4+)
9. **One-click Railway deploy** — `aegis deploy` from CLI pushes to Railway with env vars pre-configured.
10. **Agent-to-agent orchestration** — an agent can discover, evaluate (by reputation), and hire other agents through the SDK.
11. **Spend alerts** — email/Slack when budget hits configurable thresholds (50%, 80%, 100%).

### NOT in V1
- No Aegis-hosted compute (users deploy wherever they want)
- No token or ICO
- No enterprise SSO/SAML
- No custom policy scripting language (3 built-in policies are enough)
- No mobile app
- No real-time chat between agent operators (use Discord/Slack)

---

## 5. Agent Templates

Templates are the viral loop. A developer who deploys a template in 5 minutes becomes an advocate.

### Template Architecture
Each template is a standalone Node.js project with:
```
my-agent/
  package.json          # aegis-ows-gate as dependency
  src/index.ts          # Express server with aegisGate() middleware
  src/agent.ts          # Agent logic (the differentiator)
  aegis.config.json     # Agent name, price, description, policies
  Dockerfile            # Railway/Fly-ready
  README.md             # One-command deploy instructions
```

### Template 1: API Monetizer
**Use case:** "I have an API that returns useful data. I want to charge per call."
**Setup:** User provides their API URL. Template creates a proxy that validates payment, forwards request, returns response.
**Time to revenue:** < 5 minutes.
**Example:** A developer has a sentiment analysis API. They wrap it with Aegis. Other agents pay $0.001 per call.

### Template 2: Data Scraper
**Use case:** "I want to sell structured data from websites."
**Setup:** User configures target URLs and output schema. Agent scrapes on schedule, serves data via paid endpoint.
**Time to revenue:** ~15 minutes (needs to configure scrape targets).

### Template 3: LLM Proxy
**Use case:** "I have a specialized system prompt that makes GPT-4 great at [X]. I want to sell access."
**Setup:** User provides their OpenAI key + system prompt. Template wraps it as a paid API.
**Time to revenue:** < 5 minutes.
**Margin:** User sets price above their LLM cost. Aegis shows the margin in the dashboard.

### Future Templates (post-V1)
- **Content Generator** — blog posts, social media, product descriptions
- **Code Reviewer** — automated PR review agent
- **Research Agent** — multi-source research with citations
- **Trading Signal** — financial data aggregation + analysis

---

## 6. Marketplace & Discovery

### How it works

**For humans (web directory):**
- `/marketplace` page on aegis-ows.vercel.app
- Lists all public agents with: name, description, price, reputation score, total calls served, sample request
- Search by keyword, filter by price range, sort by reputation
- Each agent has a detail page with: API docs, pricing, live health status, transaction history
- "Try it" button sends a test request (first call free)

**For agents (XMTP + registry API):**
- On agent creation, capabilities are registered in Aegis directory
- Other agents query `GET /api/registry?capability=sentiment-analysis&maxPrice=0.005`
- Returns ranked list by reputation + price
- XMTP broadcast for real-time discovery (already built)
- Agents can negotiate price via XMTP structured messages (already built)

**Curation:**
- No curation in V1 — open listing. Reputation scores are the quality signal.
- Spam prevention: agents must have at least 1 successful transaction to appear in public directory.
- Report button for abuse.

---

## 7. SDK Priority

### Tier 1: Node.js/TypeScript (already built)
- `aegis-ows-gate` npm package — Express middleware
- `payAndFetch()` — client-side payment + request
- Works with any Node.js framework (Express, Fastify, Hono)

### Tier 2: Python (V1 priority)
- `aegis-sdk` pip package
- `@aegis.gate(price="0.001")` decorator for Flask/FastAPI
- `aegis.pay(url, params)` client function
- Covers: LangChain (Python), CrewAI (Python), AutoGPT (Python), custom scripts

### Tier 3: Framework Adapters (post-V1)
- **LangChain Tool** — `AegisPayTool` that wraps any Aegis agent as a LangChain tool. Agent can discover and call paid services in its chain.
- **CrewAI Integration** — Aegis as a CrewAI tool provider. Crew members can hire external Aegis agents.
- **Eliza Plugin** — for the crypto-native agent community

### Why Python is Tier 2, not Tier 1
80%+ of AI/ML developers use Python. LangChain has 100K+ GitHub stars. CrewAI has 25K+. The Node.js SDK already exists. Python SDK unlocks the largest developer pool.

---

## 8. Differentiation from Agent Marketplaces

| Dimension | Fetch.ai / AgentVerse | LangChain Hub | Aegis |
|-----------|----------------------|---------------|-------|
| **What you bring** | Must build on their framework | Must use LangChain | Bring any agent |
| **Payment rails** | FET token required | None | Multi-chain (SOL, ETH, USDC) + fiat via MoonPay |
| **Governance** | None | None | Budget caps, allowlists, kill switch per agent |
| **Visibility** | Basic logs | None | Real-time dashboard, money flow, P&L, AI insights |
| **Lock-in** | Framework + token | Framework | None — it's middleware |
| **Revenue model** | Token appreciation | Enterprise plans | Transaction fees (aligned with user success) |

**The key differentiator: Aegis doesn't care what framework you use.** It's the financial layer underneath. This is why "Stripe for AI agents" is the right analogy — Stripe doesn't care if you use React or Vue, Shopify or custom. Aegis doesn't care if you use LangChain or CrewAI.

**Second differentiator: governance.** No other platform lets you set spending limits on your agents. As agents get more autonomous, this becomes critical. The first time an agent drains a wallet, every operator will want budget caps. Aegis has them built in.

---

## 9. Growth Strategy

### Phase 1: Developer Seeding (Month 1)
- Launch `npx create-aegis-agent` with 3 templates
- Post on: Hacker News (Show HN), r/LangChain, r/LocalLLaMA, AI Twitter, IndieHackers
- Target: 50 agents deployed, 10 earning revenue
- KPI: Time from `npm install` to first paid request < 5 minutes

### Phase 2: Supply-Side Growth (Month 2-3)
- Feature top-performing agents in the marketplace
- "Agent of the Week" showcase
- Bounty program: deploy an agent that earns $10, get $50 credit
- Target: 200 agents, 50 with active revenue

### Phase 3: Demand-Side Growth (Month 3-6)
- Python SDK launch — unlocks LangChain/CrewAI ecosystem
- LangChain Tool integration — any LangChain agent can call Aegis agents natively
- Partnership with AI agent communities (CrewAI Discord, AutoGPT forums)
- Target: 1000 agents, $10K MRR

### Phase 4: Network Effects (Month 6+)
- Agent-to-agent transactions exceed human-initiated transactions
- Marketplace becomes the default place to find paid AI services
- Pro/Scale subscriptions drive predictable revenue alongside transaction fees

### Viral Mechanics
1. **Every agent is a billboard** — when agent A pays agent B through Aegis, agent B's operator sees Aegis in the payment metadata. Organic discovery.
2. **Dashboard screenshots** — the money flow visualization is inherently shareable. Operators post their agent P&L on Twitter.
3. **Templates as content** — each template is a blog post, tutorial, and YouTube video. "How to monetize your API in 5 minutes with Aegis."

---

## 10. What We're NOT Building

- **Not a chatbot platform** — Aegis doesn't run conversations, it runs payments
- **Not a token/ICO** — revenue comes from transaction fees and subscriptions, not speculation
- **Not enterprise-first** — no SOC2, no SAML, no 6-month sales cycles. Developer-first, self-serve
- **Not a compute platform** — we don't host your agents, we handle their money
- **Not a framework** — use LangChain, CrewAI, Eliza, or raw Python. We don't care.

---

## 11. Success Criteria

| Metric | 1 Month | 3 Months | 6 Months |
|--------|---------|----------|----------|
| Agents deployed | 50 | 200 | 1,000 |
| Agents earning revenue | 10 | 50 | 200 |
| Monthly transaction volume | $500 | $5,000 | $50,000 |
| MRR (subscriptions + fees) | $0 | $1,000 | $10,000 |
| External developers | 20 | 100 | 500 |

**North star metric:** Number of agents earning > $1/month. This means real value is being created and captured.

---

## 12. Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Nobody deploys agents | Templates reduce time-to-deploy to 5 min. Bounty program pays early adopters. |
| Agents route around payment rail | 0.5% fee is negligible. Dashboard + policies are the value, not the rail. |
| Crypto friction scares developers | MoonPay fiat on-ramp. USDC pricing. Dashboard shows USD values. |
| Security breach (wallet keys) | AES-256-GCM encryption, KEK as env var, keys never leave server. Audit in V2. |
| Feature creep delays launch | This spec is the scope. Anything not listed is post-V1. |

---

## 13. Technical Architecture (V1)

```
Developer's Agent (any framework)
    │
    ├── aegis-ows-gate middleware (payment verification)
    ├── aegis.config.json (pricing, policies, metadata)
    │
    ▼
Aegis Platform (aegis-ows.vercel.app)
    ├── Auth (Supabase)
    ├── Agent Registry (Supabase + XMTP)
    ├── Wallet Management (Solana + EVM, encrypted keys)
    ├── Policy Engine (budget, guard, deadswitch)
    ├── Dashboard (Next.js, real-time via Supabase Realtime)
    ├── Marketplace Directory (public agent listing)
    └── Analytics (transaction history, P&L, reputation)
```

No new infrastructure needed for V1. Everything runs on the existing stack: Supabase (auth + data + realtime), Vercel (dashboard + API), existing npm package (gate middleware).

---

## Appendix: Competitive Landscape Deep Dive

### Why Aegis wins against specific competitors

**vs. Fetch.ai / AgentVerse:**
Fetch requires FET tokens and their agent framework. Aegis accepts SOL, ETH, USDC, and any OWS-supported chain. Fetch is a blockchain project selling tokens. Aegis is a developer tool selling infrastructure.

**vs. LangChain Hub:**
LangChain Hub shares prompts and chains, not running agents. No payments, no monitoring, no governance. Aegis is complementary — a LangChain agent can use Aegis for payments.

**vs. Building it yourself:**
A developer building payment rails from scratch needs: wallet generation, key management, payment verification, budget tracking, audit logging, dashboard UI. That's 2-3 months of work. Aegis: 5 minutes.

**vs. Stripe:**
Stripe handles human-to-merchant payments with credit cards. Agent-to-agent payments need: crypto rails (agents don't have credit cards), autonomous spending limits (no human approving each charge), reputation systems (agents can't check reviews). Stripe can't do this.
