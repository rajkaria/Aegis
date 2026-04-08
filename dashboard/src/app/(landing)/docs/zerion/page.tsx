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
    { id: "overview", label: "Why Zerion for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses Zerion For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "portfolio", label: "Portfolio Query" },
    { id: "dedup", label: "Multi-Source Deduplication" },
    { id: "setup", label: "Setup Guide" },
    { id: "hackathon", label: "Hackathon Ideas" },
    { id: "api-reference", label: "API Reference" },
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

export default function ZerionDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />

      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            Zerion API
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Zerion Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Multi-chain portfolio tracking and DeFi position monitoring for AI agents &mdash; unified balances across 10+ EVM chains with real-time USD valuations.
          </p>
        </div>

        <hr className="border-white/[0.06] my-12" />

        {/* WHY ZERION */}
        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Why Zerion for Agents?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Autonomous agents operating across multiple blockchains need a unified view of their holdings. Querying each chain individually is slow, error-prone, and requires maintaining separate RPC connections. Zerion solves this with a single API call.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Zerion provides the ideal portfolio layer for agent wallets:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Unified Multi-Chain View</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">One API call returns balances across Ethereum, Base, Polygon, Arbitrum, Optimism, and more. No chain-by-chain queries.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Real-Time USD Valuations</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Every token balance comes with its current USD value. Agents can make spending decisions based on actual portfolio worth.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">10+ EVM Chains Supported</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Ethereum, Base, Polygon, Arbitrum, Optimism, Avalanche, BNB Chain, Fantom, zkSync, and more covered out of the box.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">DeFi Position Tracking</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Tracks lending, staking, LP positions, and yield farming. Agents see their full financial picture, not just token balances.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Automatic Dust Filtering</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Filters out sub-penny token positions automatically. Agents only see meaningful balances that matter for decision-making.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">REST API with Simple Auth</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Clean REST endpoints with Basic auth. No complex SDK setup, no WebSocket requirements. One API key, one HTTP call.</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* WHAT AEGIS USES ZERION FOR */}
        <SectionAnchor id="aegis-usage">
          <h2 className="text-2xl font-bold tracking-tight mb-4">What Aegis Uses Zerion For</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis integrates Zerion as one of three balance providers alongside Uniblock and Allium. Each provider covers different chains and use cases, with Zerion handling the EVM multi-chain aggregation layer.
          </p>

          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Multi-Chain EVM Portfolio Aggregation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zerion queries all EVM chains for a given agent wallet in a single call. This feeds into the unified balance view that powers budget enforcement and spending decisions.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">USD-Denominated Balance Tracking</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aegis budget policies operate in USD. Zerion provides real-time token-to-USD conversion so budget thresholds and spending limits work across any token on any chain.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-1.5">Dashboard Wallet Balance Display</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Aegis Nexus dashboard shows each agent&apos;s wallet balances. Zerion data populates the EVM balance cards with chain, token, amount, and USD value.
              </p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* USE CASES */}
        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard
              icon="📊"
              title="Agent Portfolio Dashboard"
              description="Build a complete view of agent holdings across all EVM chains. See every token, LP position, and staking balance in one place with live USD values."
              example="getZerionPortfolio(agentWallet) → unified balance card"
            />
            <UseCaseCard
              icon="🎯"
              title="Budget Monitoring"
              description="Track total agent portfolio value against spending limits. Automatically pause agents when their total holdings drop below the configured budget floor."
              example="totalUSD < budgetFloor → agent.pause()"
            />
            <UseCaseCard
              icon="⚡"
              title="Cross-Chain Arbitrage"
              description="Agents monitoring the same token across multiple chains can detect price discrepancies and act on arbitrage opportunities in real time."
              example="ETH on Base vs Arbitrum → price delta alert"
            />
            <UseCaseCard
              icon="🏦"
              title="Treasury Management"
              description="Aggregate balances across an entire fleet of agents. Track total organization value, identify idle capital, and rebalance across agents."
              example="fleet.map(getZerionPortfolio) → totalTreasury"
            />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* PORTFOLIO QUERY */}
        <SectionAnchor id="portfolio">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Portfolio Query</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The <code className="text-emerald-400/80 text-sm">getZerionPortfolio</code> function queries all positions for a wallet address and returns normalized balance objects.
          </p>

          <CodeBlock title="packages/integrations/src/zerion.ts">
{`import { getZerionPortfolio } from "@aegis-ows/integrations";

const balances = await getZerionPortfolio("0x1234...");
// Returns:
// [
//   {
//     chain: "Ethereum",
//     token: "ETH",
//     balance: "1.500000",
//     usdValue: "4500.00",
//     source: "zerion"
//   },
//   {
//     chain: "Base",
//     token: "USDC",
//     balance: "100.000000",
//     usdValue: "100.00",
//     source: "zerion"
//   }
// ]`}
          </CodeBlock>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-2">How It Works</h4>
              <ol className="text-xs text-muted-foreground leading-relaxed space-y-2 list-decimal list-inside">
                <li>Queries the Zerion <code className="text-emerald-400/70">/wallets/&#123;address&#125;/positions/</code> endpoint with Basic auth</li>
                <li>Filters out dust positions with USD value below $0.01</li>
                <li>Maps internal chain IDs (e.g. <code className="text-emerald-400/70">ethereum</code>, <code className="text-emerald-400/70">base</code>) to human-readable names</li>
                <li>Normalizes each position into the shared <code className="text-emerald-400/70">ChainBalance</code> type with chain, token, balance, usdValue, and source fields</li>
              </ol>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Note:</strong> Zerion covers EVM chains only. For Solana balances, Aegis uses Uniblock. For historical and indexed data, Aegis uses Allium. The <code className="text-emerald-400/70">getAllBalances</code> function combines all three sources automatically.
              </p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* MULTI-SOURCE DEDUP */}
        <SectionAnchor id="dedup">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Multi-Source Deduplication</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Aegis queries Zerion, Uniblock, and Allium in parallel and deduplicates the results. When multiple sources report the same token on the same chain, Aegis keeps the entry with the highest USD value (most recent price data).
          </p>

          <CodeBlock title="packages/integrations/src/balances.ts">
{`import { getAllBalances } from "@aegis-ows/integrations";

const balances = await getAllBalances({
  evm: "0x1234...",
  solana: "2G55...",
});
// Queries Zerion + Uniblock + Allium in parallel
// Deduplicates: keeps highest USD value per chain:token pair
// Returns unified ChainBalance[] across all chains`}
          </CodeBlock>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h4 className="font-semibold text-sm mb-3">Deduplication Strategy</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Source</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Chains Covered</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Primary Use</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 font-mono text-amber-400/80">Zerion</td>
                    <td className="py-2 pr-4">All EVM chains</td>
                    <td className="py-2">Real-time multi-chain EVM portfolio</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 font-mono text-blue-400/80">Uniblock</td>
                    <td className="py-2 pr-4">EVM + Solana</td>
                    <td className="py-2">Solana coverage, EVM fallback</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-purple-400/80">Allium</td>
                    <td className="py-2 pr-4">EVM + Solana</td>
                    <td className="py-2">Indexed historical data, analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* SETUP GUIDE */}
        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Setup Guide</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Getting Zerion working with Aegis requires a single environment variable. The integration handles auth encoding and endpoint configuration automatically.
          </p>

          <div className="space-y-4 mb-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-2">1. Get Your API Key</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                Sign up at <code className="text-emerald-400/70">zerion.io/developers</code> and create a new API key. Free tier is available for development and testing.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-2">2. Set the Environment Variable</h4>
              <CodeBlock title=".env">
{`ZERION_API_KEY=zk_dev_xxxxxxxxxxxxxxxx`}
              </CodeBlock>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sm mb-2">3. Auth Mechanism</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zerion uses Basic auth. The integration base64-encodes your API key with a trailing colon (<code className="text-emerald-400/70">key + &quot;:&quot;</code>) and sends it as the <code className="text-emerald-400/70">Authorization: Basic ...</code> header. You do not need to handle encoding yourself.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-6">
            <h4 className="font-semibold text-sm mb-3">Configuration Reference</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Variable</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Required</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-emerald-400/80">ZERION_API_KEY</td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2">Your Zerion developer API key from zerion.io/developers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h4 className="font-semibold text-sm mb-3">Supported Chains</h4>
            <div className="flex flex-wrap gap-2">
              {["Ethereum", "Base", "Polygon", "Arbitrum", "Optimism", "Avalanche", "BNB Chain", "Fantom", "zkSync", "Gnosis", "Celo"].map((chain) => (
                <span key={chain} className="px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-muted-foreground">
                  {chain}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Rate limits vary by plan. Check the Zerion developer docs for current limits on your tier.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* HACKATHON IDEAS */}
        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Hackathon Ideas</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Building with Zerion + Aegis for a hackathon? Here are high-impact project ideas organized by track.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-xs font-medium text-amber-400/80 mb-2 uppercase tracking-wider">DeFi Track</div>
              <h4 className="font-semibold text-sm mb-1.5">Portfolio-Aware Spending</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI agents that check their Zerion portfolio before making purchases. Budget decisions informed by real-time multi-chain net worth, not just a single wallet balance.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-xs font-medium text-amber-400/80 mb-2 uppercase tracking-wider">Portfolio Management</div>
              <h4 className="font-semibold text-sm mb-1.5">Automated Rebalancing</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agents that monitor portfolio allocations via Zerion and automatically rebalance when drift exceeds thresholds. Combine with Aegis budget policies for risk limits.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-xs font-medium text-amber-400/80 mb-2 uppercase tracking-wider">Analytics</div>
              <h4 className="font-semibold text-sm mb-1.5">Fleet Wealth Tracking</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cross-chain wealth tracking dashboard for agent fleets. Aggregate Zerion data across dozens of agent wallets to show total organization value, chain distribution, and token exposure.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-xs font-medium text-amber-400/80 mb-2 uppercase tracking-wider">Risk Management</div>
              <h4 className="font-semibold text-sm mb-1.5">Value-Based Behavior</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agents that adjust their behavior based on portfolio value. Conservative when holdings are low, aggressive when flush. Zerion provides the real-time valuation input.
              </p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* API REFERENCE */}
        <SectionAnchor id="api-reference">
          <h2 className="text-2xl font-bold tracking-tight mb-4">API Reference</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The Zerion integration exposes a single function. It handles auth, pagination, dust filtering, and chain ID mapping internally.
          </p>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Function</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Parameters</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Returns</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="py-3 px-4 font-mono text-emerald-400/80">getZerionPortfolio</td>
                    <td className="py-3 px-4 font-mono text-amber-400/70">walletAddress: string</td>
                    <td className="py-3 px-4 font-mono text-blue-400/70">ChainBalance[]</td>
                    <td className="py-3 px-4">Fetches all positions for a wallet across EVM chains. Filters dust, maps chain IDs, returns normalized balances with USD values.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h4 className="font-semibold text-sm mb-3">ChainBalance Type</h4>
            <CodeBlock>
{`interface ChainBalance {
  chain: string;      // Human-readable chain name ("Ethereum", "Base", ...)
  token: string;      // Token symbol ("ETH", "USDC", ...)
  balance: string;    // Token amount as decimal string
  usdValue: string;   // USD value as decimal string
  source: "zerion" | "uniblock" | "allium";
}`}
            </CodeBlock>
          </div>
        </SectionAnchor>

        {/* Footer nav */}
        <hr className="border-white/[0.06] my-12" />
        <div className="flex items-center justify-between text-sm">
          <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Docs</Link>
          <Link href="/docs/xmtp" className="text-muted-foreground hover:text-foreground transition-colors">XMTP Integration &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
