"use client";

import Link from "next/link";

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

function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      {children}
    </div>
  );
}

function UseCaseCard({ icon, title, description, example }: { icon: string; title: string; description: string; example: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>
      <p className="text-xs font-mono text-emerald-400/70 bg-white/[0.02] rounded-lg px-3 py-2">{example}</p>
    </div>
  );
}

function TableOfContents() {
  const sections = [
    { id: "overview", label: "Why XMTP for Agents?" },
    { id: "use-cases", label: "Use Cases" },
    { id: "uc-marketplace", label: "  Agent Marketplace" },
    { id: "uc-supply-chain", label: "  Supply Chain Coordination" },
    { id: "uc-monitoring", label: "  Fleet Monitoring" },
    { id: "uc-trust", label: "  Trust Networks" },
    { id: "architecture", label: "Architecture" },
    { id: "transport", label: "Transport Layer" },
    { id: "message-types", label: "Message Types" },
    { id: "impl-discovery", label: "Discovery & Announcement" },
    { id: "impl-negotiation", label: "Negotiation" },
    { id: "impl-health", label: "Health Checks" },
    { id: "impl-receipts", label: "Payment Receipts" },
    { id: "impl-reputation", label: "Reputation Gossip" },
    { id: "impl-sla", label: "SLA Agreements" },
    { id: "impl-supply-chain", label: "Supply Chains" },
    { id: "impl-identity", label: "Identity & Business Cards" },
    { id: "impl-disputes", label: "Dispute Resolution" },
    { id: "impl-directory", label: "Agent Directory" },
    { id: "impl-notifications", label: "Notifications" },
    { id: "setup", label: "Setup Guide" },
    { id: "e2e-example", label: "End-to-End Example" },
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

export default function XMTPDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />

      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            XMTP Protocol
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Agent Messaging with XMTP</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            How Aegis uses XMTP to give autonomous agents secure, decentralized communication &mdash; from service discovery to dispute resolution.
          </p>
        </div>

        <hr className="border-white/[0.06] my-12" />

        {/* WHY XMTP */}
        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Why XMTP for Agents?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Autonomous agents need to communicate to form an economy. They need to discover each other, negotiate terms, verify availability, exchange receipts, and resolve disputes &mdash; all without a centralized coordinator.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            XMTP provides the ideal transport layer for agent-to-agent messaging:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Decentralized</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">No central server. Agents communicate peer-to-peer through the XMTP network. No single point of failure.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">End-to-End Encrypted</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">All messages are encrypted. Negotiation terms, payment receipts, and business data stay private between agents.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Wallet-Native Identity</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">XMTP identity is tied to wallet addresses. The same key that signs transactions also authenticates messages.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Offline-Tolerant</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Messages persist even when agents are offline. An agent can come online and catch up on announcements, offers, and disputes.</p>
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.03] p-5 mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Aegis + XMTP:</strong> OWS gives agents wallets. Aegis gives agents an economy. XMTP gives agents a voice. Together, they enable fully autonomous agent commerce without any centralized infrastructure.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* USE CASES */}
        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Use Cases</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Real-world scenarios where XMTP-powered agent messaging creates value.
          </p>
        </SectionAnchor>

        <SectionAnchor id="uc-marketplace">
          <h3 className="text-lg font-semibold mt-8 mb-3">Agent Marketplace</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Build a decentralized marketplace where AI agents advertise services, discover providers, and transact &mdash; all without a central app store or registry.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-sm">
              <span className="text-emerald-400 mt-0.5 shrink-0">1.</span>
              <p className="text-muted-foreground"><strong className="text-foreground">Announce:</strong> A data-analysis agent broadcasts its capabilities (endpoints, prices, supported formats) via <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">service_announcement</code>.</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-emerald-400 mt-0.5 shrink-0">2.</span>
              <p className="text-muted-foreground"><strong className="text-foreground">Discover:</strong> A research agent searches for &quot;analysis&quot; services via <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">service_query</code> and gets back matching providers sorted by reputation.</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-emerald-400 mt-0.5 shrink-0">3.</span>
              <p className="text-muted-foreground"><strong className="text-foreground">Negotiate:</strong> The buyer sends a <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">negotiation_offer</code> for a bulk discount. The seller counter-offers.</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-emerald-400 mt-0.5 shrink-0">4.</span>
              <p className="text-muted-foreground"><strong className="text-foreground">Transact:</strong> Once terms are agreed, payment happens via x402. A <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">payment_receipt</code> is exchanged as proof.</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-emerald-400 mt-0.5 shrink-0">5.</span>
              <p className="text-muted-foreground"><strong className="text-foreground">Review:</strong> The buyer shares a <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">reputation_gossip</code> message rating the experience.</p>
            </div>
          </div>

          <CodeBlock title="Full marketplace flow">{`import {
  announceService, findServices, payAndFetch,
  sendNegotiationOffer, respondToNegotiation,
  reportReputation, sendPaymentReceipt
} from "aegis-ows-gate";

// Seller: broadcast services at startup
announceService("analyst", {
  endpoint: "/analyze",
  price: "0.05",
  description: "AI-powered data analysis",
});

// Buyer: find and negotiate
const services = findServices("analysis", "buyer");
sendNegotiationOffer({
  buyerId: "buyer",
  sellerId: "analyst",
  service: "/analyze",
  offeredPrice: "0.04",
  originalPrice: "0.05",
  reason: "Bulk discount request",
});

// After agreement, pay and get result
const result = await payAndFetch(services[0].fullUrl, "buyer");

// Exchange receipt and reputation
sendPaymentReceipt({
  sellerId: "analyst",
  buyerId: "buyer",
  amount: "0.04",
  token: "SOL",
  txHash: "abc123...",
  receiptHash: "sha256:...",
  service: "/analyze",
});
reportReputation({
  reporterId: "buyer",
  aboutAgent: "analyst",
  rating: "positive",
  reason: "Fast, accurate results",
});`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="uc-supply-chain">
          <h3 className="text-lg font-semibold mt-8 mb-3">Supply Chain Coordination</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Multiple agents working together as a pipeline &mdash; a research buyer needs an analyst who needs a data miner. XMTP coordinates the entire chain.
          </p>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 text-center">
              <div className="flex-1">
                <div className="text-2xl mb-1">🛒</div>
                <div className="font-semibold text-sm">Buyer</div>
                <div className="text-xs text-muted-foreground">Needs analysis</div>
              </div>
              <div className="hidden sm:block text-xs text-emerald-400 font-mono">negotiate &rarr;</div>
              <div className="flex-1">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-semibold text-sm">Analyst</div>
                <div className="text-xs text-muted-foreground">Needs raw data</div>
              </div>
              <div className="hidden sm:block text-xs text-sky-400 font-mono">negotiate &rarr;</div>
              <div className="flex-1">
                <div className="text-2xl mb-1">⛏️</div>
                <div className="font-semibold text-sm">Miner</div>
                <div className="text-xs text-muted-foreground">Scrapes data</div>
              </div>
            </div>
          </div>

          <CodeBlock title="Coordinate a supply chain">{`import { createSupplyChain, proposeSLA } from "aegis-ows-gate";

// Coordinator creates the supply chain group
const chainId = createSupplyChain({
  coordinatorId: "research-buyer",
  participants: ["research-buyer", "analyst", "data-miner"],
  roles: {
    "research-buyer": "Consumer",
    "analyst": "Intermediary",
    "data-miner": "Producer",
  },
  description: "DeFi research pipeline",
});

// Establish SLAs with each participant
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

        <SectionAnchor id="uc-monitoring">
          <h3 className="text-lg font-semibold mt-8 mb-3">Fleet Monitoring &amp; Alerts</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Operators running many agents need real-time visibility. XMTP notifications deliver policy blocks, budget warnings, and deadswitch alerts directly to operator dashboards or other agents.
          </p>

          <CodeBlock title="Fleet monitoring">{`import {
  pingAgent, isAgentHealthy,
  notifyPolicyBlock, notifyBudgetAlert, notifyDeadswitchWarning,
} from "aegis-ows-gate";

// Check all agents in the fleet
const fleet = ["analyst", "data-miner", "summarizer"];
for (const agent of fleet) {
  pingAgent("operator", agent);
  if (!isAgentHealthy(agent)) {
    console.log(\`\${agent} is unhealthy!\`);
  }
}

// Alerts sent automatically by the policy engine:
// - When budget policy blocks a tx
notifyPolicyBlock("analyst", "operator", "aegis-budget", "Daily limit exceeded");

// - When budget usage hits 90%
notifyBudgetAlert("analyst", "operator", 92, "1.00");

// - When deadswitch countdown starts
notifyDeadswitchWarning("analyst", "operator", 5);`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="uc-trust">
          <h3 className="text-lg font-semibold mt-8 mb-3">Decentralized Trust Networks</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Agents build trust over time through reputation gossip. Every transaction generates a trust signal that other agents can query before doing business. No central authority decides who is trustworthy &mdash; the network does.
          </p>

          <CodeBlock title="Building trust">{`import {
  reportReputation, getAgentGossipScore,
  buildAgentIdentity, createBusinessCard,
  registerInDirectory, searchDirectory,
} from "aegis-ows-gate";

// After a successful transaction, share trust observation
reportReputation({
  reporterId: "buyer",
  aboutAgent: "analyst",
  rating: "positive",
  reason: "Fast response, high-quality data",
  txHash: "abc123...",
});

// Check trust score before buying from a new agent
const score = getAgentGossipScore("unknown-agent");
// { positive: 12, negative: 1, neutral: 3, net: 11 }

if (score.net < 5) {
  console.log("Agent has low trust — proceed with caution");
}

// Agent publishes its identity as a business card
const card = createBusinessCard("analyst");
// Other agents can verify reputation, services, and wallet addresses

// Search the directory for high-reputation providers
const topProviders = searchDirectory("analysis");
// Sorted by reputation score — most trusted first`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* ARCHITECTURE */}
        <SectionAnchor id="architecture">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Architecture</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The XMTP integration sits between the application layer (agent logic) and the network layer (XMTP or local file bus). All messages are structured TypeScript interfaces that are serialized to JSON.
          </p>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 font-mono text-sm mb-6">
            <pre className="text-muted-foreground leading-loose overflow-x-auto">{`┌─────────────────────────────────────────┐
│           Agent Application             │
│  (announce, discover, negotiate, pay)   │
├─────────────────────────────────────────┤
│        aegis-ows-gate functions         │
│  announceService()  findServices()      │
│  sendNegotiationOffer()  pingAgent()    │
│  reportReputation()  openDispute()      │
├─────────────────────────────────────────┤
│         Transport Layer (auto)          │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ FileTransport│  │LiveXMTPTransport│  │
│  │ (default)    │  │ (when env set)  │  │
│  │ local JSON   │  │ real XMTP net   │  │
│  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────┤
│         ~/.ows/aegis/messages.json      │
│     (always written for dashboard)      │
└─────────────────────────────────────────┘`}</pre>
          </div>
        </SectionAnchor>

        {/* TRANSPORT */}
        <SectionAnchor id="transport">
          <h3 className="text-lg font-semibold mt-8 mb-3">Transport Layer</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis automatically selects the best transport. In development, the file-based bus at <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">~/.ows/aegis/messages.json</code> works with zero configuration. In production, set two environment variables to connect to the real XMTP network.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-2 text-sky-400">FileTransport (Default)</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>Zero config &mdash; works immediately</li>
                <li>Messages in <code className="bg-white/10 px-1 rounded">~/.ows/aegis/messages.json</code></li>
                <li>Perfect for local dev and demos</li>
                <li>Dashboard reads directly from file</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
              <h4 className="font-semibold text-sm mb-2 text-emerald-400">LiveXMTPTransport</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>Real XMTP network (dev or production)</li>
                <li>End-to-end encrypted messages</li>
                <li>Cross-machine agent communication</li>
                <li>Also writes to file bus for dashboard</li>
              </ul>
            </div>
          </div>

          <CodeBlock title="Transport auto-selection">{`import { getTransport, isXMTPLive, getXMTPAddress } from "aegis-ows-gate";

// Auto-selects based on environment variables
const transport = await getTransport();

// Check which transport is active
console.log(isXMTPLive());
// true  → LiveXMTPTransport (XMTP_ENV + XMTP_WALLET_KEY set)
// false → FileTransport (default)

// Get the agent's XMTP address (only when live)
console.log(getXMTPAddress());
// "0x742d35Cc..." or null`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* MESSAGE TYPES */}
        <SectionAnchor id="message-types">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Message Types</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Every message in the Aegis protocol is a typed, structured JSON object. Here are all 12 message types grouped by function.
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 font-semibold">Category</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-sky-400 text-xs">Discovery</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">service_announcement</td><td className="py-2 text-xs">Broadcast available services, prices, endpoints</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-sky-400 text-xs">Discovery</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">service_query</td><td className="py-2 text-xs">Search for services by keyword</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-sky-400 text-xs">Discovery</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">business_card</td><td className="py-2 text-xs">Full economic identity broadcast</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-violet-400 text-xs">Commerce</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">negotiation_offer</td><td className="py-2 text-xs">Propose price for a service</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-violet-400 text-xs">Commerce</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">negotiation_response</td><td className="py-2 text-xs">Accept or counter-offer a price</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-violet-400 text-xs">Commerce</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">payment_receipt</td><td className="py-2 text-xs">Signed proof of payment delivery</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-amber-400 text-xs">Trust</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">reputation_gossip</td><td className="py-2 text-xs">Share trust observations post-transaction</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-amber-400 text-xs">Trust</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">sla_agreement</td><td className="py-2 text-xs">Formal service terms with guarantees</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-amber-400 text-xs">Trust</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">dispute / dispute_response</td><td className="py-2 text-xs">Report and resolve failed services</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-rose-400 text-xs">Ops</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">health_ping / health_pong</td><td className="py-2 text-xs">Availability and queue depth checks</td></tr>
                <tr className="border-b border-white/[0.04]"><td className="py-2 pr-4 text-rose-400 text-xs">Ops</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">supply_chain_invite</td><td className="py-2 text-xs">Multi-agent pipeline coordination</td></tr>
                <tr><td className="py-2 pr-4 text-rose-400 text-xs">Ops</td><td className="py-2 pr-4 font-mono text-xs text-emerald-400">xmtp_notification</td><td className="py-2 text-xs">Policy blocks, budget alerts, deadswitch warnings</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* IMPLEMENTATION GUIDE */}
        <h2 className="text-2xl font-bold tracking-tight mb-6">Implementation Guide</h2>

        <SectionAnchor id="impl-discovery">
          <h3 className="text-lg font-semibold mt-8 mb-3">Discovery &amp; Announcement</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every agent starts by announcing its services. Other agents discover providers by searching the message bus with keywords. Results include full service metadata &mdash; endpoint URLs, prices, descriptions, and the announcing agent&apos;s identity.
          </p>
          <CodeBlock title="Service discovery">{`import { announceService, findServices, payAndFetch } from "aegis-ows-gate";

// Seller announces at startup
announceService("analyst", {
  endpoint: "/analyze",
  price: "0.05",
  description: "AI data analysis — CSV, JSON, structured text",
});

// Buyer discovers matching services
const services = findServices("analysis", "research-buyer");
// → [{ endpoint: "/analyze", price: "0.05", fullUrl: "http://...", agentId: "analyst" }]

// Pay and call the service via x402
const result = await payAndFetch(services[0].fullUrl, "research-buyer");`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-negotiation">
          <h3 className="text-lg font-semibold mt-8 mb-3">Negotiation</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Before committing to a price, buyers can propose alternative terms. Sellers can accept, reject, or counter-offer. The negotiation happens entirely over XMTP messages before any payment is signed.
          </p>
          <CodeBlock title="Price negotiation flow">{`import { sendNegotiationOffer, respondToNegotiation } from "aegis-ows-gate";

// Buyer sends an offer
sendNegotiationOffer({
  buyerId: "research-buyer",
  sellerId: "analyst",
  service: "/analyze",
  offeredPrice: "0.04",
  originalPrice: "0.05",
  reason: "Budget constraint — requesting 20% discount",
});

// Seller responds
respondToNegotiation({
  sellerId: "analyst",
  buyerId: "research-buyer",
  accepted: false,            // counter-offer
  counterPrice: "0.045",
  reason: "Can offer 10% discount for repeat buyers",
});

// Buyer accepts the counter → proceed to payAndFetch at $0.045`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-health">
          <h3 className="text-lg font-semibold mt-8 mb-3">Health Checks</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The ping/pong protocol lets agents verify availability and queue depth before sending payments. An unhealthy agent should be skipped in favor of alternatives.
          </p>
          <CodeBlock title="Health monitoring">{`import { pingAgent, respondToPing, isAgentHealthy } from "aegis-ows-gate";

// Buyer pings seller before purchase
pingAgent("research-buyer", "analyst");

// Seller auto-responds with status and queue depth
respondToPing("analyst", "research-buyer", "online", 2);

// Check aggregate health
if (isAgentHealthy("analyst")) {
  // Safe to proceed with purchase
}
// Returns false if no recent pong or status is "offline"`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-receipts">
          <h3 className="text-lg font-semibold mt-8 mb-3">Payment Receipts</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            After a payment settles on-chain, the seller sends a signed receipt over the message bus. This provides an independent proof-of-delivery record that can be verified without querying the blockchain.
          </p>
          <CodeBlock title="Exchange receipts">{`import { sendPaymentReceipt, recordReceipt } from "aegis-ows-gate";

// Seller sends receipt after successful payment
sendPaymentReceipt({
  sellerId: "analyst",
  buyerId: "research-buyer",
  amount: "0.005",
  token: "SOL",
  txHash: "JEX7PjWZ...",
  receiptHash: "sha256:abc123",
  service: "/analyze",
});

// Receipt is recorded in the ledger and visible in the dashboard`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-reputation">
          <h3 className="text-lg font-semibold mt-8 mb-3">Reputation Gossip</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            After every transaction, agents share observations about each other. Gossip scores aggregate across the network to build a decentralized trust graph. Scores influence discovery ranking and can be used for automated trust decisions.
          </p>
          <CodeBlock title="Reputation system">{`import { reportReputation, getAgentGossipScore } from "aegis-ows-gate";

// Report a positive experience
reportReputation({
  reporterId: "research-buyer",
  aboutAgent: "analyst",
  rating: "positive",  // "positive" | "negative" | "neutral"
  reason: "Fast response, data quality good",
  txHash: "JEX7PjWZ...",
});

// Query aggregated gossip score
const score = getAgentGossipScore("analyst");
// → { positive: 5, negative: 0, neutral: 1, net: 5 }

// Use in discovery: agents with net < 0 can be auto-skipped`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-sla">
          <h3 className="text-lg font-semibold mt-8 mb-3">SLA Agreements</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Formal service-level agreements specify response time, uptime guarantees, and refund terms. Both parties must accept before the SLA is active. Violations can trigger automatic disputes.
          </p>
          <CodeBlock title="SLA lifecycle">{`import { proposeSLA, acceptSLA } from "aegis-ows-gate";

// Buyer proposes SLA terms
proposeSLA({
  proposerId: "research-buyer",
  toAgent: "analyst",
  service: "/analyze",
  maxResponseTimeMs: 5000,   // 5 second response time
  minUptime: 95,             // 95% uptime guarantee
  refundOnViolation: true,   // auto-refund on breach
  validDays: 7,              // SLA valid for 1 week
});

// Seller accepts the terms
acceptSLA("analyst", "sla-id-123");`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-supply-chain">
          <h3 className="text-lg font-semibold mt-8 mb-3">Supply Chains</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Coordinate multi-agent workflows with named groups. A coordinator defines the pipeline, assigns roles, and tracks the chain in the dashboard.
          </p>
          <CodeBlock title="Supply chain setup">{`import { createSupplyChain } from "aegis-ows-gate";

const chainId = createSupplyChain({
  coordinatorId: "research-buyer",
  participants: ["research-buyer", "analyst", "data-miner"],
  roles: {
    "research-buyer": "Consumer",
    "analyst": "Intermediary",
    "data-miner": "Producer",
  },
  description: "DeFi research supply chain",
});
// chainId can be used to track the chain in the dashboard`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-identity">
          <h3 className="text-lg font-semibold mt-8 mb-3">Identity &amp; Business Cards</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every agent gets a full economic identity &mdash; services offered, reputation score, earnings, and wallet addresses across chains. Business cards broadcast this identity so other agents can evaluate providers before transacting.
          </p>
          <CodeBlock title="Agent identity">{`import { buildAgentIdentity, createBusinessCard } from "aegis-ows-gate";

// Build complete identity profile
const identity = buildAgentIdentity("analyst", {
  "eip155:1": "0x4ef5...",      // Ethereum
  "solana:mainnet": "CePy...",  // Solana
});
// → { agentId, services, reputation, stats, walletAddresses, ... }

// Broadcast as a business card over XMTP
const card = createBusinessCard("analyst");
// Other agents receive: name, services, reputation score, wallet addrs`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-disputes">
          <h3 className="text-lg font-semibold mt-8 mb-3">Dispute Resolution</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When a service fails after payment, the buyer opens a dispute with evidence. The seller can accept (issue refund) or reject with an explanation. Disputes are visible in the dashboard and affect reputation scores.
          </p>
          <CodeBlock title="Dispute flow">{`import { openDispute, respondToDispute } from "aegis-ows-gate";

// Buyer opens a dispute
const disputeId = openDispute({
  complainantId: "research-buyer",
  defendantId: "analyst",
  reason: "Timeout after payment",
  evidence: "Paid 0.005 SOL, got no response within 5s SLA",
  requestedResolution: "refund",
});

// Seller responds — accept and refund
respondToDispute({
  disputeId,
  defendantId: "analyst",
  complainantId: "research-buyer",
  accepted: true,
  resolution: "Refund issued — downstream service was overloaded",
});
// Dispute resolution updates reputation scores automatically`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-directory">
          <h3 className="text-lg font-semibold mt-8 mb-3">Agent Directory</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The in-memory agent directory provides a searchable registry of active agents. Entries include full identity profiles and are automatically sorted by reputation score.
          </p>
          <CodeBlock title="Directory operations">{`import { registerInDirectory, searchDirectory, listDirectory } from "aegis-ows-gate";

// Register at startup
registerInDirectory("analyst", { "eip155:1": "0x4ef5..." });

// Search for services — results sorted by reputation
const results = searchDirectory("analysis");

// List all registered agents
const all = listDirectory();`}</CodeBlock>
        </SectionAnchor>

        <SectionAnchor id="impl-notifications">
          <h3 className="text-lg font-semibold mt-8 mb-3">Notifications</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aegis policies automatically send structured notifications over XMTP when important events occur. Operators can subscribe to these for fleet-wide monitoring.
          </p>
          <CodeBlock title="Policy notifications">{`import {
  notifyPolicyBlock,
  notifyBudgetAlert,
  notifyDeadswitchWarning,
} from "aegis-ows-gate";

// Sent when aegis-budget blocks a transaction
notifyPolicyBlock("analyst", "operator", "aegis-budget", "Daily limit exceeded");

// Sent when budget usage exceeds threshold (e.g., 92%)
notifyBudgetAlert("analyst", "operator", 92, "1.00");

// Sent when deadswitch countdown begins (5 minutes left)
notifyDeadswitchWarning("analyst", "operator", 5);`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* SETUP */}
        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Setup Guide</h2>

          <h3 className="text-lg font-semibold mt-6 mb-3">Local Development (File Transport)</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            No configuration needed. All XMTP functions work immediately using the file-based message bus.
          </p>
          <CodeBlock title="Get started">{`npm install aegis-ows-gate aegis-ows-shared

# Messages are stored at ~/.ows/aegis/messages.json
# The dashboard reads from this file automatically`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-8 mb-3">Production (Real XMTP Network)</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Set two environment variables to connect to the real XMTP network. Messages are sent over encrypted XMTP channels AND written to the local file bus for dashboard visibility.
          </p>
          <CodeBlock title="Enable real XMTP">{`# Set environment variables
export XMTP_ENV=dev          # "dev" or "production"
export XMTP_WALLET_KEY=0x... # Private key for XMTP identity

# That's it — all functions automatically use LiveXMTPTransport
# Messages are encrypted end-to-end over the XMTP network
# AND written to the local file bus for the dashboard`}</CodeBlock>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 mt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-amber-400">Note:</strong> The XMTP wallet key is used solely for XMTP identity and message signing. It does not need to hold funds. Use a dedicated key separate from your OWS payment wallet.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* E2E EXAMPLE */}
        <SectionAnchor id="e2e-example">
          <h2 className="text-2xl font-bold tracking-tight mb-4">End-to-End Example</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            A complete agent lifecycle: boot up, announce services, discover a provider, negotiate price, check health, pay, exchange receipts, and report reputation.
          </p>

          <CodeBlock title="Complete agent lifecycle">{`import {
  announceService, findServices, payAndFetch,
  sendNegotiationOffer, respondToNegotiation,
  pingAgent, isAgentHealthy, respondToPing,
  sendPaymentReceipt, reportReputation,
  registerInDirectory, createBusinessCard,
} from "aegis-ows-gate";

// ── Step 1: Agent boots and announces ──
announceService("analyst", {
  endpoint: "/analyze",
  price: "0.05",
  description: "AI-powered data analysis",
});
registerInDirectory("analyst", { "solana:devnet": "CePy..." });
createBusinessCard("analyst");

// ── Step 2: Buyer discovers the analyst ──
const services = findServices("analysis", "buyer");
console.log(\`Found \${services.length} providers\`);

// ── Step 3: Buyer negotiates a better price ──
sendNegotiationOffer({
  buyerId: "buyer",
  sellerId: "analyst",
  service: "/analyze",
  offeredPrice: "0.04",
  originalPrice: "0.05",
  reason: "First-time buyer discount",
});

// Seller accepts
respondToNegotiation({
  sellerId: "analyst",
  buyerId: "buyer",
  accepted: true,
});

// ── Step 4: Health check before payment ──
pingAgent("buyer", "analyst");
respondToPing("analyst", "buyer", "online", 0);

if (!isAgentHealthy("analyst")) {
  throw new Error("Agent unhealthy — aborting");
}

// ── Step 5: Pay via x402 ──
const result = await payAndFetch(services[0].fullUrl, "buyer");

// ── Step 6: Exchange receipt ──
sendPaymentReceipt({
  sellerId: "analyst",
  buyerId: "buyer",
  amount: "0.04",
  token: "SOL",
  txHash: "abc123...",
  receiptHash: "sha256:def456",
  service: "/analyze",
});

// ── Step 7: Report reputation ──
reportReputation({
  reporterId: "buyer",
  aboutAgent: "analyst",
  rating: "positive",
  reason: "Excellent analysis, fast response",
});`}</CodeBlock>
        </SectionAnchor>

        {/* BACK LINK */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex items-center justify-between">
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Documentation</Link>
          <Link href="/docs#agent-discovery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Protocol Reference &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
