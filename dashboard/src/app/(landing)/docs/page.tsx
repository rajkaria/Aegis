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
    { id: "agent-discovery", label: "Agent Discovery" },
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

          <h3 className="text-lg font-semibold mt-8 mb-3">Protect an endpoint</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Add Gate as middleware on any Express route. Set the price and token &mdash; Gate handles the rest.
          </p>
          <CodeBlock title="One line to monetize">{`import { aegisGate } from "@aegis-ows/gate";

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
          <CodeBlock title="One line to pay">{`import { payAndFetch } from "@aegis-ows/gate";

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
          <h2 className="text-2xl font-bold tracking-tight mb-4">Agent Discovery</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Before an agent can buy a service, it needs to find one. Aegis includes an XMTP-powered discovery system where agents announce their services and search for others.
          </p>

          <div className="space-y-4 mb-6">
            <StepCard number="1" title="Announce" description="When an agent starts up, it broadcasts what services it offers (endpoints, prices, descriptions) to the message bus." />
            <StepCard number="2" title="Discover" description="An agent looking for a capability (like 'web scraping' or 'data analysis') searches the bus and finds matching services." />
            <StepCard number="3" title="Pay" description="The agent calls the discovered service URL and pays automatically via x402." />
          </div>

          <p className="text-muted-foreground leading-relaxed mb-4">
            All discovery activity shows up in the dashboard&apos;s XMTP feed, so you can see which agents are finding each other.
          </p>
          <CodeBlock title="Discovery in action">{`import { findServices, payAndFetch } from "@aegis-ows/gate";

// Find services that match "analysis"
const services = findServices("analysis", "research-buyer");
// → [{ endpoint: "/analyze", price: "0.05", fullUrl: "http://..." }]

// Pay and get the result
const result = await payAndFetch(services[0].fullUrl, "research-buyer");`}</CodeBlock>
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
            Aegis integrates with 8 partner tools to provide real on-chain data, cross-chain balances, transaction verification, on-chain payments, and agent funding.
          </p>
          <div className="grid gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">Solana Web3.js</h4>
                <Badge variant="outline" className="text-[9px] ml-auto">No API key</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Direct Solana RPC queries for SOL and SPL token balances (including USDC). Uses free public mainnet endpoints &mdash; no API key or signup required. Balances appear on each agent&apos;s profile page.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">Ripple XRPL</h4>
                <Badge variant="outline" className="text-[9px] ml-auto">No API key</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Real XRP Ledger balance queries via WebSocket RPC. Fetches XRP balances and trust line tokens directly from the validated ledger. No API key needed.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">Zerion API</h4>
              </div>
              <p className="text-sm text-muted-foreground">Rich multi-chain portfolio data for EVM wallets &mdash; token balances, DeFi positions, and USD valuations across Ethereum, Base, Polygon, and Arbitrum. Powers the wallet balance cards on agent profile pages.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">Uniblock</h4>
              </div>
              <p className="text-sm text-muted-foreground">Unified API aggregating 55+ blockchain data providers through a single endpoint. Used as a fallback and multi-chain RPC layer for fetching token balances across EVM chains when Zerion data is unavailable.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">Allium Explorer</h4>
              </div>
              <p className="text-sm text-muted-foreground">On-chain transaction verification via Allium&apos;s decoded blockchain data. When a payment flows through the economy, Aegis can verify it landed on-chain with block number, timestamp, and confirmation status.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">MoonPay</h4>
              </div>
              <p className="text-sm text-muted-foreground">Fiat on-ramp for agent wallets. When an agent&apos;s balance runs low, fund it via MoonPay CLI (<code className="text-[11px] bg-white/[0.06] px-1 rounded">mp buy</code>) or the web on-ramp. Supports USDC, ETH, and SOL on Ethereum, Base, Solana, and Polygon.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">XMTP</h4>
              </div>
              <p className="text-sm text-muted-foreground">Wallet-to-wallet messaging for agent service discovery. Agents announce their services and discover each other before paying via x402 &mdash; creating a decentralized service marketplace.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-semibold">Open Wallet Standard</h4>
              </div>
              <p className="text-sm text-muted-foreground">The foundation. All payments sign through OWS&apos;s secure enclave. Keys never leave the vault. Policies run natively in the OWS policy engine. Aegis is an OWS-first protocol.</p>
            </div>
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

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center text-xs text-muted-foreground">
          <p>Built for the <a href="https://hackathon.openwallet.sh/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">OWS Hackathon</a> &mdash; MIT License</p>
        </div>
      </div>
    </div>
  );
}
