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
    { id: "overview", label: "Why Uniblock for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses Uniblock For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "balances", label: "EVM Balance Query" },
    { id: "chains", label: "Supported Chains" },
    { id: "aggregation", label: "Multi-Source Aggregation" },
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

export default function UniblockDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />
      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-xs text-orange-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
            Uniblock API
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Uniblock Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Unified EVM token balance aggregation across Ethereum, Base, Polygon, and Arbitrum &mdash; one API for all chains.
          </p>
        </div>

        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why Uniblock for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\uD83D\uDD17", title: "Single API, All EVM Chains", desc: "One endpoint for Ethereum, Base, Polygon, Arbitrum" },
              { icon: "\uD83E\uDE99", title: "Token Balance Aggregation", desc: "Native + ERC-20 tokens across all supported chains" },
              { icon: "\uD83D\uDCB5", title: "USD Valuations", desc: "Real-time price data included in balance responses" },
              { icon: "\u26A1", title: "Fast Response Times", desc: "Optimized for real-time monitoring workflows" },
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
          <h2 className="text-2xl font-bold mb-4">What Aegis Uses Uniblock For</h2>
          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-orange-400 mb-1">EVM Token Balance Queries</h4>
              <p className="text-sm text-muted-foreground">Fetch native + ERC-20 token balances across 4 EVM chains in a single call via <code className="text-emerald-400 text-xs">getEvmBalances()</code>.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-orange-400 mb-1">Multi-Source Deduplication</h4>
              <p className="text-sm text-muted-foreground">Uniblock data is combined with Zerion and Allium. Aegis deduplicates by chain:token, keeping the highest USD value.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-orange-400 mb-1">Dashboard Display</h4>
              <p className="text-sm text-muted-foreground">Powers the wallet balance component in the Aegis dashboard (Nexus).</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard icon="\uD83D\uDCCA" title="Multi-Chain Balance Monitoring" description="Track agent EVM holdings across Ethereum, Base, Polygon, and Arbitrum from a single query." example="getEvmBalances(addr) → 4 chains" />
            <UseCaseCard icon="\uD83C\uDF10" title="Cross-Chain Agent Operations" description="Agents operating on multiple L2s need a unified view of their balances for decision-making." example="balances across Base + Arbitrum + Polygon" />
            <UseCaseCard icon="\uD83D\uDEE1\uFE0F" title="Budget Enforcement" description="Verify agent balances against spending policies before authorizing transactions." example="budget.check(totalUsdValue)" />
            <UseCaseCard icon="\uD83C\uDFED" title="Fleet Treasury View" description="Aggregate balances across all agent wallets for a complete fleet treasury overview." example="agents.map(a => getEvmBalances(a.addr))" />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="balances">
          <h2 className="text-2xl font-bold mb-4">EVM Balance Query</h2>
          <CodeBlock title="Query EVM token balances">{`import { getEvmBalances } from "@aegis-ows/integrations";

// Query across all default chains (Ethereum, Base, Polygon, Arbitrum)
const balances = await getEvmBalances("0x1234...");

// Or specify specific chains
const l2Only = await getEvmBalances("0x1234...", ["base", "arbitrum"]);

// Returns:
// [
//   { chain: "Base", chainId: "eip155:8453", token: "ETH",
//     balance: "0.500000", usdValue: "1500.00", source: "uniblock" },
//   { chain: "Base", chainId: "eip155:8453", token: "USDC",
//     balance: "100.000000", usdValue: "100.00", source: "uniblock" },
//   { chain: "Arbitrum", chainId: "eip155:42161", token: "ETH",
//     balance: "0.250000", usdValue: "750.00", source: "uniblock" }
// ]`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="font-semibold text-sm mb-2">How it works</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Iterates each target chain (default: ethereum, base, polygon, arbitrum)</li>
              <li>Calls <code className="text-emerald-400 text-xs">/token/balances?address=...&chain=...</code></li>
              <li>Filters dust balances (&lt;0.0001)</li>
              <li>Maps chain names and CAIP-2 chain IDs</li>
            </ol>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="chains">
          <h2 className="text-2xl font-bold mb-4">Supported Chains</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Chain</th>
                  <th className="text-left p-3 font-semibold">CAIP-2 Chain ID</th>
                  <th className="text-left p-3 font-semibold">Uniblock Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3">Ethereum</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:1</td><td className="p-3 font-mono text-xs text-muted-foreground">ethereum</td></tr>
                <tr><td className="p-3">Base</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:8453</td><td className="p-3 font-mono text-xs text-muted-foreground">base</td></tr>
                <tr><td className="p-3">Polygon</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:137</td><td className="p-3 font-mono text-xs text-muted-foreground">polygon</td></tr>
                <tr><td className="p-3">Arbitrum</td><td className="p-3 font-mono text-xs text-emerald-400">eip155:42161</td><td className="p-3 font-mono text-xs text-muted-foreground">arbitrum</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="aggregation">
          <h2 className="text-2xl font-bold mb-4">Multi-Source Aggregation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Uniblock is one of three EVM data sources Aegis queries in parallel. Results are deduplicated automatically.
          </p>
          <CodeBlock title="Unified balance query across all chains + sources">{`import { getAllBalances } from "@aegis-ows/integrations";

const balances = await getAllBalances({
  evm: "0x1234...",         // → Zerion + Uniblock + Allium (parallel)
  solana: "2G55...",        // → Solana RPC
  xrp: "rHb9...",           // → XRPL WebSocket
  stellar: "GBZX..."        // → Stellar Horizon
});

// Deduplication: same chain:token from multiple sources
// → keeps the entry with the highest USD value`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          <CodeBlock title=".env">{`# Required — get from uniblock.dev
UNIBLOCK_API_KEY=your_api_key_here`}</CodeBlock>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Config</th>
                  <th className="text-left p-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 text-muted-foreground">Auth</td><td className="p-3 font-mono text-xs text-emerald-400">x-api-key header</td></tr>
                <tr><td className="p-3 text-muted-foreground">Base URL</td><td className="p-3 font-mono text-xs text-emerald-400">https://api.uniblock.dev/v1</td></tr>
                <tr><td className="p-3 text-muted-foreground">Env Var</td><td className="p-3 font-mono text-xs text-emerald-400">UNIBLOCK_API_KEY</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { track: "Infrastructure Track", idea: "Universal balance API for AI agent fleets across all EVM chains", color: "orange" },
              { track: "Multi-Chain Track", idea: "Agents that optimize operations across L2s based on gas costs and balances", color: "emerald" },
              { track: "DeFi Track", idea: "Portfolio-aware trading agents with cross-chain position tracking", color: "violet" },
              { track: "Analytics", idea: "Cross-chain agent wealth tracking and treasury management dashboard", color: "sky" },
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
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getEvmBalances</td><td className="p-3 text-muted-foreground text-xs">walletAddress, chains?</td><td className="p-3 text-muted-foreground text-xs">ChainBalance[]</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/allium" className="hover:text-foreground transition-colors">Allium &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
