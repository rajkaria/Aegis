"use client";

import Link from "next/link";

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-white/[0.06] text-xs font-mono text-muted-foreground">{title}</div>
      )}
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
    { id: "overview", label: "Why XRPL for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses XRPL For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "architecture", label: "Architecture" },
    { id: "balances", label: "Balance Monitoring" },
    { id: "trust-lines", label: "Trust Line Tokens" },
    { id: "websocket", label: "WebSocket Connection" },
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

export default function RippleDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />
      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs text-blue-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
            XRP Ledger
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Ripple XRPL Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            XRP balance monitoring, trust line tokens, and WebSocket real-time queries &mdash; enterprise-grade ledger running since 2012.
          </p>
        </div>

        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why XRPL for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\u26A1", title: "3-5 Second Settlement", desc: "Consensus-based finality without mining" },
              { icon: "\uD83D\uDCB0", title: "Micro Fees", desc: "~0.00001 XRP per transaction (~$0.000025)" },
              { icon: "\uD83D\uDCB1", title: "Native Trust Lines", desc: "Issue and hold any currency — built into the protocol" },
              { icon: "\uD83D\uDD0C", title: "WebSocket Streaming", desc: "Real-time data via persistent WebSocket connections" },
              { icon: "\uD83C\uDFE6", title: "Built-in DEX", desc: "On-ledger order book for currency exchange" },
              { icon: "\uD83C\uDFDB\uFE0F", title: "Enterprise Grade", desc: "Running since 2012 — battle-tested reliability" },
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
          <h2 className="text-2xl font-bold mb-4">What Aegis Uses XRPL For</h2>
          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-blue-400 mb-1">XRP Balance Queries</h4>
              <p className="text-sm text-muted-foreground">Native XRP balance via WebSocket RPC <code className="text-emerald-400 text-xs">account_info</code> command. Balance returned in drops (1 XRP = 1,000,000 drops).</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-blue-400 mb-1">Trust Line Token Monitoring</h4>
              <p className="text-sm text-muted-foreground">Query issued token balances (USDC, custom currencies) via <code className="text-emerald-400 text-xs">account_lines</code> command.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-blue-400 mb-1">Cross-Border Infrastructure</h4>
              <p className="text-sm text-muted-foreground">Foundation for agent payment corridors using XRP as a bridge currency between different agent economies.</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard icon="\uD83C\uDF0D" title="Cross-Border Agent Payments" description="Agents settling across jurisdictions using XRP. Near-instant settlement with On-Demand Liquidity corridors." example="Agent-JP ↔ XRP bridge ↔ Agent-US" />
            <UseCaseCard icon="\uD83D\uDCB1" title="Multi-Currency Trust Lines" description="Agents holding issued tokens — USD, EUR, USDC — via XRPL trust lines. Native multi-currency support." example="account_lines → [USD, EUR, USDC]" />
            <UseCaseCard icon="\uD83C\uDFE2" title="Enterprise Agent Networks" description="Institutional-grade agent economies built on the most battle-tested distributed ledger." example="B2B agent settlement via XRPL" />
            <UseCaseCard icon="\uD83C\uDF09" title="Liquidity Bridge" description="XRP as bridge currency between agent economies on different chains. XRPL DEX handles conversion." example="SOL economy ↔ XRP ↔ XLM economy" />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="architecture">
          <h2 className="text-2xl font-bold mb-4">Architecture</h2>
          <CodeBlock title="XRPL Integration Flow">{`Agent Wallet
    ↓
Aegis Integrations (@aegis-ows/integrations)
    ↓
xrpl npm package (WebSocket Client)
    ↓
wss://xrplcluster.com/
    ├── account_info     → Native XRP balance (drops)
    └── account_lines    → Trust line token balances
    ↓
XRP Ledger (Validated)`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="balances">
          <h2 className="text-2xl font-bold mb-4">Balance Monitoring</h2>
          <CodeBlock title="Query XRP + trust line balances">{`import { getXrpBalances } from "@aegis-ows/integrations";

const balances = await getXrpBalances("rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh");

// Returns:
// [
//   { chain: "XRP Ledger", chainId: "ripple:0", token: "XRP",
//     balance: "100.000000", usdValue: "250.00", source: "xrpl-rpc" },
//   { chain: "XRP Ledger", chainId: "ripple:0", token: "USD",
//     balance: "50.000000", usdValue: "50.00", source: "xrpl-rpc" }
// ]`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="font-semibold text-sm mb-2">How it works</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Opens WebSocket to <code className="text-emerald-400 text-xs">wss://xrplcluster.com/</code></li>
              <li>Sends <code className="text-emerald-400 text-xs">account_info</code> &mdash; gets Balance in drops</li>
              <li>Converts: <code className="text-emerald-400 text-xs">drops / 1,000,000 = XRP</code></li>
              <li>Sends <code className="text-emerald-400 text-xs">account_lines</code> &mdash; gets trust line tokens</li>
              <li>Disconnects cleanly</li>
            </ol>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="trust-lines">
          <h2 className="text-2xl font-bold mb-4">Trust Line Tokens</h2>
          <p className="text-sm text-muted-foreground mb-4">
            XRPL trust lines let agents hold issued tokens (stablecoins, custom currencies) directly on the ledger. Each trust line has a currency code, balance, and issuer.
          </p>
          <CodeBlock title="Trust line response structure">{`// Each trust line from account_lines:
{
  account: "rIssuerAddress...",
  balance: "50.00",         // Amount held
  currency: "USD",          // ISO 4217 or custom code
  limit: "1000000",         // Maximum trust amount
  quality_in: 0,
  quality_out: 0
}

// Use case: Agent holds USDC + EUR + custom tokens
// All queryable via getXrpBalances()`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-sm text-blue-400 font-semibold mb-1">Native multi-currency</p>
            <p className="text-sm text-muted-foreground">
              Unlike EVM chains where each token is a separate smart contract, XRPL trust lines are a first-class protocol feature. Agents can hold dozens of currencies with no additional contract deployments.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="websocket">
          <h2 className="text-2xl font-bold mb-4">WebSocket Connection</h2>
          <CodeBlock title="Direct WebSocket usage">{`import { Client } from "xrpl";

const client = new Client("wss://xrplcluster.com/");
await client.connect();

// Query native XRP balance
const response = await client.request({
  command: "account_info",
  account: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
  ledger_index: "validated"
});

const drops = parseInt(response.result.account_data.Balance, 10);
const xrpBalance = drops / 1_000_000;
console.log(\`XRP Balance: \${xrpBalance}\`);

// Query trust line tokens
const lines = await client.request({
  command: "account_lines",
  account: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
  ledger_index: "validated"
});

for (const line of lines.result.lines) {
  console.log(\`\${line.currency}: \${line.balance}\`);
}

await client.disconnect();`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
            <p className="text-sm text-emerald-400 font-semibold mb-1">No API keys needed</p>
            <p className="text-sm text-muted-foreground">XRPL uses public WebSocket endpoints. No authentication required.</p>
          </div>
          <CodeBlock title="Install dependency">{`npm install xrpl`}</CodeBlock>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Network</th>
                  <th className="text-left p-3 font-semibold">WebSocket Endpoint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 text-muted-foreground">Mainnet (default)</td><td className="p-3 font-mono text-xs text-emerald-400">wss://xrplcluster.com/</td></tr>
                <tr><td className="p-3 text-muted-foreground">Mainnet alt</td><td className="p-3 font-mono text-xs text-emerald-400">wss://s1.ripple.com/</td></tr>
                <tr><td className="p-3 text-muted-foreground">Testnet</td><td className="p-3 font-mono text-xs text-emerald-400">wss://s.altnet.rippletest.net:51233/</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { track: "XRPL Grants / Wave", idea: "Cross-border AI agent marketplace with XRP settlement corridors", color: "blue" },
              { track: "Enterprise Track", idea: "B2B agent settlement network on XRPL with compliance-ready trust lines", color: "emerald" },
              { track: "DeFi Track", idea: "Automated market maker agents using XRPL's native DEX order book", color: "violet" },
              { track: "Remittance", idea: "AI-powered remittance agents using On-Demand Liquidity corridors", color: "amber" },
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
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getXrpBalances</td><td className="p-3 text-muted-foreground text-xs">walletAddress: string</td><td className="p-3 text-muted-foreground text-xs">ChainBalance[]</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/zerion" className="hover:text-foreground transition-colors">Zerion &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
