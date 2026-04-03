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
