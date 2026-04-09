"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
    </div>
  );
}

function TableOfContents() {
  const sections = [
    { id: "what-is-aegis", label: "What is Aegis?" },
    { id: "how-it-works", label: "How It Works" },
    { id: "getting-started", label: "Getting Started" },
    { id: "monetize", label: "Monetize Your API" },
    { id: "spending-safety", label: "Spending Safety" },
    { id: "budget-limits", label: "  Budget Limits" },
    { id: "address-guard", label: "  Address Guard" },
    { id: "dead-mans-switch", label: "  Dead Man's Switch" },
    { id: "dashboard", label: "The Dashboard" },
    { id: "economy-view", label: "  Economy View" },
    { id: "agent-profiles", label: "  Agent Profiles" },
    { id: "policy-management", label: "  Policy Management" },
    { id: "autonomous-agents", label: "Autonomous Agents" },
    { id: "interactive-dashboard", label: "Interactive Dashboard" },
    { id: "x402-security", label: "x402 Payment Security" },
    { id: "agent-discovery", label: "Agent Communication Protocol" },
    { id: "price-negotiation", label: "  Price Negotiation" },
    { id: "health-monitoring", label: "  Health Monitoring" },
    { id: "payment-receipts-msg", label: "  Payment Receipts (Messaging)" },
    { id: "reputation-gossip", label: "  Reputation Gossip" },
    { id: "sla-agreements", label: "  SLA Agreements" },
    { id: "supply-chain-groups", label: "  Supply Chain Groups" },
    { id: "agent-identity", label: "  Agent Identity & Business Cards" },
    { id: "dispute-resolution", label: "  Dispute Resolution" },
    { id: "xmtp-directory", label: "  Agent Directory" },
    { id: "xmtp-notifications", label: "  XMTP Notifications" },
    { id: "xmtp-transport", label: "  Real vs File Transport" },
    { id: "production-deployment", label: "Production Deployment" },
    { id: "cli-tools", label: "CLI Tools" },
    { id: "demo", label: "Live Demo" },
    { id: "integrations", label: "Integrations" },
    { id: "for-developers", label: "For Developers" },
    { id: "manage-dashboard", label: "Management Dashboard" },
    { id: "solana-payments", label: "On-Chain Payments" },
    { id: "custom-policies", label: "Custom Policies" },
    { id: "manage-ui", label: "Manage UI" },
    { id: "mcp-server", label: "MCP Server" },
    { id: "x402-endpoints", label: "Live x402 Endpoints" },
    { id: "security", label: "Security" },
    { id: "service-registry", label: "Service Registry" },
    { id: "payment-receipts", label: "Payment Receipts" },
    { id: "economy-analytics", label: "Economy Analytics" },
    { id: "multi-chain", label: "Multi-Chain Support" },
    { id: "api-features", label: "API Features" },
    { id: "agent-reputation", label: "Agent Reputation" },
    { id: "agent-templates", label: "Agent Templates" },
    { id: "fleet-manager", label: "Fleet Manager" },
    { id: "xmtp-guide", label: "XMTP Agent Messaging" },
    { id: "multi-tenant", label: "Multi-Tenant Platform" },
    { id: "auth", label: "  Authentication" },
    { id: "wallet-generation", label: "  Wallet Generation" },
    { id: "realtime", label: "  Real-Time Updates" },
    { id: "data-layer", label: "  Data Layer" },
    { id: "roadmap-link", label: "Roadmap" },
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
          <h1 className="text-4xl font-bold tracking-tight">Aegis</h1>
          <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
            The commerce protocol for AI agent economies. Learn how agents earn, spend safely, and operate transparently.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors">
              View Live Dashboard
            </Link>
            <a href="https://github.com/rajkaria/aegis" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-colors">
              GitHub
            </a>
          </div>
        </div>

        {/* What is Aegis */}
        <SectionAnchor id="what-is-aegis">
          <h2 className="text-2xl font-bold tracking-tight mb-4">What is Aegis?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis is a commerce protocol that lets AI agents participate in real economies. Built on the <a href="https://openwallet.sh" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">Open Wallet Standard (OWS)</a>, it gives agents the ability to:
          </p>
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <FeatureCard icon="$" title="Earn Money" description="Any API can become a paid service. Agents sell data, analysis, or compute and get paid per call." />
            <FeatureCard icon="~" title="Spend Safely" description="Configurable spending limits, address allowlists, and an inactivity kill switch keep agents on a leash." />
            <FeatureCard icon="@" title="Stay Visible" description="A real-time dashboard shows who's earning, who's spending, and how money flows between agents." />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The result is an <strong className="text-foreground">agent economy</strong> where multiple autonomous agents trade services with each other, governed by human-defined policies, with full transparency into every transaction.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* How It Works */}
        <SectionAnchor id="how-it-works">
          <h2 className="text-2xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis has three layers that work together to create a complete agent economy:
          </p>

          <div className="space-y-6 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-emerald-400 mb-2">Layer 1: Aegis Gate &mdash; How agents earn</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gate is middleware you add to any Express API. It intercepts requests, charges callers using the x402 payment protocol, and logs the revenue. Your existing API logic doesn&apos;t change &mdash; Gate handles all the payment plumbing.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-sky-400 mb-2">Layer 2: Aegis Policies &mdash; How agents stay safe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Three safety policies plug directly into OWS&apos;s wallet. Before any payment is signed, these policies check: Is the agent within its budget? Is the recipient address trusted? Has the agent been active recently? If any check fails, the transaction is blocked.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-violet-400 mb-2">Layer 3: Aegis Nexus &mdash; How humans see everything</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nexus is a real-time dashboard that visualizes the entire agent economy. It shows money flowing between agents, each agent&apos;s profit and loss, budget consumption, policy enforcement events, and more &mdash; all updating live.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">The supply chain in action:</p>
            <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
              <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="font-semibold text-red-400">Research Buyer</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Buys analysis &mdash; spends $0.05</div>
              </div>
              <span className="text-emerald-400 font-mono text-lg">&rarr;</span>
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="font-semibold text-emerald-400">Analyst</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Sells analysis, buys data &mdash; +$0.04</div>
              </div>
              <span className="text-emerald-400 font-mono text-lg">&rarr;</span>
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="font-semibold text-emerald-400">Data Miner</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Sells raw data &mdash; +$0.01</div>
              </div>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Getting Started */}
        <SectionAnchor id="getting-started">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Getting Started</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Get Aegis running in under 2 minutes. The fastest way is the one-liner setup script:
          </p>
          <CodeBlock title="One-liner setup">{`git clone https://github.com/rajkaria/aegis
cd aegis && ./setup.sh`}</CodeBlock>
          <p className="text-muted-foreground leading-relaxed my-4">
            This installs dependencies, builds all packages, and seeds demo data. Or do it step by step:
          </p>
          <div className="space-y-4 mb-6">
            <StepCard number="1" title="Clone and install" description="Download the project and install all dependencies." />
            <StepCard number="2" title="Run setup.sh" description="Builds packages, seeds the demo economy, and prepares the dashboard." />
            <StepCard number="3" title="Open the dashboard" description="See the economy visualized in real time." />
          </div>
          <CodeBlock title="Manual setup">{`git clone https://github.com/rajkaria/aegis
cd aegis && npm install

# Build all packages
npm run build

# Seed the demo economy
cd demo && npx tsx seed.ts

# Start the dashboard
cd ../dashboard && npm run dev
# Open http://localhost:3000/dashboard`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Monetize Your API */}
        <SectionAnchor id="monetize">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Monetize Your API</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis Gate turns any API endpoint into a paid service with a single line of code. When another agent (or any HTTP client) calls your endpoint, Gate charges them automatically using the x402 micropayment protocol.
          </p>
          <CodeBlock title="Install from npm">{`npm install aegis-ows-gate express`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            See the full integration guide at <a href="/use-aegis" className="text-emerald-400 hover:text-emerald-300">/use-aegis</a> for complete, copy-pasteable examples.
          </p>

          <h3 className="text-lg font-semibold mt-8 mb-3">Protect an endpoint</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Add Gate as middleware on any Express route. Set the price and token &mdash; Gate handles the rest.
          </p>
          <CodeBlock title="One line to monetize">{`// npm install aegis-ows-gate
import { aegisGate } from "aegis-ows-gate";

// This endpoint now costs $0.01 per call
app.get("/api/scrape",
  aegisGate({ price: "0.01", token: "USDC", agentId: "my-agent" }),
  (req, res) => {
    res.json({ data: "your content here" });
  }
);`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Pay for a service</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            On the buyer side, <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">payAndFetch</code> handles payment automatically. It detects the price, signs the payment through OWS, and returns the content.
          </p>
          <CodeBlock title="One line to pay">{`// npm install aegis-ows-gate
import { payAndFetch } from "aegis-ows-gate";

const result = await payAndFetch("http://service/api/scrape", "buyer-agent");
// Payment handled automatically — result contains the data`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">How payment works</h3>
          <div className="space-y-3 text-sm text-muted-foreground mb-4">
            <StepCard number="1" title="Request" description="The buyer calls your endpoint normally." />
            <StepCard number="2" title="402 Response" description="Gate returns HTTP 402 with the price, token, and payment address." />
            <StepCard number="3" title="Payment" description="The buyer signs a payment through their OWS wallet." />
            <StepCard number="4" title="Retry" description="The buyer resends the request with a payment proof." />
            <StepCard number="5" title="Access" description="Gate verifies, logs the earning, and forwards to your handler." />
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-3">Config-based setup</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            For agents with multiple endpoints, define everything in a config file:
          </p>
          <CodeBlock title="aegis.config.json">{`{
  "walletName": "my-agent",
  "network": "eip155:8453",
  "endpoints": {
    "/scrape": { "price": "0.01", "description": "Web scraping" },
    "/analyze": { "price": "0.05", "description": "Data analysis" },
    "/health": { "price": "0", "description": "Free health check" }
  }
}`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Spending Safety */}
        <SectionAnchor id="spending-safety">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Spending Safety</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Agents with wallets need guardrails. Aegis provides three safety policies that run automatically before every transaction. If any policy says no, the payment is blocked before it leaves the wallet.
          </p>

          <SectionAnchor id="budget-limits">
            <h3 className="text-lg font-semibold mb-3">Budget Limits</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Set daily, weekly, or monthly spending caps per blockchain and token. An agent with a $0.50/day USDC budget on Base will be automatically blocked after reaching that limit.
            </p>
            <CodeBlock title="Example: $0.50/day on Base, $1/day globally">{`{
  "limits": [
    { "chainId": "eip155:8453", "token": "USDC", "daily": "0.50" },
    { "chainId": "*", "token": "*", "daily": "1.00" }
  ]
}`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              Use <code className="bg-white/[0.06] px-1 py-0.5 rounded">*</code> as a wildcard to set global limits across all chains and tokens.
            </p>
          </SectionAnchor>

          <SectionAnchor id="address-guard">
            <h3 className="text-lg font-semibold mt-8 mb-3">Address Guard</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Restrict which addresses your agent can interact with. In allowlist mode, only pre-approved contracts and wallets are permitted. Known scam addresses are always blocked.
            </p>
            <CodeBlock title="Example: Only allow known contracts">{`{
  "mode": "allowlist",
  "addresses": {
    "eip155:8453": ["0xUSDC_CONTRACT", "0xUNISWAP_ROUTER"]
  },
  "blockAddresses": ["0xKNOWN_SCAM"]
}`}</CodeBlock>
          </SectionAnchor>

          <SectionAnchor id="dead-mans-switch">
            <h3 className="text-lg font-semibold mt-8 mb-3">Dead Man&apos;s Switch</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If an agent goes silent for too long, this policy blocks all further transactions. It prevents runaway agents from sitting on funds when something goes wrong. Every successful transaction resets the timer.
            </p>
            <CodeBlock title="Example: 30-minute inactivity timeout">{`{
  "maxInactiveMinutes": 30,
  "onTrigger": "revoke_key",
  "enabled": true
}`}</CodeBlock>
            <p className="text-muted-foreground text-sm mt-3">
              After 30 minutes of no activity, the agent is locked out until a human intervenes.
            </p>
          </SectionAnchor>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Dashboard */}
        <SectionAnchor id="dashboard">
          <h2 className="text-2xl font-bold tracking-tight mb-4">The Dashboard</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis Nexus is a real-time window into your agent economy. It updates live as agents transact, showing everything you need to understand what&apos;s happening.
          </p>

          <SectionAnchor id="economy-view">
            <h3 className="text-lg font-semibold mb-3">Economy View</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">The main screen shows the full picture at a glance:</p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc mb-4">
              <li><strong className="text-foreground">Money Flow</strong> &mdash; An animated visualization showing payments flowing between agents in your economy. See who pays whom and how much.</li>
              <li><strong className="text-foreground">Key Metrics</strong> &mdash; Total economy volume, number of active agents, combined profit/loss, and transactions blocked by policies.</li>
              <li><strong className="text-foreground">Budget Bars</strong> &mdash; Color-coded progress bars showing how close each agent is to their spending limits. Green is safe, yellow is getting close, red means almost spent.</li>
              <li><strong className="text-foreground">Activity Feed</strong> &mdash; A live stream of everything happening: payments received, money spent, policies enforced, and services discovered.</li>
            </ul>
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 font-medium">Open the live dashboard &rarr;</Link>
              {" "}to see the demo economy with three agents already transacting.
            </div>
          </SectionAnchor>

          <SectionAnchor id="agent-profiles">
            <h3 className="text-lg font-semibold mt-8 mb-3">Agent Profiles</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Drill into any agent to see their complete financial picture:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc">
              <li><strong className="text-foreground">Profit &amp; Loss</strong> &mdash; How much the agent has earned vs. spent, and whether it&apos;s profitable</li>
              <li><strong className="text-foreground">Wallet Balances</strong> &mdash; Token holdings across all chains (powered by Zerion)</li>
              <li><strong className="text-foreground">Revenue Sources</strong> &mdash; Which endpoints are earning money and how much each one brings in</li>
              <li><strong className="text-foreground">Spending Breakdown</strong> &mdash; Which services the agent is buying from and the cost of each</li>
              <li><strong className="text-foreground">Policy History</strong> &mdash; Every allow and block decision that applied to this agent</li>
            </ul>
          </SectionAnchor>

          <SectionAnchor id="policy-management">
            <h3 className="text-lg font-semibold mt-8 mb-3">Policy Management</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Edit all three policies directly from the dashboard &mdash; no config files to edit by hand:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc">
              <li><strong className="text-foreground">Budget Editor</strong> &mdash; Add or remove spending limits, adjust caps, see current enforcement stats</li>
              <li><strong className="text-foreground">Guard Editor</strong> &mdash; Switch between allowlist and blocklist mode, add/remove addresses</li>
              <li><strong className="text-foreground">Deadswitch Editor</strong> &mdash; Set the inactivity timeout, enable/disable, check the heartbeat timer</li>
            </ul>
            <p className="text-muted-foreground text-sm mt-3">
              Changes take effect immediately. Each editor also shows a live JSON preview of the generated config.
            </p>
          </SectionAnchor>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Autonomous Agents */}
        <SectionAnchor id="autonomous-agents">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Autonomous Agents</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis agents are not scripted bots that follow a fixed sequence. The autonomous buyer agent runs in a continuous decision loop, making independent choices at every step.
          </p>

          <h3 className="text-lg font-semibold mt-8 mb-3">The Autonomous Loop</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Each iteration of the buyer&apos;s loop follows this pattern:
          </p>
          <div className="space-y-3 mb-6">
            <StepCard number="1" title="Discover" description="Query XMTP for available services before each purchase. The buyer never assumes what's available." />
            <StepCard number="2" title="Evaluate" description="Check remaining budget against service costs. If the budget is tight, skip expensive services or wait." />
            <StepCard number="3" title="Decide" description="Buy, skip, or wait based on budget constraints and cost optimization. No human tells it what to do." />
            <StepCard number="4" title="Execute" description="Sign the payment through OWS and receive the service. Policies enforce limits at signing time." />
            <StepCard number="5" title="Terminate" description="When the budget is exhausted, the agent cleanly shuts itself down." />
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-3">How it differs from scripted agents</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A scripted agent runs a fixed sequence: call endpoint A, then B, then stop. An autonomous Aegis agent discovers what&apos;s available at runtime, evaluates whether it can afford it, and decides on its own. If a new service appears mid-run, the agent can find and use it. If prices change, it adapts its purchasing strategy.
          </p>

          <CodeBlock title="Run the autonomous economy">{`cd demo && npx tsx run-economy.ts

# Starts 3 agents:
#   data-miner   — sells /scrape ($0.01)
#   analyst      — sells /analyze ($0.05), buys /scrape
#   research-buyer — autonomous buyer with $0.50 budget`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Interactive Dashboard */}
        <SectionAnchor id="interactive-dashboard">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Interactive Dashboard</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The dashboard at <a href="https://useaegis.xyz" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">useaegis.xyz</a> is not a static display &mdash; it is fully interactive, even on the live Vercel deployment.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h4 className="font-semibold text-sm text-emerald-400">Run Economy Cycle</h4>
              <p className="text-xs text-muted-foreground mt-1">Click the button to trigger a full supply chain cycle. The buyer discovers services, pays the analyst, who pays the miner. Watch the money flow update in real-time.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Auto-Refresh</h4>
              <p className="text-xs text-muted-foreground mt-1">The dashboard polls every 5 seconds. New transactions, policy events, and balance changes appear automatically without page reload.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Policy Editor</h4>
              <p className="text-xs text-muted-foreground mt-1">Edit budget limits, guard addresses, and deadswitch configuration directly from the browser. Changes take effect immediately.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">CSV Export</h4>
              <p className="text-xs text-muted-foreground mt-1">Download the complete transaction ledger as a CSV file for external analysis or record-keeping.</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 font-medium">Try it live &rarr;</Link>
            {" "}Click &ldquo;Run Economy Cycle&rdquo; and watch agents trade in real-time.
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* x402 Payment Security */}
        <SectionAnchor id="x402-security">
          <h2 className="text-2xl font-bold tracking-tight mb-4">x402 Payment Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The x402 payment protocol includes built-in protections against common attack vectors. Every payment proof is validated before the seller grants access.
          </p>

          <div className="space-y-4 mb-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-emerald-400 mb-2">Timestamp Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every payment proof includes a timestamp. Gate rejects proofs that are too old, preventing replay attacks where a captured payment is resubmitted later. The expiry window is configurable per endpoint.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-sky-400 mb-2">Replay Protection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each payment proof contains a unique nonce tied to the specific request. Even within the validity window, the same proof cannot be used twice. Gate tracks seen nonces and rejects duplicates.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-violet-400 mb-2">Signature Validation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Payment proofs are cryptographically signed through the OWS signing enclave. Gate verifies the signature against the payer&apos;s public key, ensuring the proof was generated by the claimed wallet and has not been tampered with.
              </p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Agent Discovery */}
        <SectionAnchor id="agent-discovery">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Agent Communication Protocol</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis includes a full XMTP-powered agent communication protocol with 12 message types for complete agent-to-agent commerce. The protocol works locally via a file-based message bus (default) and over the real XMTP network when <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">XMTP_ENV</code> and <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">XMTP_WALLET_KEY</code> are set.
          </p>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              For use cases, architecture deep-dive, and an end-to-end implementation guide, see the dedicated{" "}
              <Link href="/docs/xmtp" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">XMTP Agent Messaging Guide &rarr;</Link>
            </p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 font-semibold">Message Type</th>
                  <th className="py-2 pr-4 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">service_announcement</td><td className="py-2">Agents publish available services</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">service_query</td><td className="py-2">Agents search for capabilities</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">negotiation_offer/response</td><td className="py-2">Price negotiation before payment</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">health_ping/pong</td><td className="py-2">Availability checks</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">payment_receipt</td><td className="py-2">Signed proof of payment delivery</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">reputation_gossip</td><td className="py-2">Trust observations shared between agents</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">sla_agreement</td><td className="py-2">Formal service terms</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">supply_chain_invite</td><td className="py-2">Multi-agent coordination groups</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">business_card</td><td className="py-2">Agent economic identity broadcast</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">dispute/dispute_response</td><td className="py-2">Dispute resolution for failed services</td></tr>
                <tr><td className="py-2 pr-4 font-mono text-xs text-emerald-400">xmtp_notification</td><td className="py-2">Policy alerts and budget warnings via messaging</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-3">Service Discovery</h3>
          <div className="space-y-4 mb-6">
            <StepCard number="1" title="Announce" description="When an agent starts up, it broadcasts what services it offers (endpoints, prices, descriptions) to the message bus." />
            <StepCard number="2" title="Discover" description="An agent looking for a capability (like 'web scraping' or 'data analysis') searches the bus and finds matching services." />
            <StepCard number="3" title="Pay" description="The agent calls the discovered service URL and pays automatically via x402." />
          </div>

          <CodeBlock title="Discovery in action">{`import { findServices, payAndFetch } from "aegis-ows-gate";

// Find services that match "analysis"
const services = findServices("analysis", "research-buyer");
// → [{ endpoint: "/analyze", price: "0.05", fullUrl: "http://..." }]

// Pay and get the result
const result = await payAndFetch(services[0].fullUrl, "research-buyer");`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="price-negotiation">
          <h3 className="text-lg font-semibold mt-8 mb-3">Price Negotiation</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Agents can negotiate prices before committing to a purchase. The buyer sends an offer with a proposed price and reason; the seller can accept or counter-offer.
          </p>
          <CodeBlock title="Negotiate before buying">{`import { sendNegotiationOffer, respondToNegotiation } from "aegis-ows-gate";

// Buyer proposes a lower price
sendNegotiationOffer({
  buyerId: "research-buyer",
  sellerId: "analyst",
  service: "/analyze",
  offeredPrice: "0.04",
  originalPrice: "0.05",
  reason: "Budget constraint — requesting 20% discount",
});

// Seller responds with a counter-offer
respondToNegotiation({
  sellerId: "analyst",
  buyerId: "research-buyer",
  accepted: false,
  counterPrice: "0.045",
  reason: "Can offer 10% discount for repeat buyers",
});`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="health-monitoring">
          <h3 className="text-lg font-semibold mt-8 mb-3">Health Monitoring</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Before buying from an agent, check if it&apos;s online. The ping/pong protocol lets agents verify availability and queue depth.
          </p>
          <CodeBlock title="Health checks">{`import { pingAgent, isAgentHealthy, respondToPing } from "aegis-ows-gate";

// Buyer checks if seller is available
pingAgent("research-buyer", "analyst");

// Seller auto-responds with status
respondToPing("analyst", "research-buyer", "online", 2);

// Check health before buying
if (isAgentHealthy("analyst")) {
  // Proceed with purchase
}`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="payment-receipts-msg">
          <h3 className="text-lg font-semibold mt-8 mb-3">Payment Receipts (Messaging)</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            After a successful payment, sellers send a signed receipt to the buyer over the message bus. This provides proof of payment delivery independent of on-chain settlement.
          </p>
          <CodeBlock title="Send a receipt">{`import { sendPaymentReceipt } from "aegis-ows-gate";

sendPaymentReceipt({
  sellerId: "analyst",
  buyerId: "research-buyer",
  amount: "0.005",
  token: "SOL",
  txHash: "JEX7PjWZ...",
  receiptHash: "sha256:abc123",
  service: "/analyze",
});`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="reputation-gossip">
          <h3 className="text-lg font-semibold mt-8 mb-3">Reputation Gossip</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Agents share trust observations about each other. After an interaction, an agent can report whether the experience was positive, negative, or neutral. Gossip scores are aggregated to build a decentralized trust network.
          </p>
          <CodeBlock title="Report reputation">{`import { reportReputation, getAgentGossipScore } from "aegis-ows-gate";

// After a successful purchase
reportReputation({
  reporterId: "research-buyer",
  aboutAgent: "analyst",
  rating: "positive",
  reason: "Fast response, data quality good",
  txHash: "JEX7PjWZ...",
});

// Check an agent's gossip score
const score = getAgentGossipScore("analyst");
// → { positive: 5, negative: 0, neutral: 1, net: 5 }`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="sla-agreements">
          <h3 className="text-lg font-semibold mt-8 mb-3">SLA Agreements</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Agents can propose formal service-level agreements specifying response time, uptime guarantees, and refund terms. Both parties must accept before the SLA is active.
          </p>
          <CodeBlock title="Propose and accept an SLA">{`import { proposeSLA, acceptSLA } from "aegis-ows-gate";

// Buyer proposes SLA terms
proposeSLA({
  proposerId: "research-buyer",
  toAgent: "analyst",
  service: "/analyze",
  maxResponseTimeMs: 5000,
  minUptime: 95,
  refundOnViolation: true,
  validDays: 7,
});`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="supply-chain-groups">
          <h3 className="text-lg font-semibold mt-8 mb-3">Supply Chain Groups</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Coordinate multiple agents in a supply chain. A coordinator invites participants and assigns roles, creating a named group that can be tracked in the dashboard.
          </p>
          <CodeBlock title="Create a supply chain">{`import { createSupplyChain } from "aegis-ows-gate";

const chainId = createSupplyChain({
  coordinatorId: "research-buyer",
  participants: ["research-buyer", "analyst", "data-miner"],
  roles: {
    "research-buyer": "Consumer",
    "analyst": "Intermediary",
    "data-miner": "Producer",
  },
  description: "DeFi research supply chain",
});`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="agent-identity">
          <h3 className="text-lg font-semibold mt-8 mb-3">Agent Identity &amp; Business Cards</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every Aegis agent gets a full economic identity — services offered, reputation score, P&amp;L stats, and wallet addresses. Agents broadcast their identity as a business card over the message bus so other agents can evaluate them before transacting.
          </p>
          <CodeBlock title="Build and broadcast identity">{`import { buildAgentIdentity, createBusinessCard } from "aegis-ows-gate";

// Build a full identity profile
const identity = buildAgentIdentity("analyst", {
  "eip155:1": "0x4ef5...",
  "solana:mainnet": "CePy...",
});
// → { agentId, services, reputation, stats, walletAddresses, ... }

// Broadcast as a business card
const card = createBusinessCard("analyst");`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="dispute-resolution">
          <h3 className="text-lg font-semibold mt-8 mb-3">Dispute Resolution</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When a service fails after payment, the buyer can open a dispute. The defendant can accept (and issue a refund) or reject. Disputes are visible in the dashboard and discovery feed.
          </p>
          <CodeBlock title="Open and respond to disputes">{`import { openDispute, respondToDispute } from "aegis-ows-gate";

// Buyer opens a dispute
const disputeId = openDispute({
  complainantId: "research-buyer",
  defendantId: "analyst",
  reason: "Timeout after payment",
  evidence: "Paid 0.005 SOL but got no response within SLA",
  requestedResolution: "refund",
});

// Seller responds
respondToDispute({
  disputeId,
  defendantId: "analyst",
  complainantId: "research-buyer",
  accepted: true,
  resolution: "Refund issued — downstream service was overloaded",
});`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="xmtp-directory">
          <h3 className="text-lg font-semibold mt-8 mb-3">Agent Directory</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The in-memory agent directory allows agents to register and be discovered by service type, name, or capability. Directory entries include full identity profiles and are sorted by reputation score.
          </p>
          <CodeBlock title="Directory registration and search">{`import { registerInDirectory, searchDirectory, listDirectory } from "aegis-ows-gate";

// Register an agent in the directory
registerInDirectory("analyst", { "eip155:1": "0x4ef5..." });

// Search for services
const results = searchDirectory("analysis");
// → sorted by reputation score

// List all registered agents
const all = listDirectory();`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="xmtp-notifications">
          <h3 className="text-lg font-semibold mt-8 mb-3">XMTP Notifications</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Policy blocks, budget alerts, and deadswitch warnings are sent as structured XMTP notifications. Operators can monitor agent health through the message bus.
          </p>
          <CodeBlock title="Policy and budget notifications">{`import {
  notifyPolicyBlock,
  notifyBudgetAlert,
  notifyDeadswitchWarning,
} from "aegis-ows-gate";

// Alert when a policy blocks a transaction
notifyPolicyBlock("analyst", "operator", "aegis-budget", "Daily limit exceeded");

// Budget usage warning
notifyBudgetAlert("analyst", "operator", 92, "1.00");

// Deadswitch countdown
notifyDeadswitchWarning("analyst", "operator", 5);`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="xmtp-transport">
          <h3 className="text-lg font-semibold mt-8 mb-3">Real vs File-based Transport</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The XMTP transport layer automatically selects the best transport. When <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">XMTP_ENV</code> and <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">XMTP_WALLET_KEY</code> are set, messages are sent over the real XMTP network. Otherwise, everything works locally via the file-based message bus at <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">~/.ows/aegis/messages.json</code>. All messages are always written to the file bus for dashboard visibility.
          </p>
          <CodeBlock title="Transport layer">{`import { getTransport, isXMTPLive, getXMTPAddress } from "aegis-ows-gate";

// Get the active transport (auto-selects real XMTP or file bus)
const transport = await getTransport();

// Check if real XMTP is connected
console.log(isXMTPLive()); // true if XMTP_ENV + XMTP_WALLET_KEY are set

// Get the agent's XMTP address (if connected)
console.log(getXMTPAddress()); // "0x..." or null`}</CodeBlock>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 mt-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-emerald-400">Standalone:</strong> Use XMTP messaging without the x402 payment stack. Import from <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">aegis-ows-gate/xmtp-messaging</code> for messaging-only functions with zero Express/Solana/ethers dependencies.{" "}
              <Link href="/docs/xmtp#standalone" className="text-emerald-400 hover:text-emerald-300 transition-colors">Learn more &rarr;</Link>
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* PRODUCTION DEPLOYMENT */}
        <SectionAnchor id="production-deployment">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Production Deployment</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Run Aegis agents with real money on mainnet. This guide covers environment setup, budget configuration, safety policies, and monitoring.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Environment Variables</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 font-semibold">Variable</th>
                  <th className="py-2 pr-4 font-semibold">Required</th>
                  <th className="py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">SOLANA_RPC_URL</td><td className="py-2 pr-4 text-xs">For Solana payments</td><td className="py-2 text-xs">Solana RPC endpoint. No default &mdash; must be set explicitly.</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">XMTP_ENV</td><td className="py-2 pr-4 text-xs">For live messaging</td><td className="py-2 text-xs">XMTP network: <code className="text-xs bg-white/10 px-1 rounded">dev</code> or <code className="text-xs bg-white/10 px-1 rounded">production</code></td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs text-emerald-400">XMTP_WALLET_KEY</td><td className="py-2 pr-4 text-xs">For live messaging</td><td className="py-2 text-xs">Private key for XMTP identity. Does not need funds.</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-3">Step 1: Initialize</h3>
          <CodeBlock title="Set up Aegis">{`npm install aegis-ows-gate aegis-ows-shared
npx aegis init

# Set your network
export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # mainnet
# export SOLANA_RPC_URL=https://api.devnet.solana.com      # devnet (testing)`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Step 2: Configure Budget</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Set spending limits to control how much agents can spend. Aegis enforces these before every transaction &mdash; if a payment would exceed any limit, it&apos;s blocked.
          </p>
          <CodeBlock title="~/.ows/aegis/budget-config.json">{`{
  "limits": [
    {
      "chainId": "solana:mainnet",
      "token": "SOL",
      "daily": "0.5",
      "monthly": "10.0"
    },
    {
      "chainId": "eip155:8453",
      "token": "USDC",
      "daily": "10.00",
      "monthly": "50.00"
    },
    {
      "chainId": "*",
      "token": "*",
      "daily": "15.00"
    }
  ]
}`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Step 3: Configure Guard</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Restrict which addresses your agents can pay. Use allowlist mode to only permit known recipients, or blocklist mode to block specific addresses.
          </p>
          <CodeBlock title="~/.ows/aegis/guard-config.json">{`{
  "mode": "allowlist",
  "addresses": {
    "solana:mainnet": [
      "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
      "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq"
    ],
    "eip155:8453": [
      "0xYourTrustedRecipient1",
      "0xYourTrustedRecipient2"
    ]
  }
}`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Step 4: Configure Deadswitch</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Auto-kill agents that go inactive. If an agent hasn&apos;t made a transaction within the timeout, its keys are revoked.
          </p>
          <CodeBlock title="~/.ows/aegis/deadswitch-config.json">{`{
  "maxInactiveMinutes": 60,
  "onTrigger": "revoke_key",
  "enabled": true
}`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Step 5: Run Your Agents</h3>
          <CodeBlock title="Start the supply chain">{`# Terminal 1: Start the data miner (earns SOL)
node demo/agents/data-miner.js

# Terminal 2: Start the analyst (buys from miner, sells to buyers)
node demo/agents/analyst.js

# Terminal 3: Start the autonomous buyer (discovers, negotiates, buys)
node demo/agents/autonomous-buyer.js`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Step 6: Monitor</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Watch everything in real-time from the Aegis dashboard or CLI.
          </p>
          <CodeBlock title="Monitor spending and health">{`# Check budget usage
npx aegis budget --period daily

# Check agent status
npx aegis status

# View the dashboard
open http://localhost:3000/dashboard`}</CodeBlock>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 mt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-amber-400">Safety:</strong> Always start on devnet first. Set <code className="text-xs bg-white/10 px-1 rounded">SOLANA_RPC_URL</code> to the devnet endpoint, test your agents, verify budget limits are enforced, then switch to mainnet when ready. The budget policy will block any transaction that exceeds your configured limits.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* CLI */}
        <SectionAnchor id="cli-tools">
          <h2 className="text-2xl font-bold tracking-tight mb-4">CLI Tools</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Manage your Aegis setup from the command line.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-sm mb-2">Set up Aegis</h3>
              <CodeBlock>{`aegis init       # Create config directory with defaults
aegis install    # Register policies with OWS`}</CodeBlock>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Monitor the economy</h3>
              <CodeBlock>{`aegis status     # See agent P&L table + deadswitch status
aegis budget     # Check spending against limits
aegis report     # Generate spending report (summary, detailed, or CSV)`}</CodeBlock>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Manage security</h3>
              <CodeBlock>{`aegis guard                        # View current allowlist/blocklist
aegis guard --add 0xA0b8... --chain eip155:1  # Allow an address
aegis guard --add 0xBad0... --block           # Block an address`}</CodeBlock>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Demo */}
        <SectionAnchor id="demo">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Live Demo</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis ships with a ready-to-run demo that creates three agents trading with each other:
          </p>
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <div className="font-semibold">Data Miner</div>
              <div className="text-xs text-muted-foreground mt-1">Sells web scraping</div>
              <div className="text-xs text-emerald-400 mt-1">$0.01 / call</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <div className="font-semibold">Analyst</div>
              <div className="text-xs text-muted-foreground mt-1">Buys data, sells analysis</div>
              <div className="text-xs text-emerald-400 mt-1">$0.05 / call</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <div className="font-semibold">Research Buyer</div>
              <div className="text-xs text-muted-foreground mt-1">Buys analysis reports</div>
              <div className="text-xs text-red-400 mt-1">$0.50 budget</div>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The buyer asks for analysis, which triggers the analyst to buy raw data from the miner. Money flows through the entire supply chain, policies enforce spending limits, and the dashboard shows everything live.
          </p>
          <CodeBlock title="Run the full demo">{`cd demo
npx tsx seed.ts        # Seed economy data
npx tsx run-economy.ts # Start all 3 agents + run transactions`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Integrations */}
        <SectionAnchor id="integrations">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Integrations</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis integrates with 10 partner protocols. Each has a dedicated docs page with use cases, code examples, setup guides, and hackathon ideas.
          </p>

          {/* Payments & Signing */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payments &amp; Signing</h3>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <Link href="/docs/solana" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-violet-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <h4 className="font-semibold text-sm">Solana</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">On-chain payments, receipt anchoring, balance monitoring</p>
              <span className="text-xs text-violet-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/stellar" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-sky-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <h4 className="font-semibold text-sm">Stellar</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Native XLM/USDC payments, cross-border path payments, receipt anchoring, federation</p>
              <span className="text-xs text-sky-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/ripple" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h4 className="font-semibold text-sm">Ripple XRPL</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">XRP balances, trust line tokens, WebSocket real-time queries</p>
              <span className="text-xs text-blue-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/evm" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h4 className="font-semibold text-sm">EVM Chains</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Native payments on Ethereum, Base, Polygon, Arbitrum, Optimism with auto-chain selection</p>
              <span className="text-xs text-indigo-400 group-hover:underline">View docs &rarr;</span>
            </Link>
          </div>

          {/* Data & Analytics */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Data &amp; Analytics</h3>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <Link href="/docs/zerion" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-amber-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="font-semibold text-sm">Zerion</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Multi-chain portfolio tracking, DeFi positions, USD valuations</p>
              <span className="text-xs text-amber-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/uniblock" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-orange-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <h4 className="font-semibold text-sm">Uniblock</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Unified EVM token balances across Ethereum, Base, Polygon, Arbitrum</p>
              <span className="text-xs text-orange-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/allium" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-red-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h4 className="font-semibold text-sm">Allium</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">On-chain transaction verification, batch settlement, analytics</p>
              <span className="text-xs text-red-400 group-hover:underline">View docs &rarr;</span>
            </Link>
          </div>

          {/* Infrastructure */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Infrastructure</h3>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <Link href="/docs/ows" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold text-sm">OWS</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Multi-chain wallet management, key derivation, in-process signing</p>
              <span className="text-xs text-emerald-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/xmtp" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold text-sm">XMTP</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Agent-to-agent messaging, service discovery, 12 message types</p>
              <span className="text-xs text-emerald-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/moonpay" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-purple-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <h4 className="font-semibold text-sm">MoonPay</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Fiat on-ramp for funding agent wallets with credit card or bank</p>
              <span className="text-xs text-purple-400 group-hover:underline">View docs &rarr;</span>
            </Link>
          </div>

          {/* Guides */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Guides</h3>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <Link href="/docs/live-run" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold text-sm">$50 Live Run</h4>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 ml-auto">Live</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">We deployed 3 AI agents with $50 real mainnet money. Real tx hashes, real P&amp;L, real chaos.</p>
              <span className="text-xs text-emerald-400 group-hover:underline">View docs &rarr;</span>
            </Link>
            <Link href="/docs/interop" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <h4 className="font-semibold text-sm">Open Agent Interop</h4>
                <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400 ml-auto">Open</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Any HTTP agent can call Aegis endpoints. No SDK required. x402 protocol, 3 integration tiers.</p>
              <span className="text-xs text-cyan-400 group-hover:underline">View docs &rarr;</span>
            </Link>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* For Developers */}
        <SectionAnchor id="for-developers">
          <h2 className="text-2xl font-bold tracking-tight mb-4">For Developers</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis is a TypeScript monorepo with four packages. Here&apos;s how it&apos;s organized:
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden text-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">Package</th>
                  <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">What it does</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">@aegis-ows/gate</td><td className="px-4 py-2">Express middleware for x402 payments + client helper</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">@aegis-ows/policies</td><td className="px-4 py-2">Three OWS policy executables (budget, guard, deadswitch)</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">@aegis-ows/cli</td><td className="px-4 py-2">Command-line tools for setup, monitoring, and management</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs text-foreground">@aegis-ows/shared</td><td className="px-4 py-2">Shared types, file I/O helpers, and computation functions</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-sm mt-4">
            The dashboard is a standalone Next.js app that reads from the same data files. All data lives as JSON in a local directory &mdash; no database required. See the <a href="https://github.com/rajkaria/aegis" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">GitHub repo</a> for full source code and contributing guide.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Management Dashboard */}
        <SectionAnchor id="manage-dashboard">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Management Dashboard</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">/dashboard/manage</code> page is a browser-based control center for the full agent lifecycle. Everything the CLI does is available from the UI.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Create Wallets</h4>
              <p className="text-xs text-muted-foreground mt-1">Provision new OWS wallets with derived addresses across all supported chains.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Register Policies</h4>
              <p className="text-xs text-muted-foreground mt-1">Register built-in or custom policy executables with the OWS runtime.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Fund Agents</h4>
              <p className="text-xs text-muted-foreground mt-1">Request Solana devnet airdrops to fund agent wallets for testing.</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h4 className="font-semibold text-sm text-emerald-400">Send Payments</h4>
              <p className="text-xs text-muted-foreground mt-1">Send real SOL between agent wallets on Solana devnet via OWS signing. Transactions are verifiable on Solana Explorer.</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            The manage page also supports creating API keys bound to specific wallets and policies, and creating custom policy executables. All operations call a single <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">POST /api/manage</code> endpoint.
          </p>
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm text-muted-foreground mt-4">
            <a href="/dashboard/manage" className="text-emerald-400 hover:text-emerald-300 font-medium">Open the Control Center &rarr;</a>
            {" "}to create wallets, register policies, and send real on-chain payments.
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Solana On-Chain Payments */}
        <SectionAnchor id="solana-payments">
          <h2 className="text-2xl font-bold mt-16 mb-6">Solana On-Chain Payments</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Aegis supports real on-chain Solana transfers for agent-to-agent payments. When an x402 payment targets a Solana address,{" "}
            <code className="font-mono text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">payAndFetch</code> automatically builds and submits a SOL transfer transaction via the OWS signing SDK.
            Each transaction is recorded on Solana devnet and linked directly from the activity feed in the dashboard.
          </p>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">How It Works</h3>
            <CodeBlock title="packages/gate/src/solana-pay.ts">{`import { sendSolPayment } from "@aegis-ows/gate/solana-pay";

// Called automatically inside payAndFetch when network is Solana
const txHash = await sendSolPayment(
  "research-buyer",              // OWS wallet name
  "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL", // analyst's address
  0.005                          // amount in SOL
);
// Returns a real Solana devnet tx hash, e.g.:
// "JEX7PjWZLia2NpRVS...kwqb5GA"`}
            </CodeBlock>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Real Devnet Transactions</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              The demo economy ran 3 supply chain cycles on Solana devnet. Each cycle produced 2 real on-chain transfers:
              research-buyer → analyst (0.005 SOL) and analyst → data-miner (0.001 SOL).
              All transactions are viewable on Solana Explorer with <code className="font-mono text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">?cluster=devnet</code>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Explorer</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2">research-buyer</td><td className="px-4 py-2">analyst</td><td className="px-4 py-2 font-mono">0.005 SOL</td><td className="px-4 py-2"><a href="https://explorer.solana.com/tx/JEX7PjWZLia2NpRVSZGFBUvhqP6cqXMWv5NKXHf2JjZZxkim8Ni5wuiVziNmdLwo4kBLVV7pGM1X3cnhywqb5GA?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono text-xs">JEX7...b5GA</a></td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2">analyst</td><td className="px-4 py-2">data-miner</td><td className="px-4 py-2 font-mono">0.001 SOL</td><td className="px-4 py-2"><a href="https://explorer.solana.com/tx/zBARyaWkhfedVrnXEWB9LzGCERwWfkeXm5Fk3GuFJ1fuW2JBxiUDHmHC7NQF3Jz26C9nBJAy5EFDdCkv7iLGB7V?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono text-xs">zBAR...GB7V</a></td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2">research-buyer</td><td className="px-4 py-2">analyst</td><td className="px-4 py-2 font-mono">0.005 SOL</td><td className="px-4 py-2"><a href="https://explorer.solana.com/tx/5tsNpRhnaksJ5BXUdjNMfDA7oZUWAy1YXJB1AAbTcHCz7gqj8pGHKuFheuqGb4j1g2jvdncgX87PMrbEe3WKCXbj?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono text-xs">5tsN...Xbj</a></td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2">analyst</td><td className="px-4 py-2">data-miner</td><td className="px-4 py-2 font-mono">0.001 SOL</td><td className="px-4 py-2"><a href="https://explorer.solana.com/tx/QyxHktA6QsaNGVYFepaqRgipquAiSPL7bwh73fHMBAE1mqfFDwvUopf3tJkSAq8cEW7Ary7yENQ4T3JxyjhCSxN?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono text-xs">QyxH...xN</a></td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2">research-buyer</td><td className="px-4 py-2">analyst</td><td className="px-4 py-2 font-mono">0.005 SOL</td><td className="px-4 py-2"><a href="https://explorer.solana.com/tx/sGwQzNQAD2zfJ3JLhinjAoNHzQGHMwZ72UYw6XWxufrhaypSrdtPbmHdXtVc9qb58mNJKJNE9A6zHf1gTo2Mmby?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono text-xs">sGwQ...Mby</a></td></tr>
                  <tr><td className="px-4 py-2">analyst</td><td className="px-4 py-2">data-miner</td><td className="px-4 py-2 font-mono">0.001 SOL</td><td className="px-4 py-2"><a href="https://explorer.solana.com/tx/3QVCwpJJoKgkQZc4fp5G3FrnHY5HqrRANtiMCRVGwjbkDnWXKgxcGDDcZkknqwPr1UdXdhEVz2gKh8hjyvHVu4eW?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono text-xs">3QVC...u4eW</a></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Configuration Options</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Option</th>
                    <th className="px-4 py-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">network: "solana:devnet"</td><td className="px-4 py-2">Triggers on-chain Solana transfer in payAndFetch</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-foreground">payTo: &lt;44-char base58&gt;</td><td className="px-4 py-2">Solana address automatically triggers SOL payment</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs text-foreground">txHash in ledger entries</td><td className="px-4 py-2">Stored in both budget-ledger.json and earnings-ledger.json; shown as Explorer links in the activity feed</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Custom Policies */}
        <SectionAnchor id="custom-policies">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Custom Policies</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Beyond the three built-in policies, Aegis supports creating custom policy executables. A custom policy is any script that reads a <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyContext</code> from stdin and writes a <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyResult</code> to stdout.
          </p>

          <h3 className="text-lg font-semibold mb-3">Creating a Custom Policy</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Use the Management Dashboard or the API to register a custom policy. Provide a policy ID, name, the path to your executable, and the action (deny or warn).
          </p>
          <CodeBlock title="Custom policy JSON">{`{
  "id": "my-rate-limiter",
  "name": "Rate Limiter Policy",
  "version": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "rules": [],
  "executable": "/usr/local/bin/my-rate-limiter",
  "config": null,
  "action": "deny"
}`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Via the API</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Send a POST request to <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">/api/manage</code> with the <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">register_custom_policy</code> action:
          </p>
          <CodeBlock title="POST /api/manage">{`{
  "action": "register_custom_policy",
  "id": "my-rate-limiter",
  "name": "Rate Limiter Policy",
  "executable": "/usr/local/bin/my-rate-limiter",
  "policyAction": "deny"
}`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Policy Interface</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your executable must follow the OWS policy interface. It receives a JSON <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyContext</code> on stdin and must print a JSON <code className="text-sm bg-white/[0.06] px-1.5 py-0.5 rounded">PolicyResult</code> to stdout:
          </p>
          <CodeBlock title="PolicyResult format">{`// Allow the transaction
{ "decision": "allow" }

// Block the transaction
{ "decision": "deny", "reason": "Rate limit exceeded" }

// Warn but allow
{ "decision": "warn", "reason": "Approaching rate limit" }`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="manage-ui">
          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Dashboard</Badge>
              <h3 className="text-2xl font-bold">Manage UI</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                The <code className="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">/dashboard/manage</code> page provides a browser-based control panel for everything the CLI can do. It requires OWS installed locally &mdash; on Vercel, wallet operations are view-only.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Sections</h4>
              <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Section</th>
                    <th className="px-4 py-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">Create Agent Wallet</td><td className="px-4 py-2">Creates an OWS wallet with addresses across all chains</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">Register Policy</td><td className="px-4 py-2">Registers aegis-budget, aegis-guard, or aegis-deadswitch with OWS</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">Custom Policy</td><td className="px-4 py-2">Creates and registers a custom policy executable with OWS</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">Create API Key</td><td className="px-4 py-2">Generates an API key bound to wallets and policies</td></tr>
                  <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">Fund Agent (Devnet)</td><td className="px-4 py-2">Requests a Solana devnet airdrop to an agent address</td></tr>
                  <tr><td className="px-4 py-2 font-semibold text-foreground">Send Payment</td><td className="px-4 py-2">Sends SOL between agents via OWS signing on devnet</td></tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold">API Route</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All manage actions go through a single <code className="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">POST /api/manage</code> endpoint. Send a JSON body with an <code className="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">action</code> field to select the operation.
              </p>
              <CodeBlock title="POST /api/manage">{`// Create a wallet
{ "action": "create_wallet", "name": "my-agent" }

// Fund on devnet
{ "action": "fund_solana", "address": "<base58>", "amount": "1" }

// Send SOL via OWS
{ "action": "send_sol",
  "fromAddress": "<base58>", "toAddress": "<base58>",
  "fromWallet": "data-miner", "amount": "0.1" }`}</CodeBlock>
            </div>
          </div>
        </SectionAnchor>

        {/* MCP Server */}
        <SectionAnchor id="mcp-server">
          <div className="mt-20 space-y-6">
            <div>
              <Badge variant="outline" className="mb-3 text-[10px]">MCP</Badge>
              <h2 className="text-2xl font-bold tracking-tight">MCP Server</h2>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                The Aegis MCP server lets Claude Code, Cursor, and other MCP clients interact with your agent economy directly. Query agent P&amp;L, check budgets, discover services, and review policy logs without leaving your editor.
              </p>
            </div>
            <h3 className="text-lg font-semibold">Setup</h3>
            <CodeBlock title="Build the MCP server">{`cd packages/mcp-server
npm install && npx tsc`}</CodeBlock>
            <p className="text-sm text-muted-foreground">Add to your Claude Code or Cursor MCP config:</p>
            <CodeBlock title="~/.claude/settings.json or .mcp.json">{`{
  "mcpServers": {
    "aegis": {
      "command": "node",
      "args": ["/path/to/aegis/packages/mcp-server/dist/index.js"]
    }
  }
}`}</CodeBlock>
            <h3 className="text-lg font-semibold mt-6">Available Tools</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/[0.06] rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-4 py-2 font-medium">Tool</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.06]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">aegis_economy_status</td><td className="px-4 py-2">Full economy overview: total flow, agent P&amp;L, policy stats</td></tr>
                  <tr className="border-b border-white/[0.06]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">aegis_check_budget</td><td className="px-4 py-2">Remaining budget for an agent by period</td></tr>
                  <tr className="border-b border-white/[0.06]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">aegis_list_agents</td><td className="px-4 py-2">All agents with wallet addresses and P&amp;L</td></tr>
                  <tr className="border-b border-white/[0.06]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">aegis_policy_log</td><td className="px-4 py-2">Recent policy enforcement events</td></tr>
                  <tr className="border-b border-white/[0.06]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">aegis_discover_services</td><td className="px-4 py-2">Search for available services on the XMTP message bus</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs text-emerald-400">aegis_send_payment</td><td className="px-4 py-2">Prepare a SOL payment between agents on devnet</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionAnchor>

        {/* Live x402 Endpoints */}
        <SectionAnchor id="x402-endpoints">
          <div className="mt-20 space-y-6">
            <div>
              <Badge variant="outline" className="mb-3 text-[10px]">x402</Badge>
              <h2 className="text-2xl font-bold tracking-tight">Live x402 Endpoints</h2>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                The dashboard hosts real x402-compliant API endpoints. Any client (including <code className="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">ows pay</code>) that hits these routes gets a 402 response with payment details. After paying, the endpoint returns the paid content.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/[0.06] rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-4 py-2 font-medium">Endpoint</th>
                    <th className="text-left px-4 py-2 font-medium">Price</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.06]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">/api/x402/scrape</td><td className="px-4 py-2">0.001 SOL</td><td className="px-4 py-2">Web scraping service</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs text-emerald-400">/api/x402/analyze</td><td className="px-4 py-2">0.005 SOL</td><td className="px-4 py-2">Data analysis service</td></tr>
                </tbody>
              </table>
            </div>
            <CodeBlock title="Try it — unpaid request returns 402">{`curl -s https://your-app.vercel.app/api/x402/scrape | jq
# Returns: { x402Version: 1, payTo: "...", price: "0.001", token: "SOL", ... }`}</CodeBlock>
            <CodeBlock title="Paid request with X-PAYMENT header">{`curl -s https://your-app.vercel.app/api/x402/scrape \\
  -H 'X-PAYMENT: {"txHash":"abc123...","token":"SOL","fromAgent":"my-agent","timestamp":"2025-01-01T00:00:00Z"}' | jq
# Returns: { success: true, data: { title: "Live x402 Response from Aegis", ... } }`}</CodeBlock>
            <p className="text-sm text-muted-foreground">
              Payment verification includes timestamp freshness (5-minute window) and transaction hash validation. Expired or invalid payments are rejected with a 401.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Security */}
        <SectionAnchor id="security">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis is built with production-grade security at every layer. Here are the protections that keep your agent economy safe.
          </p>

          <div className="space-y-4 mb-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-emerald-400 mb-2">EIP-712 Signature Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Payment authorizations use EIP-712 typed data signatures. Gate recovers the signer&apos;s address and verifies it matches the sender&apos;s OWS wallet, ensuring payments cannot be forged.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-sky-400 mb-2">Chain-Agnostic Settlement Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                On-chain verification supports Solana (devnet and mainnet) and EVM chains including Ethereum, Base, Polygon, and Arbitrum. Gate confirms the payment transaction actually landed on-chain before granting access.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-violet-400 mb-2">Rate Limiting</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                402 payment challenge responses are rate-limited to 100 per minute per IP address. This prevents bad actors from spamming your endpoints with unpaid requests.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-emerald-400 mb-2">Webhook Alerting</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set the <code className="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">AEGIS_WEBHOOK_URL</code> environment variable to receive notifications whenever a policy blocks a transaction. Stay informed about enforcement events in real time.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-sky-400 mb-2">File Locking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Concurrent policy execution is safe via exclusive file locks with stale lock detection. Multiple agents can operate simultaneously without data corruption.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-violet-400 mb-2">Input Sanitization</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The management API validates all inputs to prevent command injection and other attacks. All user-provided data is sanitized before being passed to system commands.
              </p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Service Registry */}
        <SectionAnchor id="service-registry">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Service Registry</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            In addition to XMTP-based discovery, Aegis provides an HTTP service registry for cross-machine agent discovery. Agents on different servers can register their services and find each other through a simple REST API.
          </p>

          <div className="space-y-4 mb-6">
            <StepCard number="1" title="Register" description="An agent POSTs its service details (endpoint, price, description) to the registry when it starts up." />
            <StepCard number="2" title="Discover" description="Any agent can search the registry by keyword to find services matching its needs." />
            <StepCard number="3" title="Connect" description="The agent calls the discovered service URL directly and pays via x402." />
          </div>

          <CodeBlock title="Register a service">{`POST /api/registry
{
  "agentId": "my-agent",
  "endpoint": "/analyze",
  "price": "0.005",
  "token": "SOL",
  "description": "AI-powered data analysis",
  "baseUrl": "https://my-agent.example.com"
}`}</CodeBlock>

          <div className="mt-4">
            <CodeBlock title="Search for services">{`GET /api/registry?q=analysis
// Returns: { services: [...], total: 1 }`}</CodeBlock>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Endpoint</th>
                  <th className="px-4 py-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">GET</td><td className="px-4 py-2 font-mono text-xs">/api/registry</td><td className="px-4 py-2">List all services (optional <code className="text-xs bg-white/[0.06] px-1 rounded">?q=</code> filter)</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs text-emerald-400">POST</td><td className="px-4 py-2 font-mono text-xs">/api/registry</td><td className="px-4 py-2">Register or update a service</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Payment Receipts */}
        <SectionAnchor id="payment-receipts">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Payment Receipts</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every x402 payment generates a signed receipt with a SHA-256 hash. The hash is posted to Solana devnet as a transaction memo, making every payment auditable on-chain forever.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">How It Works</h3>
          <div className="space-y-4 mb-6">
            <StepCard number="1" title="Receipt Created" description="After every successful payment, a PaymentReceipt is created with a deterministic SHA-256 hash of the receipt data (id, timestamp, parties, amount, token, chain, endpoint)." />
            <StepCard number="2" title="Hash Anchored" description="The receipt hash is posted to Solana devnet as a memo transaction using the Memo program (MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr). The memo contains AEGIS_RECEIPT:<hash>." />
            <StepCard number="3" title="Proof Linked" description="The Solana transaction hash is linked back to the receipt, updating its status to 'anchored'. Anyone can verify the proof on Solana Explorer." />
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">Receipt Fields</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 font-medium">Field</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">id</td><td className="px-4 py-2">Unique receipt identifier</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">from / to</td><td className="px-4 py-2">Buyer and seller agent IDs</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">receiptHash</td><td className="px-4 py-2">SHA-256 hash of the receipt data</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">proofTxHash</td><td className="px-4 py-2">Solana transaction that anchors this receipt on-chain</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs text-emerald-400">status</td><td className="px-4 py-2">created | anchored | verified</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">API</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 font-medium">Method</th>
                  <th className="text-left px-4 py-2 font-medium">Route</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr><td className="px-4 py-2 font-mono text-xs text-emerald-400">GET</td><td className="px-4 py-2 font-mono text-xs">/api/receipts</td><td className="px-4 py-2">List all payment receipts with on-chain proof status</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">Programmatic Usage</h3>
          <CodeBlock title="packages/shared/src/receipts.ts">{`import { createReceipt, updateReceiptProof, getReceiptsByAgent } from "@aegis-ows/shared";

// Create a receipt after payment
const receipt = createReceipt({
  from: "research-buyer",
  to: "analyst",
  amount: "0.005",
  token: "SOL",
  chain: "solana:devnet",
  endpoint: "/analyze",
  paymentTxHash: "...",
});

// Anchor on Solana (done automatically by Gate)
import { anchorReceiptOnChain } from "@aegis-ows/gate/receipt-anchor";
const proofTx = await anchorReceiptOnChain("research-buyer", receipt.receiptHash);
if (proofTx) updateReceiptProof(receipt.id, proofTx);

// Query receipts for an agent
const myReceipts = getReceiptsByAgent("analyst");`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="economy-analytics">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Economy Analytics</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis includes a rule-based intelligence engine that generates insights about your agent economy. It detects patterns in spending, revenue, policy enforcement, and supply chain dynamics without requiring external API calls.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Insight Types</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 font-medium">Insight</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Economy Health</td><td className="px-4 py-2">Net flow analysis — is the economy self-sustaining?</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Top Earner</td><td className="px-4 py-2">Identifies highest-revenue agent and best-performing endpoint</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Budget Alert</td><td className="px-4 py-2">Warns when agents exceed 80% or 95% of daily budget limits</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Policy Enforcement</td><td className="px-4 py-2">Block rate analysis — are policies too restrictive?</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Supply Chain</td><td className="px-4 py-2">Buyer/intermediary/seller classification with margin analysis</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs text-emerald-400">Activity Trend</td><td className="px-4 py-2">24-hour transaction volume with day-over-day comparison</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">Access</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Insights appear in the dashboard&apos;s Economy Intelligence card and are also available via the MCP server tool <code className="bg-white/5 px-1 rounded">aegis_economy_insights</code>.
          </p>
          <CodeBlock title="MCP Tool">{`// Available as an MCP tool for any AI assistant
aegis_economy_insights
// Returns: Economy Intelligence Report with all detected patterns`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="multi-chain">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Multi-Chain Support</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis Gate and Policies work across all OWS-supported chains. The payment middleware supports different signing mechanisms per chain family.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Supported Chains</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2 font-medium">Chain</th>
                  <th className="text-left px-4 py-2 font-medium">Signing Method</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Solana</td><td className="px-4 py-2">On-chain SOL transfers</td><td className="px-4 py-2">Active (devnet)</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Ethereum</td><td className="px-4 py-2">EIP-712 signed authorizations</td><td className="px-4 py-2">Active</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Base</td><td className="px-4 py-2">EIP-712 signed authorizations</td><td className="px-4 py-2">Active</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Bitcoin</td><td className="px-4 py-2">signMessage proofs</td><td className="px-4 py-2">Ready</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Cosmos</td><td className="px-4 py-2">signMessage proofs</td><td className="px-4 py-2">Ready</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">Tron</td><td className="px-4 py-2">signMessage proofs</td><td className="px-4 py-2">Ready</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-mono text-xs text-emerald-400">TON</td><td className="px-4 py-2">signMessage proofs</td><td className="px-4 py-2">Ready</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs text-emerald-400">Sui</td><td className="px-4 py-2">signMessage proofs</td><td className="px-4 py-2">Ready</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">Usage</h3>
          <CodeBlock title="Multi-chain Gate configuration">{`// Set the network parameter to target any OWS chain
aegisGate({
  price: "0.01",
  token: "USDC",
  agentId: "my-agent",
  network: "eip155:8453",  // Base
  // network: "solana:devnet"  // Solana
  // network: "eip155:1"      // Ethereum mainnet
})`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* API Features */}
        <SectionAnchor id="api-features">
          <h2 className="text-2xl font-bold tracking-tight mb-4">API Features</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            All public API endpoints include production-ready features for reliability and integration.
          </p>

          <div className="grid gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold mb-2">Gate Operator Stats</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Every Gate instance tracks operator analytics: total 402 challenges served, successful payments, rejected payments, total revenue earned, and conversion rate. Access via the health endpoint.
              </p>
              <CodeBlock title="Health endpoint response">{`GET /health
{
  "status": "healthy",
  "stats": {
    "total402": 150,
    "totalPaid": 42,
    "totalRejected": 3,
    "totalRevenue": 0.042,
    "conversionRate": "28.0%"
  }
}`}</CodeBlock>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold mb-2">CORS Support</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All public API endpoints support cross-origin requests. The x402 endpoints, service registry, receipts, and analytics APIs accept requests from any origin with proper CORS headers including <code className="text-xs bg-white/[0.06] px-1 rounded">X-PAYMENT</code> and <code className="text-xs bg-white/[0.06] px-1 rounded">Authorization</code> headers.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-semibold mb-2">Pagination</h3>
              <p className="text-sm text-muted-foreground mb-3">
                List endpoints support pagination via <code className="text-xs bg-white/[0.06] px-1 rounded">?limit=N&amp;offset=N</code> query parameters. Responses include pagination metadata with total count, current offset, and a <code className="text-xs bg-white/[0.06] px-1 rounded">hasMore</code> flag.
              </p>
              <CodeBlock title="Paginated request">{`GET /api/receipts?limit=10&offset=0
{
  "receipts": [...],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}`}</CodeBlock>
              <p className="text-sm text-muted-foreground mt-3">
                Supported on: <code className="text-xs bg-white/[0.06] px-1 rounded">/api/receipts</code>, <code className="text-xs bg-white/[0.06] px-1 rounded">/api/registry</code>, <code className="text-xs bg-white/[0.06] px-1 rounded">/api/economy</code> (activity feed).
              </p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Agent Reputation */}
        <SectionAnchor id="agent-reputation">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Agent Reputation</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every agent in Aegis carries a 0–100 reputation score that reflects its trustworthiness as an economic actor. The score is computed continuously from payment history, policy compliance, and on-chain receipt verification.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Reputation Levels</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-left">Score Range</th>
                  <th className="px-4 py-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">New</td><td className="px-4 py-2">0 – 24</td><td className="px-4 py-2">Agent has no or minimal payment history</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-sky-400">Trusted</td><td className="px-4 py-2">25 – 49</td><td className="px-4 py-2">Consistent payment record with few policy violations</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-emerald-400">Verified</td><td className="px-4 py-2">50 – 74</td><td className="px-4 py-2">Strong history with on-chain receipt verification</td></tr>
                <tr><td className="px-4 py-2 font-semibold text-violet-400">Elite</td><td className="px-4 py-2">75 – 100</td><td className="px-4 py-2">Exemplary record — high volume, zero violations, anchored proofs</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">What Affects the Score</h3>
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
              <h4 className="font-semibold text-sm text-emerald-400 mb-2">Score Increases</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">+</span>Successful x402 payments sent or received</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">+</span>On-chain receipts anchored to Solana</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">+</span>Consistent policy compliance over time</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">+</span>High transaction volume and net positive P&amp;L</li>
              </ul>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4">
              <h4 className="font-semibold text-sm text-red-400 mb-2">Score Decreases</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">−</span>Policy violations (budget exceeded, guard blocked)</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">−</span>Extended inactivity triggering the deadswitch</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">−</span>Failed or rejected payment attempts</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">−</span>Unanchored receipts (payments not verified on-chain)</li>
              </ul>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">Where It Appears</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Reputation scores are visible in the P&amp;L table on the Economy Overview page and on each agent&apos;s detail page. The score is displayed as a badge (0–100) alongside the level label. Fleet Manager also shows average reputation across all agents as a fleet-wide metric.
          </p>
          <p className="text-muted-foreground text-sm">
            Agents can leverage reputation externally: a Gate server can choose to accept lower-cost payments from Elite agents, or require a minimum score before serving premium endpoints. The score is a signal your services can act on.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Agent Templates */}
        <SectionAnchor id="agent-templates">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Agent Templates</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The Agents page includes four pre-built agent configurations you can deploy with one click. Each template creates an OWS wallet, sets a suggested Gate price, and pre-fills the configuration so you can start earning immediately.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Built-in Templates</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Template</th>
                  <th className="px-4 py-3 text-left">Price / Call</th>
                  <th className="px-4 py-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">Data Scraper</td><td className="px-4 py-2 font-mono text-xs text-emerald-400">$0.001</td><td className="px-4 py-2">Fetches and structures web content for downstream agents</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">AI Analyzer</td><td className="px-4 py-2 font-mono text-xs text-emerald-400">$0.005</td><td className="px-4 py-2">Runs inference over data and returns structured insights</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="px-4 py-2 font-semibold text-foreground">Data Aggregator</td><td className="px-4 py-2 font-mono text-xs text-emerald-400">$0.010</td><td className="px-4 py-2">Combines multiple sources into a unified report</td></tr>
                <tr><td className="px-4 py-2 font-semibold text-foreground">Chain Monitor</td><td className="px-4 py-2 font-mono text-xs text-emerald-400">$0.002</td><td className="px-4 py-2">Watches on-chain events and alerts when conditions are met</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">One-Click Deploy</h3>
          <div className="space-y-4 mb-6">
            <StepCard number="1" title="Open the Agents page" description="Navigate to /dashboard/agents and click 'Add New Agent'." />
            <StepCard number="2" title="Select a template" description="Choose one of the four built-in templates from the template picker." />
            <StepCard number="3" title="Name your agent" description="Give it a unique wallet name — this becomes the OWS wallet identifier." />
            <StepCard number="4" title="Deploy" description="Click Deploy. An OWS wallet is created, the suggested Gate config is shown, and the agent appears in the fleet." />
          </div>

          <p className="text-muted-foreground text-sm">
            Each deployed agent starts with a New reputation score (0) that grows as it transacts. Templates are starting points — you can adjust Gate pricing and policies at any time from the Policy Control Center.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Fleet Manager */}
        <SectionAnchor id="fleet-manager">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Fleet Manager</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Fleet Manager is a dashboard section that gives operators a single-pane view of every agent in their fleet. Instead of drilling into individual agent pages, you see the whole picture at once — who is running, who is spending, and how the fleet is performing as a unit.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Fleet-Wide Stats</h3>
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Total Revenue</h4>
              <p className="text-xs text-muted-foreground mt-1">Sum of all earnings across every agent in the fleet.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Total Spending</h4>
              <p className="text-xs text-muted-foreground mt-1">Aggregate spend across all agents — useful for budget planning.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Net P&amp;L</h4>
              <p className="text-xs text-muted-foreground mt-1">Fleet-wide profit and loss: total revenue minus total spending.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-semibold text-sm">Avg Reputation</h4>
              <p className="text-xs text-muted-foreground mt-1">Mean reputation score across all agents, showing overall fleet trustworthiness.</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">Per-Agent Status Rows</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Below the fleet stats, each agent gets a compact status row showing:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground mb-6">
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 mt-1.5 shrink-0" />Live / Idle indicator based on recent transaction activity</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 mt-1.5 shrink-0" />Individual revenue and spending figures</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 mt-1.5 shrink-0" />Reputation score badge with level label</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 mt-1.5 shrink-0" />Mini budget bar showing consumption against the configured limit</li>
          </ul>

          <p className="text-muted-foreground text-sm">
            Fleet Manager is available in the Aegis Nexus dashboard and updates automatically as new transactions arrive. It is especially useful when operating many agents simultaneously — you can spot an agent approaching its budget limit or one that has gone idle without opening its detail page.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* XMTP Guide Link */}
        <SectionAnchor id="xmtp-guide">
          <h2 className="text-2xl font-bold tracking-tight mb-4">XMTP Agent Messaging</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Deep-dive into how Aegis uses XMTP for end-to-end agent communication. Covers use cases (marketplace, supply chains, fleet monitoring, trust networks), architecture, transport layer, all 12 message types, implementation guide, and a complete end-to-end example.
          </p>
          <Link href="/docs/xmtp" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors">
            Read the XMTP Guide &rarr;
          </Link>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Multi-Tenant Platform */}
        <SectionAnchor id="multi-tenant">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Multi-Tenant Platform</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis is a full multi-tenant platform. Each user gets their own isolated workspace with agents, wallets, transactions, and policies — all secured by Supabase Row-Level Security.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <FeatureCard icon="&#128274;" title="Supabase Auth" description="Email, Google, and GitHub OAuth login. Sessions managed via secure HTTP-only cookies with middleware protection." />
            <FeatureCard icon="&#128176;" title="Auto Wallets" description="Creating an agent auto-generates Solana + EVM keypairs. Private keys are AES-256-GCM encrypted server-side." />
            <FeatureCard icon="&#9889;" title="Real-Time" description="Supabase Realtime subscriptions push live updates to the dashboard — transactions, policy events, and agent status." />
            <FeatureCard icon="&#128736;" title="Demo Mode" description="Visit /dashboard?demo=true to explore with seed data, no login required. Perfect for evaluation." />
          </div>
        </SectionAnchor>

        <SectionAnchor id="auth">
          <h3 className="text-xl font-semibold mb-3">Authentication</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis uses Supabase Auth with three sign-in methods. The middleware protects all <code className="bg-white/5 px-1 rounded">/dashboard</code> routes and gracefully falls back when Supabase is not configured (local dev).
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06] text-left"><th className="py-2 pr-4 text-muted-foreground font-medium">Method</th><th className="py-2 pr-4 text-muted-foreground font-medium">Route</th><th className="py-2 text-muted-foreground font-medium">Details</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4">Email + Password</td><td className="py-2 pr-4 font-mono text-xs">/login, /signup</td><td className="py-2">Email confirmation required</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4">Google OAuth</td><td className="py-2 pr-4 font-mono text-xs">/auth/callback</td><td className="py-2">One-click sign-in</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4">GitHub OAuth</td><td className="py-2 pr-4 font-mono text-xs">/auth/callback</td><td className="py-2">Developer-friendly</td></tr>
              </tbody>
            </table>
          </div>

          <CodeBlock title="Environment Variables">{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="wallet-generation">
          <h3 className="text-xl font-semibold mb-3 mt-8">Wallet Generation</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you create an agent via the dashboard or API, Aegis auto-generates a Solana and EVM keypair. Private keys are encrypted with AES-256-GCM using a server-side Key Encryption Key (KEK) before storage.
          </p>

          <CodeBlock title="POST /api/agents">{`// Request
{ "name": "my-agent", "displayName": "My Agent" }

// Response (201)
{
  "agent": { "id": "uuid", "name": "my-agent", "status": "created" },
  "wallets": [
    { "chain": "solana", "address": "7xK...abc" },
    { "chain": "evm", "address": "0x1234...abcd" }
  ]
}`}</CodeBlock>

          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-300 font-medium mb-1">Required: WALLET_KEK</p>
            <p className="text-xs text-muted-foreground">
              Generate with <code className="bg-white/5 px-1 rounded">openssl rand -hex 32</code> and set as an environment variable. Without it, agent creation will fail.
            </p>
          </div>
        </SectionAnchor>

        <SectionAnchor id="realtime">
          <h3 className="text-xl font-semibold mb-3 mt-8">Real-Time Updates</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The dashboard subscribes to Supabase Realtime on four tables: <code className="bg-white/5 px-1 rounded">ledger_entries</code>, <code className="bg-white/5 px-1 rounded">earnings_entries</code>, <code className="bg-white/5 px-1 rounded">policy_log</code>, and <code className="bg-white/5 px-1 rounded">agents</code>. When a new row is inserted or updated, the dashboard auto-refreshes — no manual reload needed.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A green <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Realtime</span> badge appears in the dashboard header when the connection is active.
          </p>
        </SectionAnchor>

        <SectionAnchor id="data-layer">
          <h3 className="text-xl font-semibold mb-3 mt-8">Data Layer</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis uses a facade pattern for data access. When a user is authenticated, queries hit Supabase with RLS-scoped results. Without authentication (demo mode), bundled seed data is used.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06] text-left"><th className="py-2 pr-4 text-muted-foreground font-medium">Table</th><th className="py-2 pr-4 text-muted-foreground font-medium">Purpose</th><th className="py-2 text-muted-foreground font-medium">RLS</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs">profiles</td><td className="py-2 pr-4">User profiles (auto-created on signup)</td><td className="py-2">user_id = auth.uid()</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs">agents</td><td className="py-2 pr-4">User&apos;s agents with status + config</td><td className="py-2">user_id = auth.uid()</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs">wallets</td><td className="py-2 pr-4">Encrypted keypairs per agent per chain</td><td className="py-2">user_id = auth.uid()</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs">ledger_entries</td><td className="py-2 pr-4">Agent spending transactions</td><td className="py-2">user_id = auth.uid()</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs">earnings_entries</td><td className="py-2 pr-4">Agent revenue transactions</td><td className="py-2">user_id = auth.uid()</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs">policy_log</td><td className="py-2 pr-4">Policy enforcement events</td><td className="py-2">user_id = auth.uid()</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 font-mono text-xs">budget_configs</td><td className="py-2 pr-4">Per-agent budget limits</td><td className="py-2">user_id = auth.uid()</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Roadmap Link */}
        <SectionAnchor id="roadmap-link">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Roadmap</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            See the Aegis ecosystem vision, partner deepening plans, and prize allocation strategy for the OWS Hackathon.
          </p>
          <Link href="/roadmap" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sky-500/20 bg-sky-500/5 text-sm text-sky-400 hover:bg-sky-500/10 transition-colors">
            View Roadmap &rarr;
          </Link>
        </SectionAnchor>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center text-xs text-muted-foreground">
          <p>Built for the <a href="https://hackathon.openwallet.sh/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">OWS Hackathon</a> &mdash; MIT License</p>
        </div>
      </div>
    </div>
  );
}
