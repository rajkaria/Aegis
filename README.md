# Aegis

**Policy, Commerce & Visibility for the Open Wallet Standard**

> OWS is the vault. Aegis is the shield.

Built for the [OWS Hackathon](https://hackathon.openwallet.sh/) — the first ecosystem extension for the Open Wallet Standard.

---

## What is Aegis?

OWS ships a powerful wallet primitive: signing, key management, and a policy hook. But it ships zero policy implementations, zero agent commerce tooling, and zero visibility into what agents are actually doing with your wallets. Aegis fills all three gaps.

**Policy Executables** — Three production-ready OWS policy executables (`aegis-budget`, `aegis-guard`, `aegis-approve`) that plug directly into OWS's policy engine to enforce spending limits, address allowlists, and human approval gates on every transaction.

**Commerce MCP Server** — Six MCP tools that give AI agents a complete commerce layer: pay with x402 or MPP, check remaining budget, discover services, register services, and generate spending reports — all enforced by the policy layer underneath.

**Sentinel Dashboard** — A Next.js real-time dashboard that renders live agent spending, policy enforcement history, pending approvals, and the service registry. Finally, visibility into what your agents are actually doing.

---

## Architecture

```
AI AGENTS (Claude Code, Cursor, Windsurf, any MCP client)
    |                              |
    | MCP Protocol                 | MCP Protocol
    v                              v
OWS Built-in MCP              AEGIS COMMERCE MCP
(wallet/sign ops)              (6 commerce tools)
    |                              |
    v                              v
              OWS CORE
    AEGIS POLICY EXECUTABLES
    (aegis-budget, aegis-guard, aegis-approve)
    Signing Enclave | Wallet Vault | API Keys
                    |
                    v
         AEGIS SENTINEL DASHBOARD
```

Every payment made through the Commerce MCP flows through OWS core, where the Aegis policy executables intercept and evaluate the transaction before it is signed. The Sentinel Dashboard reads the same state files in real time.

---

## Quick Start

```bash
git clone https://github.com/rajkaria/aegis
cd aegis && npm install
npm run build

# Initialize Aegis config (creates ~/.ows/aegis/ with defaults)
aegis init

# Register policies with OWS
aegis install

# Seed demo data
cd demo && npx tsx setup.ts

# Start the dashboard
cd ../dashboard && npm run dev
# Open http://localhost:3000
```

---

## Policy Executables

Aegis ships three OWS-compatible policy executables. Each binary reads a `PolicyContext` from stdin and writes a `PolicyResult` to stdout — the exact interface OWS expects.

### aegis-budget

Enforces spending limits per chain, token, and time period. Tracks cumulative spend in a local ledger and blocks transactions that would exceed the configured limit.

```json
// ~/.ows/aegis/budget.json
{
  "limits": [
    {
      "chainId": "eip155:1",
      "token": "ETH",
      "daily": "0.5",
      "weekly": "2.0",
      "monthly": "5.0"
    },
    {
      "chainId": "solana:mainnet",
      "token": "SOL",
      "daily": "10"
    }
  ]
}
```

### aegis-guard

Enforces an address allowlist or blocklist per chain. Supports wildcard chain prefixes (`solana:*` matches all Solana networks). Blocks any transaction targeting an address not on the allowlist, or any address explicitly on the blocklist.

```json
// ~/.ows/aegis/guard.json
{
  "mode": "allowlist",
  "addresses": {
    "eip155:1": [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    ],
    "solana:*": [
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    ]
  },
  "blockAddresses": []
}
```

### aegis-approve

A human-in-the-loop approval gate. Transactions above a configurable threshold are queued for human review; transactions above a hard ceiling are blocked outright. Approvals have a TTL and are resolved via the CLI or dashboard.

```json
// ~/.ows/aegis/approve.json
{
  "thresholds": {
    "auto_approve_below": "1",
    "require_approval_above": "1",
    "hard_block_above": "100"
  },
  "approval_ttl_minutes": 30
}
```

---

## Commerce MCP Server

The Aegis MCP server exposes six tools that give any MCP-compatible AI agent a complete agent commerce layer, enforced by the policy executables on every payment.

| Tool | Description |
|------|-------------|
| `aegis_pay_x402` | Pay for a resource protected by the [HTTP 402 / x402 protocol](https://x402.org). Handles the payment challenge/response handshake automatically. |
| `aegis_pay_mpp` | Pay using the Metered Payment Protocol (MPP). Supports session reuse to amortize session setup costs across multiple requests. |
| `aegis_check_budget` | Check remaining budget for a given chain and token against configured limits. |
| `aegis_discover_services` | Search the local service registry for MCP-payable services by name or tag. |
| `aegis_register_service` | Register a new payable service into the registry so other agents can discover it. |
| `aegis_spending_report` | Generate a spending report for a given period (daily, weekly, or monthly), broken down by chain and token. |

### Add to Claude Code or Cursor

```json
{
  "mcpServers": {
    "aegis": {
      "command": "aegis-mcp"
    }
  }
}
```

For Claude Code, add this to `~/.claude/settings.json` under `"mcpServers"`. For Cursor, add it to `.cursor/mcp.json` in your project.

---

## Sentinel Dashboard

The dashboard reads live data from `~/.ows/aegis/` with no database required. Start it with `npm run dev` from the `dashboard/` directory.

**Overview** — Real-time stat cards (today's spend, active agents, chains, blocked transactions), spending chart over the last 7 days, per-chain budget progress bars, and a live activity feed of recent policy decisions.

**Approvals** — Live list of pending approvals queued by `aegis-approve`. Each card shows the agent, chain, estimated value, token, and expiry time. Approve or reject directly from the browser — the policy picks up the decision immediately.

**Policies** — Configuration viewer for all three installed policies. Shows current config alongside recent allow/deny decisions from the policy log, per policy.

**Services** — Searchable table of all services registered in the Aegis service registry, showing endpoint, payment protocol, price, and tags.

---

## CLI

```bash
# Initialize config directory and defaults
aegis init

# Register policies with OWS
aegis install

# Show budget status (defaults to daily period)
aegis budget
aegis budget --chain eip155:1 --period weekly

# List pending approvals
aegis approve --list

# Approve or reject a specific transaction
aegis approve <id>
aegis approve <id> --reject

# Manage guard address lists
aegis guard --add 0xA0b8... --chain eip155:1
aegis guard --add 0xBad0... --block
aegis guard --remove 0xA0b8...

# Generate a spending report
aegis report --period monthly
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Policy Executables | TypeScript / Node.js, OWS policy interface |
| Commerce MCP | TypeScript + `@modelcontextprotocol/sdk` |
| Dashboard | Next.js 15 + Tailwind CSS + shadcn/ui + Recharts |
| CLI | Commander.js |
| Data | File-based JSON (`~/.ows/aegis/`) |
| OWS Integration | `@open-wallet-standard/core` |

---

## Project Structure

```
aegis/
├── packages/
│   ├── shared/          # Types, file I/O helpers, shared config readers
│   ├── policies/        # aegis-budget, aegis-guard, aegis-approve executables
│   ├── mcp-server/      # MCP server with 6 commerce tools
│   └── cli/             # aegis CLI (init, install, budget, guard, approve, report)
├── dashboard/           # Next.js Sentinel Dashboard
├── demo/                # Demo data seed scripts
└── turbo.json           # Turborepo monorepo config
```

All packages are TypeScript-first. Shared types (including `PolicyContext` and `PolicyResult` from the OWS spec) live in `packages/shared` and are imported by all other packages.

---

## Built For

**[OWS Hackathon](https://hackathon.openwallet.sh/)** — Build with the Open Wallet Standard.

Aegis is the first complete ecosystem extension for OWS: policies that enforce, tools that transact, and a dashboard that shows everything. Everything agents need to operate autonomously with real money — safely.

---

## License

MIT
