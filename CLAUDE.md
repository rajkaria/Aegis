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

## Session Context (Last updated: 2026-04-10)

### Current State
- **Multi-tenant platform ALL PHASES COMPLETE** — Auth + Data Layer + Wallet Gen + Realtime
- **Live Railway agents still running** — Data-miner + Analyst on Railway, live metrics wired into dashboard
- **Dashboard live metrics FIXED** — `readAllLiveMetrics()` fetches from ANALYST_URL/METRICS_URL + DATA_MINER_URL, shows "Live Railway Agents" card on dashboard
- **Auth flow working** — `/login` (email + Google + GitHub OAuth), `/signup`, `/auth/callback`, middleware protects `/dashboard`
- **Demo mode preserved** — `/dashboard?demo=true` bypasses auth, shows seed data
- **Vercel deployed** — Auto-deploys from main, Supabase env vars configured
- **Zero TS errors** — Build passes clean

### Supabase Project
- **Project ID:** `jmtzwjfzxjcxlgtdoumi`
- **URL:** `https://jmtzwjfzxjcxlgtdoumi.supabase.co`
- **Tables created:** profiles, agents, wallets, ledger_entries, earnings_entries, policy_log, budget_configs
- **All tables have RLS** with `auth.uid() = user_id` policies
- **Realtime enabled** on agents, ledger_entries, earnings_entries, policy_log
- **Trigger:** `on_auth_user_created` → auto-creates `profiles` row
- **Env vars on Vercel:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (configured)

### Recent Changes (this session — Phases 2-4 implementation)

**Phase 2: Data Layer:**
- `dashboard/src/lib/supabase-data-provider.ts` — NEW: async Supabase queries for ledger, earnings, policy log, budget config, agents, wallets — all scoped by user_id via RLS
- `dashboard/src/lib/data-provider.ts` — MODIFIED: added async facade functions (readLedgerAsync, readEarningsLedgerAsync, etc.) — userId → Supabase, no userId → seed data
- `dashboard/src/lib/aegis-data.ts` — MODIFIED: getEconomyOverview, getAgentDetail, getPolicyData all async with optional userId. Added data-driven compute helpers (computeAgentProfileFromData, computeSankeyFromData, computeReputationsFromData)
- `dashboard/src/lib/auth-helpers.ts` — NEW: getUserId() server-side helper
- All dashboard pages + API routes updated to pass userId from session

**Phase 3: Wallet Generation:**
- `dashboard/src/lib/encryption.ts` — NEW: AES-256-GCM encrypt/decrypt with WALLET_KEK env var
- `dashboard/src/app/api/agents/route.ts` — MODIFIED: added POST handler — creates agent, generates Solana + EVM keypairs, encrypts private keys, stores in Supabase
- `dashboard/src/app/(dashboard)/dashboard/wallets/page.tsx` — REWRITTEN: shows real wallets grouped by agent, explorer links
- `dashboard/src/components/create-agent-form.tsx` — NEW: client-side form for agent creation with instant wallet feedback

**Phase 4: Real-Time:**
- `dashboard/src/hooks/use-realtime-dashboard.ts` — NEW: subscribes to Supabase Realtime on ledger_entries, earnings_entries, policy_log, agents tables. Auto-refreshes page on changes
- `dashboard/src/components/realtime-indicator.tsx` — NEW: green "Realtime" badge when connected
- Dashboard page updated with RealtimeIndicator component

### Implementation Plan
All phases complete:
- **Phase 1: Auth Shell** — COMPLETE (previous session)
- **Phase 2: Data Layer** — COMPLETE
- **Phase 3: Wallet Generation** — COMPLETE
- **Phase 4: Real-Time** — COMPLETE

### Next Steps
- Set `WALLET_KEK` env var on Vercel (64-char hex string, `openssl rand -hex 32`)
- Test agent creation flow end-to-end with a real user
- Add wallet balance fetching (Solana RPC + Zerion for EVM) on wallets page
- Add MoonPay funding integration on wallets page

### Key Decisions
- **Supabase over custom auth** — Auth + Postgres + RLS + Realtime in one service, already had project
- **Facade pattern for data provider** — backward-compatible: userId → Supabase, no userId → seed data (demo mode)
- **Server-side key encryption (AES-256-GCM)** — KEK as env var, pragmatic for MVP vs user-managed passphrase
- **Middleware graceful fallback** — when Supabase env vars missing, everything passes through (local dev)
- **Lazy Supabase client creation** — createClient() called inside event handlers, not at module level, to avoid SSR prerender failures
- **Demo mode via ?demo=true** — preserves unauthenticated preview with seed data

### Partner Integrations (10 total)
Solana (DEEP), Stellar (DEEP), EVM Chains (DEEP), Ripple XRPL, Zerion, Uniblock, Allium, MoonPay (DEEP), XMTP (DEEP), OWS

### Previous Session Notes (2026-04-09 late)
- Mainnet live run complete, 3 agents on Railway, 17 real transactions
- Live metrics wired into dashboard via readAllLiveMetrics()
- Docs: /docs/live-run article, /docs/interop guide

### Previous Session Notes (2026-04-09 early)
- Multi-chain Payment Gateway, EVM deep integration, MoonPay deep integration, 9 partner docs pages

### Previous Session Notes (2026-04-08)
- Mainnet-ready Solana payments, XMTP standalone subpath export

### Previous Session Notes (2026-04-07)
- Hackathon submission completed, npm published, dashboard types inlined
