"use client";

import Link from "next/link";

function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      {children}
    </div>
  );
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-white/[0.06] text-xs font-mono text-muted-foreground">
          {title}
        </div>
      )}
      <pre className="p-4 text-sm font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function TableOfContents() {
  const sections = [
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    { id: "gate", label: "Aegis Gate" },
    { id: "gate-middleware", label: "  Gate Middleware" },
    { id: "gate-config", label: "  Config File" },
    { id: "gate-pay-and-fetch", label: "  payAndFetch Client" },
    { id: "gate-x402", label: "  x402 Protocol Flow" },
    { id: "policies", label: "Aegis Policies" },
    { id: "policy-budget", label: "  aegis-budget" },
    { id: "policy-guard", label: "  aegis-guard" },
    { id: "policy-deadswitch", label: "  aegis-deadswitch" },
    { id: "policy-engine", label: "  OWS Policy Engine" },
    { id: "nexus", label: "Aegis Nexus Dashboard" },
    { id: "nexus-economy", label: "  Economy Overview" },
    { id: "nexus-agents", label: "  Agent Detail" },
    { id: "nexus-policy-editor", label: "  Policy Editor" },
    { id: "nexus-api", label: "  API Routes" },
    { id: "xmtp", label: "XMTP Discovery" },
    { id: "xmtp-announce", label: "  Service Announcements" },
    { id: "xmtp-discover", label: "  Service Discovery" },
    { id: "cli", label: "CLI Reference" },
    { id: "cli-init", label: "  aegis init" },
    { id: "cli-budget", label: "  aegis budget" },
    { id: "cli-guard", label: "  aegis guard" },
    { id: "cli-status", label: "  aegis status" },
    { id: "cli-install", label: "  aegis install" },
    { id: "cli-report", label: "  aegis report" },
    { id: "data", label: "Data Storage" },
    { id: "demo", label: "Demo Economy" },
    { id: "partners", label: "Partner Integrations" },
    { id: "tech-stack", label: "Tech Stack" },
  ];

  return (
    <nav className="hidden xl:block fixed left-[max(0px,calc(50%-42rem))] top-24 w-56 max-h-[calc(100vh-8rem)] overflow-y-auto text-xs space-y-0.5 pr-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`block py-1 text-muted-foreground hover:text-foreground transition-colors ${s.label.startsWith("  ") ? "pl-3 text-[11px]" : "font-medium"}`}
        >
          {s.label.trim()}
        </a>
      ))}
    </nav>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />

      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Documentation</p>
          <h1 className="text-4xl font-bold tracking-tight">Aegis Protocol</h1>
          <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
            Complete reference for the Agent Commerce Protocol — Gate middleware, policy executables, Nexus dashboard, XMTP discovery, and CLI.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/dashboard" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View Dashboard &rarr;
            </Link>
            <a href="https://github.com/rajkaria/aegis" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              GitHub &rarr;
            </a>
          </div>
        </div>

        {/* Overview */}
        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Overview</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis is a commerce protocol for AI agent economies, built on the Open Wallet Standard (OWS). It turns AI agents into economic actors that earn, spend safely, and operate transparently.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The protocol has three layers that work together:
          </p>
          <div className="grid gap-3 mb-8">
            <FeatureCard
              title="Aegis Gate"
              description="Express middleware that wraps any API behind x402 micropayments. One line of code turns an endpoint into a paid service."
            />
            <FeatureCard
              title="Aegis Policies"
              description="Three OWS-native policy executables (budget, guard, deadswitch) that govern every agent transaction before signing."
            />
            <FeatureCard
              title="Aegis Nexus"
              description="Real-time economy dashboard showing money flow between agents, per-agent P&L, policy enforcement, and budget consumption."
            />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The key insight: agents are simultaneously <strong className="text-foreground">buyers and sellers</strong>. An analyst agent pays a data-miner for scraped data, then sells its analysis to a research-buyer. Aegis makes this supply chain visible, safe, and auditable.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Architecture */}
        <SectionAnchor id="architecture">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Architecture</h2>
          <CodeBlock title="System Architecture">{`AGENT CLIENTS (Claude Code, Cursor, any x402 client)
    |                              |
    v                              v
DATA MINER (Aegis Gate)      ANALYST (Aegis Gate)
  /scrape  $0.01               /analyze  $0.05
    ^                              |
    |__ x402 payment _____________|
    |
    v
             OWS CORE
  AEGIS POLICIES (budget, guard, deadswitch)
  Wallet Vault | API Keys | Signing Enclave
             |
             v
      AEGIS NEXUS DASHBOARD
  Money Flow | P&L | Policy Log | Budget`}</CodeBlock>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Every payment flows through OWS core, where Aegis policy executables intercept and evaluate the transaction before it is signed. The Nexus dashboard reads the same state files in real-time. XMTP messaging enables agents to discover each other before transacting.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Aegis Gate */}
        <SectionAnchor id="gate">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Aegis Gate</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis Gate is an Express middleware that wraps any API endpoint behind x402 micropayments. It handles the full HTTP 402 payment challenge-response handshake automatically.
          </p>

          <SectionAnchor id="gate-middleware">
            <h3 className="text-lg font-semibold mb-3">Gate Middleware</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">aegisGate()</code> function returns Express middleware that gates an endpoint behind payment.
            </p>
            <CodeBlock title="Server — Protect an endpoint">{`import express from "express";
import { aegisGate } from "@aegis-ows/gate";

const app = express();

app.get("/api/scrape",
  aegisGate({
    price: "0.01",        // Cost per call in USDC
    token: "USDC",        // Payment token (default: USDC)
    agentId: "data-miner", // This agent's identity
    network: "eip155:8453", // Chain (default: eip155:1)
    description: "Web scraping service",
  }),
  (req, res) => {
    res.json({ data: "scraped content" });
  }
);`}</CodeBlock>

            <h4 className="text-sm font-semibold mt-6 mb-2">Options</h4>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Option</th>
                    <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Default</th>
                    <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">price</td><td className="px-4 py-2">string</td><td className="px-4 py-2">required</td><td className="px-4 py-2">Cost per call (e.g. &quot;0.01&quot;)</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">agentId</td><td className="px-4 py-2">string</td><td className="px-4 py-2">required</td><td className="px-4 py-2">Agent identity for earnings tracking</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">token</td><td className="px-4 py-2">string</td><td className="px-4 py-2">&quot;USDC&quot;</td><td className="px-4 py-2">Payment token</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">network</td><td className="px-4 py-2">string</td><td className="px-4 py-2">&quot;eip155:1&quot;</td><td className="px-4 py-2">Chain ID (CAIP-2)</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">walletAddress</td><td className="px-4 py-2">string</td><td className="px-4 py-2">auto</td><td className="px-4 py-2">OWS wallet address for payTo field</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs text-foreground">description</td><td className="px-4 py-2">string</td><td className="px-4 py-2">-</td><td className="px-4 py-2">Human-readable service description</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-4">
              When a request arrives without payment, Gate returns HTTP 402 with payment details. When payment is provided via the <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">X-PAYMENT</code> header, Gate verifies it, logs the earning to the ledger, and forwards to your handler.
            </p>
          </SectionAnchor>

          <SectionAnchor id="gate-config">
            <h3 className="text-lg font-semibold mt-8 mb-3">Config File</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Instead of configuring each route individually, you can define all endpoints in an <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">aegis.config.json</code> file and load them with <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">aegisGateFromConfig()</code>.
            </p>
            <CodeBlock title="aegis.config.json">{`{
  "walletName": "data-miner",
  "network": "eip155:8453",
  "endpoints": {
    "/scrape": {
      "price": "0.01",
      "token": "USDC",
      "description": "Web scraping service"
    },
    "/health": {
      "price": "0",
      "description": "Free health check"
    }
  }
}`}</CodeBlock>
            <CodeBlock title="Usage">{`import { aegisGateFromConfig } from "@aegis-ows/gate";

// Load config and create router with all endpoints gated
app.use(aegisGateFromConfig("./aegis.config.json"));`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Endpoints with <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">price: &quot;0&quot;</code> are skipped (free endpoints).
            </p>
          </SectionAnchor>

          <SectionAnchor id="gate-pay-and-fetch">
            <h3 className="text-lg font-semibold mt-8 mb-3">payAndFetch Client</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">payAndFetch()</code> function is the client-side counterpart. It handles the full x402 flow automatically: probe the endpoint, receive 402, log the payment, retry with credentials.
            </p>
            <CodeBlock title="Client — Pay for a service">{`import { payAndFetch } from "@aegis-ows/gate";

const result = await payAndFetch(
  "http://localhost:4001/scrape",
  "research-buyer"  // caller's agent ID
);
// result contains the paid content`}</CodeBlock>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Internally, <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">payAndFetch</code> probes the URL, reads the 402 response to get price/token/network, logs the spending to the budget ledger, then retries with an <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">X-PAYMENT</code> header containing the signed payment proof.
            </p>
          </SectionAnchor>

          <SectionAnchor id="gate-x402">
            <h3 className="text-lg font-semibold mt-8 mb-3">x402 Protocol Flow</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The x402 payment protocol uses HTTP status 402 (Payment Required) for machine-native micropayments.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold">1</span>
                <span>Client sends a normal HTTP request to a Gate-protected endpoint.</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold">2</span>
                <span>Gate returns <code className="bg-white/[0.06] px-1 py-0.5 rounded">402</code> with JSON body: <code className="bg-white/[0.06] px-1 py-0.5 rounded">{`{ x402Version, payTo, price, token, network }`}</code></span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold">3</span>
                <span>Client signs payment via OWS wallet (keys never leave the signing enclave).</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold">4</span>
                <span>Client retries with <code className="bg-white/[0.06] px-1 py-0.5 rounded">X-PAYMENT</code> header containing the signed proof.</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold">5</span>
                <span>Gate verifies payment, logs the earning, and forwards to the handler. Content is returned.</span>
              </div>
            </div>
          </SectionAnchor>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Policies */}
        <SectionAnchor id="policies">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Aegis Policies</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Three OWS-compatible policy executables. Each reads <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyContext</code> from stdin and writes <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyResult</code> to stdout — the exact interface OWS defines for its policy engine extension point.
          </p>

          <SectionAnchor id="policy-budget">
            <h3 className="text-lg font-semibold mb-3">aegis-budget &mdash; Spending Caps</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Enforces per-chain, per-token spending limits with daily, weekly, and monthly caps. Tracks cumulative spend in a local ledger at <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">~/.ows/aegis/budget-ledger.json</code>.
            </p>
            <CodeBlock title="~/.ows/aegis/budget-config.json">{`{
  "limits": [
    {
      "chainId": "eip155:8453",
      "token": "USDC",
      "daily": "0.50",
      "monthly": "10.00"
    },
    {
      "chainId": "*",
      "token": "*",
      "daily": "1.00"
    }
  ]
}`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Wildcard <code className="bg-white/[0.06] px-1 py-0.5 rounded">&quot;*&quot;</code> matches any chain or token. The policy evaluates all matching limits and blocks if any would be exceeded.
            </p>
          </SectionAnchor>

          <SectionAnchor id="policy-guard">
            <h3 className="text-lg font-semibold mt-8 mb-3">aegis-guard &mdash; Address Allowlist/Blocklist</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Controls which contract and wallet addresses agents can transact with. Supports allowlist mode (only permitted addresses) and a global blocklist that is always enforced.
            </p>
            <CodeBlock title="~/.ows/aegis/guard-config.json">{`{
  "mode": "allowlist",
  "addresses": {
    "eip155:8453": [
      "0xUSDC_BASE_CONTRACT",
      "0xUNISWAP_BASE_ROUTER"
    ],
    "solana:*": [
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    ]
  },
  "blockAddresses": [
    "0xKNOWN_SCAM_ADDRESS"
  ]
}`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Wildcard chain prefixes like <code className="bg-white/[0.06] px-1 py-0.5 rounded">&quot;solana:*&quot;</code> match all Solana networks. The blocklist is checked before the allowlist — blocked addresses are always rejected.
            </p>
          </SectionAnchor>

          <SectionAnchor id="policy-deadswitch">
            <h3 className="text-lg font-semibold mt-8 mb-3">aegis-deadswitch &mdash; Dead Man&apos;s Switch</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If an agent hasn&apos;t signed a transaction within a configurable inactivity window, the policy denies all further transactions. Prevents runaway agents from sitting on funds.
            </p>
            <CodeBlock title="~/.ows/aegis/deadswitch-config.json">{`{
  "maxInactiveMinutes": 30,
  "onTrigger": "revoke_key",
  "recoveryWallet": "0xHUMAN_WALLET",
  "sweepFunds": false,
  "enabled": true
}`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Each time a transaction is allowed, the heartbeat timestamp is updated. If the elapsed time since the last heartbeat exceeds <code className="bg-white/[0.06] px-1 py-0.5 rounded">maxInactiveMinutes</code>, the policy blocks the transaction.
            </p>
          </SectionAnchor>

          <SectionAnchor id="policy-engine">
            <h3 className="text-lg font-semibold mt-8 mb-3">OWS Policy Engine Integration</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All three policies use OWS&apos;s native policy engine interface. Before any signing operation, OWS spawns the executable with <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyContext</code> on stdin and reads <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyResult</code> from stdout.
            </p>
            <CodeBlock title="PolicyContext (stdin)">{`{
  "transaction": { "to": "0x...", "value": "0.05", "data": "0x..." },
  "chainId": "eip155:8453",
  "wallet": { "id": "w1", "name": "analyst", "addresses": {} },
  "simulation": { "success": true, "value": "0.05" },
  "timestamp": "2026-04-03T12:00:00Z",
  "apiKeyId": "analyst-key"
}`}</CodeBlock>
            <CodeBlock title="PolicyResult (stdout)">{`{ "allow": true }
// or
{ "allow": false, "reason": "Daily USDC limit exceeded: $0.52/$0.50" }`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Every decision (allow or deny) is logged to <code className="bg-white/[0.06] px-1 py-0.5 rounded">~/.ows/aegis/policy-log.json</code> and appears in the Nexus dashboard activity feed.
            </p>
          </SectionAnchor>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Nexus Dashboard */}
        <SectionAnchor id="nexus">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Aegis Nexus Dashboard</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            A real-time economy visualizer built with Next.js 16, shadcn/ui, and Recharts. Reads data from <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">~/.ows/aegis/</code> JSON files. Deployed standalone on Vercel with bundled seed data fallback.
          </p>

          <SectionAnchor id="nexus-economy">
            <h3 className="text-lg font-semibold mb-3">Economy Overview</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">The main dashboard page at <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">/dashboard</code> shows:</p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc">
              <li><strong className="text-foreground">Stat cards</strong> &mdash; Economy flow (total volume), active agents, net profit, transactions blocked</li>
              <li><strong className="text-foreground">Money Flow visualization</strong> &mdash; Animated diagram showing payment flows between agents with P&L indicators on each node</li>
              <li><strong className="text-foreground">Budget consumption bars</strong> &mdash; Animated progress bars per chain/token/period with color-coded thresholds (green &lt;70%, yellow 70-90%, red &gt;90%)</li>
              <li><strong className="text-foreground">XMTP Discovery feed</strong> &mdash; Service announcements, queries, and responses from the message bus</li>
              <li><strong className="text-foreground">Agent P&amp;L table</strong> &mdash; Revenue, spending, and profit/loss per agent with links to detail pages</li>
              <li><strong className="text-foreground">Live activity feed</strong> &mdash; Merged stream of earnings, spending, policy decisions, and discovery events with relative timestamps</li>
            </ul>
          </SectionAnchor>

          <SectionAnchor id="nexus-agents">
            <h3 className="text-lg font-semibold mt-8 mb-3">Agent Detail</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">Each agent has a detail page at <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">/dashboard/agents/[id]</code> showing:</p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc">
              <li><strong className="text-foreground">P&amp;L summary</strong> &mdash; Revenue, spending, and net profit/loss</li>
              <li><strong className="text-foreground">Wallet balance</strong> &mdash; Multi-chain balances (via Zerion API integration)</li>
              <li><strong className="text-foreground">Fund via MoonPay</strong> &mdash; On-ramp integration for topping up agent wallets</li>
              <li><strong className="text-foreground">Revenue by endpoint</strong> &mdash; Which services this agent sells and how much each earns</li>
              <li><strong className="text-foreground">Spending by vendor</strong> &mdash; Which services this agent buys and how much each costs</li>
              <li><strong className="text-foreground">Budget consumption</strong> &mdash; Per-chain/token budget bars for this agent</li>
              <li><strong className="text-foreground">Policy enforcement history</strong> &mdash; Filtered log of PASS/BLOCK decisions for this agent</li>
            </ul>
          </SectionAnchor>

          <SectionAnchor id="nexus-policy-editor">
            <h3 className="text-lg font-semibold mt-8 mb-3">Interactive Policy Editor</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The policies page at <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">/dashboard/policies</code> provides a visual form editor for each policy:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc">
              <li><strong className="text-foreground">Budget editor</strong> &mdash; Add/remove spending limits with chain, token, and daily/weekly/monthly caps</li>
              <li><strong className="text-foreground">Guard editor</strong> &mdash; Toggle allowlist/blocklist mode, add/remove addresses per chain, manage global blocklist</li>
              <li><strong className="text-foreground">Deadswitch editor</strong> &mdash; Configure inactivity timeout, enable/disable, set sweep funds and recovery wallet</li>
              <li><strong className="text-foreground">JSON preview</strong> &mdash; Each editor shows a collapsible raw JSON preview of the generated config</li>
              <li><strong className="text-foreground">Save to disk</strong> &mdash; Changes write directly to <code className="bg-white/[0.06] px-1 py-0.5 rounded">~/.ows/aegis/</code> config files via the API</li>
            </ul>
          </SectionAnchor>

          <SectionAnchor id="nexus-api">
            <h3 className="text-lg font-semibold mt-8 mb-3">API Routes</h3>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Route</th>
                    <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Method</th>
                    <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">/api/economy</td><td className="px-4 py-2">GET</td><td className="px-4 py-2">Full economy overview: profiles, sankey data, activity, budgets</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">/api/agents</td><td className="px-4 py-2">GET</td><td className="px-4 py-2">All agent profiles with P&amp;L</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">/api/agents/[id]</td><td className="px-4 py-2">GET</td><td className="px-4 py-2">Single agent detail with policy log and budgets</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">/api/policies</td><td className="px-4 py-2">GET</td><td className="px-4 py-2">All policy configs and enforcement log</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">/api/policies/[name]</td><td className="px-4 py-2">POST</td><td className="px-4 py-2">Update a policy config (budget, guard, or deadswitch)</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs text-foreground">/api/export</td><td className="px-4 py-2">GET</td><td className="px-4 py-2">CSV export of the full spending ledger</td></tr>
                </tbody>
              </table>
            </div>
          </SectionAnchor>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* XMTP */}
        <SectionAnchor id="xmtp">
          <h2 className="text-2xl font-bold tracking-tight mb-4">XMTP Service Discovery</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Agents discover each other&apos;s services via wallet-to-wallet messaging before paying via x402. The XMTP integration uses a local file-based message bus at <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">~/.ows/aegis/messages.json</code> with the XMTP SDK wired as an optional network transport.
          </p>

          <SectionAnchor id="xmtp-announce">
            <h3 className="text-lg font-semibold mb-3">Service Announcements</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When an agent starts with Aegis Gate, it announces its paid services to the message bus:
            </p>
            <CodeBlock title="Auto-announce on startup">{`import { announceServices } from "@aegis-ows/gate";
import config from "./aegis.config.json";

// After Express server starts:
announceServices(config, "http://localhost:4001");`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              The announcement includes all paid endpoints (price &gt; 0) with their prices, tokens, descriptions, and base URLs.
            </p>
          </SectionAnchor>

          <SectionAnchor id="xmtp-discover">
            <h3 className="text-lg font-semibold mt-8 mb-3">Service Discovery</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before making a purchase, agents can search for available services:
            </p>
            <CodeBlock title="Discover services">{`import { findServices, payAndFetch } from "@aegis-ows/gate";

// Search for analysis services
const services = findServices("analysis", "research-buyer");
// Returns: [{ endpoint, price, token, description, fullUrl }]

// Pay the first match
const result = await payAndFetch(services[0].fullUrl, "research-buyer");`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Discovery queries and responses are logged to the message bus and appear in the Nexus dashboard&apos;s XMTP Discovery feed.
            </p>
          </SectionAnchor>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* CLI */}
        <SectionAnchor id="cli">
          <h2 className="text-2xl font-bold tracking-tight mb-4">CLI Reference</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The Aegis CLI provides command-line tools for initializing, configuring, and monitoring the agent economy.
          </p>

          <SectionAnchor id="cli-init">
            <h3 className="text-lg font-semibold mb-3">aegis init</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">Creates <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">~/.ows/aegis/</code> and writes default config files if they don&apos;t exist.</p>
            <CodeBlock>{`$ aegis init
Initialized directory: /Users/you/.ows/aegis
Created default config files:
  /Users/you/.ows/aegis/budget-config.json
  /Users/you/.ows/aegis/guard-config.json
  /Users/you/.ows/aegis/deadswitch-config.json`}</CodeBlock>
          </SectionAnchor>

          <SectionAnchor id="cli-budget">
            <h3 className="text-lg font-semibold mt-8 mb-3">aegis budget</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">Shows budget status for all configured limits.</p>
            <CodeBlock>{`$ aegis budget --period daily
Budget Status (daily):
  USDC on eip155:8453: $0.35 / $0.50 (70%) — $0.15 remaining
  * on *: $0.60 / $1.00 (60%) — $0.40 remaining`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Options: <code className="bg-white/[0.06] px-1 py-0.5 rounded">--chain &lt;chain&gt;</code> to filter, <code className="bg-white/[0.06] px-1 py-0.5 rounded">--period daily|weekly|monthly</code>.
            </p>
          </SectionAnchor>

          <SectionAnchor id="cli-guard">
            <h3 className="text-lg font-semibold mt-8 mb-3">aegis guard</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">Manage address allowlist and blocklist.</p>
            <CodeBlock>{`$ aegis guard                              # Show current config
$ aegis guard --add 0xA0b8... --chain eip155:1  # Add to allowlist
$ aegis guard --add 0xBad0... --block           # Add to blocklist
$ aegis guard --remove 0xA0b8...                # Remove from all lists`}</CodeBlock>
          </SectionAnchor>

          <SectionAnchor id="cli-status">
            <h3 className="text-lg font-semibold mt-8 mb-3">aegis status</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">Shows agent economy status with P&amp;L for all agents, plus deadswitch status.</p>
            <CodeBlock>{`$ aegis status
Agent Economy Status:

  Agent              Revenue    Spending   P/L
  -------------------------------------------------------
  analyst                $0.50     $0.10   +$0.40
  data-miner             $0.10     $0.00   +$0.10
  research-buyer         $0.00     $0.50   -$0.50

Deadswitch: Active (30min timeout)
  Last heartbeat: 5min ago (triggers at 30min)`}</CodeBlock>
          </SectionAnchor>

          <SectionAnchor id="cli-install">
            <h3 className="text-lg font-semibold mt-8 mb-3">aegis install</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">Registers the three Aegis policy executables with OWS.</p>
            <CodeBlock>{`$ aegis install
Registering Aegis policies with OWS:
  aegis-budget     — Enforces spending limits per chain/token/period
  aegis-guard      — Allow/blocklist address enforcement
  aegis-deadswitch — Dead man's switch — revokes key after inactivity`}</CodeBlock>
          </SectionAnchor>

          <SectionAnchor id="cli-report">
            <h3 className="text-lg font-semibold mt-8 mb-3">aegis report</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">Generate spending reports from the ledger.</p>
            <CodeBlock>{`$ aegis report --period today --format summary
$ aegis report --period week --format detailed
$ aegis report --period month --format csv > report.csv`}</CodeBlock>
          </SectionAnchor>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Data Storage */}
        <SectionAnchor id="data">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Data Storage</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            All data is stored as JSON files in <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">~/.ows/aegis/</code>, following OWS&apos;s local-first philosophy. No database required.
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden text-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">File</th>
                  <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">budget-config.json</td><td className="px-4 py-2">Spending limit configuration</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">budget-ledger.json</td><td className="px-4 py-2">Cumulative spending records (per agent, chain, token)</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">earnings-ledger.json</td><td className="px-4 py-2">Revenue records from Gate-protected endpoints</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">guard-config.json</td><td className="px-4 py-2">Address allowlist/blocklist configuration</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">deadswitch-config.json</td><td className="px-4 py-2">Dead man&apos;s switch configuration + heartbeat</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">policy-log.json</td><td className="px-4 py-2">Immutable log of all policy allow/deny decisions</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs text-foreground">messages.json</td><td className="px-4 py-2">XMTP message bus (service announcements, queries, responses)</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Demo */}
        <SectionAnchor id="demo">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Demo Economy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The demo creates a 3-agent supply chain that runs a full economic cycle:
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">research-buyer</div>
                <div className="text-xs text-muted-foreground">pays $0.05</div>
              </div>
              <div className="text-emerald-400">&rarr;</div>
              <div className="text-center">
                <div className="font-semibold">analyst</div>
                <div className="text-xs text-muted-foreground">earns $0.05, pays $0.01</div>
              </div>
              <div className="text-emerald-400">&rarr;</div>
              <div className="text-center">
                <div className="font-semibold">data-miner</div>
                <div className="text-xs text-muted-foreground">earns $0.01</div>
              </div>
            </div>
          </div>
          <CodeBlock title="Run the demo">{`# Seed demo data
cd demo && npx tsx seed.ts

# Start the 3-agent economy
npx tsx run-economy.ts

# Or run agents individually:
npx tsx agents/data-miner.ts     # Port 4001
npx tsx agents/analyst.ts        # Port 4002
npx tsx agents/research-buyer.ts # Client`}</CodeBlock>
          <p className="text-muted-foreground text-sm mt-3">
            The research-buyer discovers the analyst via XMTP, then makes 5 purchases at $0.05 each. Each purchase triggers the analyst to buy from data-miner at $0.01. All transactions flow through OWS policies and appear in the Nexus dashboard.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Partners */}
        <SectionAnchor id="partners">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Partner Integrations</h2>
          <div className="grid gap-3">
            <FeatureCard
              title="Zerion"
              description="Multi-chain wallet balance queries displayed on the agent detail page. Shows token balances across all chains the agent operates on."
            />
            <FeatureCard
              title="MoonPay"
              description="On-ramp integration for funding agent wallets. Agents can top up their OWS wallets with fiat via MoonPay CLI."
            />
            <FeatureCard
              title="XMTP"
              description="Wallet-to-wallet messaging for agent service discovery. Agents announce services and discover each other before paying via x402."
            />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Tech Stack */}
        <SectionAnchor id="tech-stack">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Tech Stack</h2>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden text-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Component</th>
                  <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Technology</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 text-foreground">Gate Middleware</td><td className="px-4 py-2">TypeScript + Express, x402 protocol</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 text-foreground">Policy Executables</td><td className="px-4 py-2">TypeScript/Node.js, OWS policy interface (stdin/stdout)</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 text-foreground">Service Discovery</td><td className="px-4 py-2">XMTP SDK, local file-based message bus</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 text-foreground">Nexus Dashboard</td><td className="px-4 py-2">Next.js 16 + shadcn/ui + Recharts + Inter font</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 text-foreground">CLI</td><td className="px-4 py-2">Commander.js</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 text-foreground">Data Storage</td><td className="px-4 py-2">JSON files in ~/.ows/aegis/ (local-first)</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 text-foreground">Partner Tools</td><td className="px-4 py-2">Zerion (balances), MoonPay (on-ramp), XMTP (messaging)</td></tr>
                <tr><td className="px-4 py-2 text-foreground">OWS Integration</td><td className="px-4 py-2">@open-wallet-standard/core</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center text-xs text-muted-foreground">
          <p>Built for the <a href="https://hackathon.openwallet.sh/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">OWS Hackathon</a> &mdash; MIT License</p>
        </div>
      </div>
    </div>
  );
}
