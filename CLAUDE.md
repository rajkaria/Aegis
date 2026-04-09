# Aegis — Project Rules

## Documentation Rule

When adding a new feature, component, API route, CLI command, or integration to Aegis:

1. Update `dashboard/src/app/(landing)/docs/page.tsx` with a new section documenting the feature
2. Add the section ID to the `TableOfContents` sections array in the same file
3. Include: what it does, how to use it (with code examples), configuration options, and any API details
4. Follow the existing pattern: `SectionAnchor` wrapper, `CodeBlock` for code, tables for options/routes

## Project Structure

- `packages/shared/` — Types, paths, ledger, earnings, config, policy-log, messages
- `packages/gate/` — Express x402 middleware + payAndFetch client + XMTP announce/discover
- `packages/policies/` — 3 OWS policy executables (budget, guard, deadswitch)
- `packages/cli/` — Commander.js CLI (init, budget, guard, status, install, report)
- `dashboard/` — Next.js 16 with route groups: (landing) for marketing + docs, (dashboard) for Nexus
- `demo/` — 3-agent economy (data-miner, analyst, research-buyer) + seed script

## Dashboard Architecture

- Landing page and docs use the `(landing)` route group (full-width, no sidebar)
- Dashboard pages use the `(dashboard)` route group (sidebar layout)
- Data reads go through `src/lib/data-provider.ts` which falls back to bundled seed data on Vercel
- Types are inlined in `src/lib/types.ts` (no @aegis-ows/shared dependency for standalone Vercel deploy)
- API routes stay at `/api/*` shared by both route groups

## Data Storage

All data in `~/.ows/aegis/*.json`. On Vercel, bundled seed data from `dashboard/src/data/` is used.

## Session Context (Last updated: 2026-04-09)

### Current State
- **9 dedicated partner docs pages** — Every partner now has its own docs page under `/docs/[partner]`
- **MoonPay deep integration** — Full fiat bridge: on-ramp (embedded widget), off-ramp (cash out), swaps, transaction tracking, webhooks, currencies API, geo availability
- **Docs hub revamped** — Main `/docs` integrations section has categorized card grid (Payments & Signing, Data & Analytics, Infrastructure) linking to each partner page
- **Dashboard agent page updated** — Static MoonPay card replaced with interactive `MoonPayFundWidget` + `MoonPaySellWidget` components
- **Zero TS errors, zero console errors** — All pages render correctly on dev server
- **Vercel deployed** — Dashboard auto-deploys from `main` branch
- **npm published** — `aegis-ows-gate@0.3.0` and `aegis-ows-shared@0.2.0` on npm

### Recent Changes (this session)

**Partner docs pages created (8 new + 1 existing XMTP):**
- `dashboard/src/app/(landing)/docs/solana/page.tsx` — Payments, receipt anchoring, balance queries
- `dashboard/src/app/(landing)/docs/stellar/page.tsx` — Horizon API, XLM payments, testnet funding
- `dashboard/src/app/(landing)/docs/ripple/page.tsx` — XRPL, XRP balances, trust lines
- `dashboard/src/app/(landing)/docs/zerion/page.tsx` — Multi-chain portfolio tracking
- `dashboard/src/app/(landing)/docs/uniblock/page.tsx` — EVM token balance aggregation
- `dashboard/src/app/(landing)/docs/allium/page.tsx` — On-chain tx verification, analytics
- `dashboard/src/app/(landing)/docs/moonpay/page.tsx` — Updated with deep integration docs
- `dashboard/src/app/(landing)/docs/ows/page.tsx` — Wallet signing, key management

**MoonPay deep integration:**
- `packages/integrations/src/moonpay.ts` — Full rewrite: buy/sell/swap URLs, tx status, currencies API, geo check, webhook validation, URL signing, config discovery
- `dashboard/src/lib/integrations/moonpay.ts` — Dashboard mirror of above
- `packages/integrations/src/types.ts` + `dashboard/src/lib/integrations/types.ts` — Added MoonPayTransaction, MoonPayCurrency, MoonPayAvailability types
- 8 API routes: `/api/moonpay/{sign,sell-url,swap-url,transactions,webhook,currencies,availability,config}`
- 4 components: `moonpay-fund-widget.tsx`, `moonpay-sell-widget.tsx`, `moonpay-swap-button.tsx`, `moonpay-transaction-status.tsx`
- `dashboard/src/app/(dashboard)/dashboard/agents/[id]/page.tsx` — Replaced static MoonPay card with interactive widgets

**Main docs page updated:**
- `dashboard/src/app/(landing)/docs/page.tsx` — Integrations section revamped with partner card grid + links to dedicated pages

### Key Decisions
- **MoonPay graceful degradation** — Everything works without API keys (external URLs). `MOONPAY_API_KEY` unlocks currencies+geo, `MOONPAY_SECRET_KEY` unlocks embedded widget+tx tracking, `MOONPAY_WEBHOOK_KEY` unlocks real-time notifications. Same pattern as Zerion/Allium.
- **Stellar recommended as next deep integration** — Makes Aegis truly multi-chain for payments (not just Solana). Cross-border use case, near-zero fees, no API keys needed.
- **Docs per partner, not monolithic** — Each partner has its own `/docs/[partner]` page following the XMTP template (use cases, architecture, implementation guide, setup, hackathon ideas, API reference)
- **MoonPay off-ramp conditional** — `MoonPaySellWidget` only renders when agent has positive P&L (profitLoss > 0)

### Next Steps
- **Stellar deep integration** — Add `sendStellarPayment()`, receipt anchoring via Memo program, Gate middleware support for `chain: "stellar"`, cross-chain demo
- **Deploy + commit** — Git commit all changes from this session, push to main, verify Vercel deploy
- **Republish to npm** — `aegis-ows-gate` with MoonPay deep integration functions
- **Tweet announcement** — Tag @moonpay, showcase dashboard screenshot with Fund/Withdraw widgets
- **Test MoonPay with real API keys** — Get MoonPay publishable + secret keys, test embedded widget mode
- Deploy agents on cloud with real mainnet wallet and $50 budget for live demo

### Partner Integrations (9 total)
Solana, Stellar, Ripple XRPL, Zerion, Uniblock, Allium, MoonPay (DEEP), XMTP (DEEP), OWS

### Previous Session Notes (2026-04-08)
- Mainnet-ready Solana payments via `SOLANA_RPC_URL` env var
- XMTP standalone subpath export `aegis-ows-gate/xmtp-messaging`
- Dedicated XMTP docs page with Agent Workflow Stack
- Landing page improvements (counters, ticker, nav cleanup)
- Key: `SOLANA_RPC_URL` has no default (forces explicit network choice)
- Key: agent-identity decoupled, xmtp-directory uses dynamic require

### Previous Session Notes (2026-04-07)
- Hackathon submission completed
- npm published without `@aegis-ows/` scope — used `aegis-ows-gate` and `aegis-ows-shared`
- Dashboard types inlined in `src/lib/types.ts` for standalone Vercel deploy
- XMTP transport auto-selects: LiveXMTPTransport when env vars set, FileTransport otherwise
- Solana payments use OWS SDK `signTransaction` in-process (avoids blockhash race)
- 50/50 dashboard tests, 10/10 XMTP tests passing, 0 TS errors
