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

## Session Context (Last updated: 2026-04-08)

### Current State
- **Mainnet-ready** — Solana payments now use `SOLANA_RPC_URL` env var (no hardcoded devnet)
- **XMTP standalone** — `aegis-ows-gate/xmtp-messaging` subpath export for messaging-only usage (no Express/Solana/ethers deps)
- **Dedicated XMTP docs page** at `/docs/xmtp` with use cases, architecture, implementation guide, standalone section, and Agent Workflow Stack
- **Landing page improved** — animated stat counters, no bullet points on feature cards, XMTP message ticker scrolls horizontally, XMTP/Roadmap moved from nav to docs
- **Vercel deployed** — Dashboard auto-deploys from `main` branch
- **npm published** — `aegis-ows-gate@0.3.0` and `aegis-ows-shared@0.2.0` on npm

### Key Packages
- `packages/gate/src/xmtp-messaging.ts` — NEW standalone entry point for messaging-only import
- `packages/gate/src/agent-identity.ts` — Decoupled from ledger; `buildAgentIdentity()` accepts optional `ledgerData`
- `packages/gate/src/xmtp-directory.ts` — Decoupled from `@aegis-ows/shared` hard imports; uses dynamic require with fallback
- `packages/gate/src/solana-pay.ts` — Uses `getSolanaRpcUrl()` reading `SOLANA_RPC_URL` env var
- `packages/gate/src/receipt-anchor.ts` — Same env var pattern
- `packages/gate/package.json` — Added `exports` field with `./xmtp-messaging` subpath
- `dashboard/src/app/(landing)/docs/xmtp/page.tsx` — Full XMTP docs page (use cases, architecture, standalone, Agent Workflow Stack)

### Recent Changes (latest commits)
- `e9370a1` — Agent Workflow Stack section in XMTP docs (composable agent economy vision)
- `4612342` — Mainnet-ready Solana payments + Production Deployment docs section
- `7ec8ed9` — Standalone XMTP messaging export + landing page improvements (counters, ticker, nav cleanup)
- `f93ba88` — Dedicated XMTP docs page + agent messaging section on landing page

### Key Decisions
- **SOLANA_RPC_URL has no default** — forces explicit network choice for safety (user chose env-var driven over mainnet default)
- **XMTP standalone via subpath export** — `aegis-ows-gate/xmtp-messaging` instead of separate npm package (simpler, one install)
- **agent-identity decoupled** — `buildAgentIdentity()` works with zero payment data; optional `ledgerData` param enriches it; `buildAgentIdentityFromLedger()` for backwards compat
- **xmtp-directory uses dynamic require** — `require("@aegis-ows/shared")` in try/catch so it works without shared package
- **Nav simplified** — Removed XMTP and Roadmap links from top nav; both accessible from docs page instead
- XMTP founder (Shane Mac) tweeted about needing "WhatsApp for agents on XMTP" — Aegis XMTP build was inspired by this

### Next Steps
- Deploy agents on cloud (Vercel/Railway) with real mainnet wallet and $50 budget for live demo
- Republish `aegis-ows-gate` to npm with the new `exports` field and standalone entry point
- Test real XMTP transport with `XMTP_WALLET_KEY` on production network
- Record demo video showing the Agent Workflow Stack in action
- Tweet the Agent Workflow Stack docs link as a quote tweet to Shane Mac

### Partner Integrations (9 total)
Solana, Stellar, Ripple XRPL, Zerion, Uniblock, Allium, MoonPay, XMTP, OWS

### Previous Session Notes (2026-04-07)
- Hackathon submission completed
- npm published without `@aegis-ows/` scope — used `aegis-ows-gate` and `aegis-ows-shared`
- Dashboard types inlined in `src/lib/types.ts` for standalone Vercel deploy
- XMTP transport auto-selects: LiveXMTPTransport when env vars set, FileTransport otherwise
- Solana payments use OWS SDK `signTransaction` in-process (avoids blockhash race)
- 50/50 dashboard tests, 10/10 XMTP tests passing, 0 TS errors
