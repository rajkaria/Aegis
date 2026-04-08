"use client";

import Link from "next/link";

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {title && <div className="px-4 py-2 border-b border-white/[0.06] text-xs font-mono text-muted-foreground">{title}</div>}
      <pre className="p-4 text-sm font-mono text-emerald-300/90 overflow-x-auto leading-relaxed"><code>{children}</code></pre>
    </div>
  );
}

function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return <div id={id} className="scroll-mt-24">{children}</div>;
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
    { id: "overview", label: "Why Allium for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses Allium For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "verify", label: "Transaction Verification" },
    { id: "batch", label: "Batch Verification" },
    { id: "balances", label: "Balance Queries" },
    { id: "chains", label: "Supported Chains" },
    { id: "setup", label: "Setup Guide" },
    { id: "hackathon", label: "Hackathon Ideas" },
    { id: "api-reference", label: "API Reference" },
  ];

  return (
    <nav className="hidden xl:block fixed left-[max(0px,calc(50%-42rem))] top-24 w-56 max-h-[calc(100vh-8rem)] overflow-y-auto text-xs space-y-0.5 pr-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="block py-1 text-muted-foreground hover:text-foreground transition-colors font-medium">{s.label}</a>
      ))}
    </nav>
  );
}

export default function AlliumDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />
      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
            Allium Realtime
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Allium Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            On-chain transaction verification, wallet analytics, and batch settlement checks &mdash; trust but verify every agent payment.
          </p>
        </div>

        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why Allium for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\u2705", title: "Transaction Verification", desc: "Confirm payments landed on-chain with block number and timestamp" },
              { icon: "\uD83D\uDD17", title: "6-Chain Support", desc: "Ethereum, Base, Polygon, Arbitrum, Optimism, and Solana" },
              { icon: "\uD83D\uDCE6", title: "Batch Verification", desc: "Verify multiple transactions in a single call" },
              { icon: "\uD83D\uDCB0", title: "USD-Priced Balances", desc: "Token balances with real-time USD pricing" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-xl mb-2">{f.icon}</div>
                <h4 className="font-semibold text-sm">{f.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="aegis-usage">
          <h2 className="text-2xl font-bold mb-4">What Aegis Uses Allium For</h2>
          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-red-400 mb-1">Payment Verification</h4>
              <p className="text-sm text-muted-foreground">Confirm agent-to-agent payments settled on-chain before granting API access via <code className="text-emerald-400 text-xs">verifyTransaction()</code>.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-red-400 mb-1">Wallet Balance Queries</h4>
              <p className="text-sm text-muted-foreground">Additional balance data source via <code className="text-emerald-400 text-xs">getAlliumBalances()</code> &mdash; deduped with Zerion and Uniblock.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-red-400 mb-1">Batch Settlement</h4>
              <p className="text-sm text-muted-foreground">Verify multiple payments at once for multi-agent supply chain workflows via <code className="text-emerald-400 text-xs">verifyTransactions()</code>.</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard icon="\u2705" title="Payment Verification" description="Confirm agent-to-agent payments settled on-chain before delivering data or granting API access." example='verifyTransaction(txHash, "eip155:8453")' />
            <UseCaseCard icon="\uD83D\uDCCB" title="Audit Trail" description="Verify historical transactions for compliance. Get block number, timestamp, and success status." example="status: confirmed, block: 12345678" />
            <UseCaseCard icon="\uD83D\uDD0D" title="Multi-Chain Analytics" description="Track agent activity across 6 chains. Identify patterns, verify settlements, detect anomalies." example="verifyTransactions([{tx1}, {tx2}, {tx3}])" />
            <UseCaseCard icon="\uD83D\uDCE6" title="Batch Settlement" description="Verify multiple payments in one call. Essential for supply chain workflows with cascading payments." example="buyer→analyst→miner: 3 tx verify" />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="verify">
          <h2 className="text-2xl font-bold mb-4">Transaction Verification</h2>
          <CodeBlock title="Verify a single transaction">{`import { verifyTransaction } from "@aegis-ows/integrations";

const result = await verifyTransaction(
  "0xabc123def456...",     // transaction hash
  "eip155:8453"            // chain ID (Base)
);

// Returns:
// {
//   txHash: "0xabc123def456...",
//   chain: "eip155:8453",
//   status: "confirmed",        // "confirmed" | "pending" | "not_found" | "error"
//   blockNumber: 12345678,
//   timestamp: "2024-01-15T10:30:00Z",
//   source: "allium-realtime"
// }`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            Uses POST <code className="text-emerald-400">/wallet/transactions</code> with a transaction_hash filter. Internally maps CAIP-2 chain IDs to Allium chain names.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="batch">
          <h2 className="text-2xl font-bold mb-4">Batch Verification</h2>
          <CodeBlock title="Verify multiple transactions at once">{`import { verifyTransactions } from "@aegis-ows/integrations";

const results = await verifyTransactions([
  { txHash: "0xabc...", chain: "eip155:1" },       // Ethereum
  { txHash: "0xdef...", chain: "eip155:8453" },     // Base
  { txHash: "0xghi...", chain: "solana:5eykt4..." } // Solana
]);

// Returns: TxVerification[] — one result per transaction
// All verified in parallel via Promise.all`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="balances">
          <h2 className="text-2xl font-bold mb-4">Balance Queries</h2>
          <CodeBlock title="Query wallet balances via Allium">{`import { getAlliumBalances } from "@aegis-ows/integrations";

const balances = await getAlliumBalances(
  "0x1234...",      // wallet address
  "eip155:1"        // chain ID (Ethereum)
);

// Returns: ChainBalance[] with USD pricing
// Handles raw balance + decimals conversion
// Filters dust balances (<0.0001)`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="chains">
          <h2 className="text-2xl font-bold mb-4">Supported Chains</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Chain</th>
                  <th className="text-left p-3 font-semibold">CAIP-2 ID</th>
                  <th className="text-left p-3 font-semibold">Allium Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3">Ethereum</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:1</td><td className="p-3 font-mono text-xs text-muted-foreground">ethereum</td></tr>
                <tr><td className="p-3">Base</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:8453</td><td className="p-3 font-mono text-xs text-muted-foreground">base</td></tr>
                <tr><td className="p-3">Polygon</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:137</td><td className="p-3 font-mono text-xs text-muted-foreground">polygon</td></tr>
                <tr><td className="p-3">Arbitrum</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:42161</td><td className="p-3 font-mono text-xs text-muted-foreground">arbitrum</td></tr>
                <tr><td className="p-3">Optimism</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:10</td><td className="p-3 font-mono text-xs text-muted-foreground">optimism</td></tr>
                <tr><td className="p-3">Solana</td><td className="p-3 font-mono text-xs text-emerald-400">solana:5eykt4...</td><td className="p-3 font-mono text-xs text-muted-foreground">solana</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          <CodeBlock title=".env">{`# Required — get from allium.so
ALLIUM_API_KEY=your_api_key_here`}</CodeBlock>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Config</th>
                  <th className="text-left p-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 text-muted-foreground">Auth</td><td className="p-3 font-mono text-xs text-emerald-400">X-API-Key header</td></tr>
                <tr><td className="p-3 text-muted-foreground">Base URL</td><td className="p-3 font-mono text-xs text-emerald-400">https://api.allium.so/api/v1/developer</td></tr>
                <tr><td className="p-3 text-muted-foreground">Env Var</td><td className="p-3 font-mono text-xs text-emerald-400">ALLIUM_API_KEY</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { track: "Data Track", idea: "On-chain analytics dashboard for AI agent economies with real-time verification", color: "red" },
              { track: "Compliance", idea: "Automated transaction auditing and reporting for regulated agent operations", color: "emerald" },
              { track: "Security", idea: "Real-time payment verification and fraud detection for agent marketplaces", color: "violet" },
              { track: "Analytics", idea: "Agent economy health monitoring with cross-chain settlement tracking", color: "sky" },
            ].map((h) => (
              <div key={h.track} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className={`text-xs font-semibold uppercase tracking-wider text-${h.color}-400 mb-2`}>{h.track}</p>
                <p className="text-sm text-muted-foreground">{h.idea}</p>
              </div>
            ))}
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="api-reference">
          <h2 className="text-2xl font-bold mb-4">API Reference</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Function</th>
                  <th className="text-left p-3 font-semibold">Parameters</th>
                  <th className="text-left p-3 font-semibold">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 font-mono text-xs text-emerald-400">verifyTransaction</td><td className="p-3 text-muted-foreground text-xs">txHash, chain</td><td className="p-3 text-muted-foreground text-xs">TxVerification</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">verifyTransactions</td><td className="p-3 text-muted-foreground text-xs">{'{txHash, chain}[]'}</td><td className="p-3 text-muted-foreground text-xs">TxVerification[]</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getAlliumBalances</td><td className="p-3 text-muted-foreground text-xs">walletAddress, chain</td><td className="p-3 text-muted-foreground text-xs">ChainBalance[]</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/moonpay" className="hover:text-foreground transition-colors">MoonPay &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
