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

## Session Context (Last updated: 2026-04-07)

### Current State
- **Hackathon submission complete** — Aegis is fully built and submitted for the OWS Hackathon
- **Vercel deployed** — Dashboard auto-deploys from `main` branch (root dir set to `dashboard`)
- **npm published** — `aegis-ows-gate@0.3.0` and `aegis-ows-shared@0.2.0` on npm (no scope prefix)
- **On-chain** — 7 verified Solana devnet transactions, receipt anchoring via Memo program
- **XMTP protocol** — 15 message types, 12 fully tested; file-based + live transport (auto-select)
- **All tests passing** — 50/50 dashboard unit tests, 10/10 XMTP integration tests, 0 TS errors across shared/gate/mcp-server

### Key Packages
- `packages/shared/src/messages.ts` — 15 XMTP message type interfaces + file transport + query helpers
- `packages/gate/src/xmtp-transport.ts` — FileTransport (default) + LiveXMTPTransport (real XMTP via @xmtp/agent-sdk)
- `packages/gate/src/` — agent-identity, xmtp-directory, xmtp-disputes, xmtp-webhooks, xmtp-protocol
- `packages/integrations/src/stellar.ts` — Stellar Horizon API integration
- `packages/mcp-server/src/index.ts` — 10+ MCP tools for agent economy
- `dashboard/` — 22 components, 9 pages, 17 API routes

### Recent Changes (latest commits)
- `f4c73fe` — Real XMTP transport, agent identity, business cards, disputes, directory, notifications (12 message types)
- `87e9d3a` — Full XMTP agent protocol (8 message types for negotiation, health, receipts, reputation, SLAs, supply chains)
- `0dab2ba` — Stellar blockchain support (Horizon balance queries, tx verification, multi-chain display)

### Key Decisions
- Published npm without `@aegis-ows/` scope (scope didn't exist on npm) — used `aegis-ows-gate` and `aegis-ows-shared`
- Dashboard types inlined in `src/lib/types.ts` for standalone Vercel deploy (no monorepo dependency)
- XMTP transport auto-selects: LiveXMTPTransport when `XMTP_ENV` + `XMTP_WALLET_KEY` env vars set, FileTransport otherwise
- Solana payments use OWS SDK `signTransaction` in-process (avoids blockhash race from CLI shell-out)
- Input validation runs on raw input BEFORE sanitization (prevents bypass like `test;rm -rf /` → `testrm-rf`)
- SLAAgreement TypeScript cast uses double-cast `(m as unknown as Record<string, unknown>)` due to nested `terms` object

### Next Steps
- Test real XMTP transport by setting `XMTP_WALLET_KEY` env var
- Record updated demo video showing 12 message types
- Update hackathon submission with latest XMTP protocol details
- Consider adding more partner integrations or polishing existing ones

### Partner Integrations (9 total)
Solana, Stellar, Ripple XRPL, Zerion, Uniblock, Allium, MoonPay, XMTP, OWS
