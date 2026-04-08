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
    { id: "overview", label: "Why Stellar for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses Stellar For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "architecture", label: "Architecture" },
    { id: "balances", label: "Balance Monitoring" },
    { id: "verification", label: "Transaction Verification" },
    { id: "testnet", label: "Testnet Funding" },
    { id: "settlement", label: "Settlement Verification" },
    { id: "setup", label: "Setup Guide" },
    { id: "hackathon", label: "Hackathon Ideas" },
    { id: "api-reference", label: "API Reference" },
  ];

  return (
    <nav className="hidden xl:block fixed left-[max(0px,calc(50%-42rem))] top-24 w-56 max-h-[calc(100vh-8rem)] overflow-y-auto text-xs space-y-0.5 pr-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="block py-1 text-muted-foreground hover:text-foreground transition-colors font-medium">
          {s.label}
        </a>
      ))}
    </nav>
  );
}

export default function StellarDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />

      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5 text-xs text-sky-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400" />
            Stellar Protocol
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Stellar Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Cross-border payments, Horizon API balance monitoring, and multi-currency agent economies &mdash; near-zero fees with 3-5 second finality.
          </p>
        </div>

        {/* Why Stellar */}
        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why Stellar for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\uD83C\uDF0D", title: "Built for Cross-Border", desc: "Purpose-built for international payments and currency exchange" },
              { icon: "\u26A1", title: "3-5 Second Finality", desc: "Fast settlement with Stellar Consensus Protocol" },
              { icon: "\uD83D\uDCB0", title: "Near-Zero Fees", desc: "~$0.00001 per transaction — even cheaper than Solana" },
              { icon: "\uD83D\uDCB1", title: "Native Multi-Currency", desc: "Trust lines for any issued asset (USDC, EUR, custom tokens)" },
              { icon: "\uD83C\uDFE6", title: "Built-in DEX", desc: "On-ledger decentralized exchange for currency conversion" },
              { icon: "\uD83E\uDDEA", title: "Free Testnet", desc: "Friendbot provides unlimited testnet XLM for development" },
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

        {/* What Aegis Uses Stellar For */}
        <SectionAnchor id="aegis-usage">
          <h2 className="text-2xl font-bold mb-4">What Aegis Uses Stellar For</h2>
          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sky-400 mb-1">XLM &amp; Token Balance Monitoring</h4>
              <p className="text-sm text-muted-foreground">Query native XLM and trust line token balances via the Horizon REST API using <code className="text-emerald-400 text-xs">getStellarBalances()</code>.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sky-400 mb-1">Transaction Verification</h4>
              <p className="text-sm text-muted-foreground">Confirm agent payments landed on the Stellar network using <code className="text-emerald-400 text-xs">verifyStellarTransaction()</code>.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-sky-400 mb-1">Testnet Development</h4>
              <p className="text-sm text-muted-foreground">Fund development accounts with free testnet XLM via <code className="text-emerald-400 text-xs">fundStellarTestnet()</code> using Friendbot.</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Use Cases */}
        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard icon="\uD83C\uDF0D" title="Cross-Border Agent Economy" description="Agents in different countries transact using Stellar's native currency exchange. Pay in EUR, receive in USD." example="Agent-EU pays Agent-US via XLM bridge" />
            <UseCaseCard icon="\uD83D\uDCB5" title="Stablecoin Settlements" description="USDC on Stellar for predictable agent costs. No volatility risk for budget enforcement." example="getStellarBalances(addr) → USDC balance" />
            <UseCaseCard icon="\uD83E\uDE99" title="Multi-Currency Trust Lines" description="Agents hold multiple currencies simultaneously via Stellar trust lines — XLM, USDC, EUR tokens." example="balances: [XLM: 100, USDC: 50, EUR: 30]" />
            <UseCaseCard icon="\uD83E\uDDEA" title="Rapid Prototyping" description="Free testnet XLM via Friendbot means zero cost to develop and test agent payment flows." example="fundStellarTestnet(accountId) → 10,000 XLM" />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Architecture */}
        <SectionAnchor id="architecture">
          <h2 className="text-2xl font-bold mb-4">Architecture</h2>
          <CodeBlock title="Stellar Integration Flow">{`Agent Wallet
    ↓
Aegis Integrations (@aegis-ows/integrations)
    ↓
Stellar Horizon REST API
    ├── GET /accounts/{id}        → Native XLM + trust line balances
    ├── GET /transactions/{hash}  → Transaction verification
    └── GET /friendbot?addr={id}  → Testnet funding
    ↓
Stellar Network (Testnet or Pubnet)`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            All Stellar queries go through the public Horizon API &mdash; no API keys required. The SDK handles REST calls, response parsing, and error handling.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Balance Monitoring */}
        <SectionAnchor id="balances">
          <h2 className="text-2xl font-bold mb-4">Balance Monitoring</h2>
          <CodeBlock title="Query XLM + token balances">{`import { getStellarBalances } from "@aegis-ows/integrations";

// Query balances on testnet (default)
const balances = await getStellarBalances("GBZX...");

// Query balances on mainnet
const mainnetBalances = await getStellarBalances("GBZX...", false);

// Returns:
// [
//   { chain: "Stellar", chainId: "stellar:testnet", token: "XLM",
//     balance: "100.000000", usdValue: "12.00", source: "stellar-horizon" },
//   { chain: "Stellar", chainId: "stellar:testnet", token: "USDC",
//     balance: "50.000000", usdValue: "50.00", source: "stellar-horizon" }
// ]`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="font-semibold text-sm mb-2">How it works</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Connects to Horizon server (testnet or mainnet)</li>
              <li>Calls <code className="text-emerald-400 text-xs">server.loadAccount()</code> to fetch account data</li>
              <li>Iterates <code className="text-emerald-400 text-xs">account.balances</code> &mdash; native XLM + trust line tokens</li>
              <li>Returns <code className="text-emerald-400 text-xs">ChainBalance[]</code> with USD estimates</li>
            </ol>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Transaction Verification */}
        <SectionAnchor id="verification">
          <h2 className="text-2xl font-bold mb-4">Transaction Verification</h2>
          <CodeBlock title="Verify a Stellar transaction">{`import { verifyStellarTransaction } from "@aegis-ows/integrations";

const result = await verifyStellarTransaction(
  "abc123def456...",  // transaction hash
  true                // testnet (default)
);

// Returns:
// {
//   txHash: "abc123def456...",
//   chain: "stellar:testnet",
//   status: "confirmed",      // "confirmed" | "pending" | "not_found" | "error"
//   blockNumber: 12345,       // ledger sequence number
//   timestamp: "2024-01-15T10:30:00Z",
//   source: "stellar-horizon"
// }`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            Queries the Horizon <code className="text-emerald-400">/transactions/{'{hash}'}</code> endpoint. Returns the ledger sequence number as <code className="text-emerald-400">blockNumber</code> and the creation timestamp.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Testnet Funding */}
        <SectionAnchor id="testnet">
          <h2 className="text-2xl font-bold mb-4">Testnet Funding</h2>
          <CodeBlock title="Fund a testnet account">{`import { fundStellarTestnet } from "@aegis-ows/integrations";

// Fund with 10,000 XLM via Friendbot (free!)
const success = await fundStellarTestnet("GBZX...");

if (success) {
  console.log("Account funded with 10,000 testnet XLM");
}`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
            <p className="text-sm text-sky-400 font-semibold mb-1">Zero-cost development</p>
            <p className="text-sm text-muted-foreground">
              Stellar Friendbot provides free testnet XLM. No faucet limits, no tokens required. Perfect for developing and testing agent payment flows before going to mainnet.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Settlement Verification */}
        <SectionAnchor id="settlement">
          <h2 className="text-2xl font-bold mb-4">Settlement Verification</h2>
          <CodeBlock title="Gate-level settlement check">{`import { verifySettlement } from "@aegis-ows/gate";

const confirmed = await verifySettlement(
  txHash,
  "stellar:testnet"  // or "stellar:pubnet"
);

// true  = confirmed on Stellar
// false = not found
// null  = unable to verify`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            The gate-level <code className="text-emerald-400">verifySettlement()</code> uses Horizon&apos;s transaction endpoint internally. Supports both testnet and pubnet via the network identifier.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Setup Guide */}
        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
            <p className="text-sm text-emerald-400 font-semibold mb-1">No API keys needed</p>
            <p className="text-sm text-muted-foreground">
              Stellar Horizon is a public API. All balance queries and transaction verification work without authentication.
            </p>
          </div>
          <CodeBlock title="Install dependency">{`npm install @stellar/stellar-sdk`}</CodeBlock>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Network</th>
                  <th className="text-left p-3 font-semibold">Horizon Endpoint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 text-muted-foreground">Testnet</td><td className="p-3 font-mono text-xs text-emerald-400">https://horizon-testnet.stellar.org</td></tr>
                <tr><td className="p-3 text-muted-foreground">Mainnet (Pubnet)</td><td className="p-3 font-mono text-xs text-emerald-400">https://horizon.stellar.org</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Hackathon Ideas */}
        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { track: "Stellar Community Fund", idea: "Cross-border AI agent marketplace with multi-currency settlement via Stellar DEX", color: "sky" },
              { track: "Cross-Border Payments", idea: "Agents transacting across currencies — pay in EUR, deliver in USD, bridge via XLM", color: "emerald" },
              { track: "Soroban Smart Contracts", idea: "On-chain agent policies enforced via Soroban contracts (future integration)", color: "violet" },
              { track: "Financial Inclusion", idea: "Micro-payment agents serving unbanked regions via Stellar's low-fee network", color: "amber" },
            ].map((h) => (
              <div key={h.track} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className={`text-xs font-semibold uppercase tracking-wider text-${h.color}-400 mb-2`}>{h.track}</p>
                <p className="text-sm text-muted-foreground">{h.idea}</p>
              </div>
            ))}
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* API Reference */}
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
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getStellarBalances</td><td className="p-3 text-muted-foreground text-xs">accountId, testnet?</td><td className="p-3 text-muted-foreground text-xs">ChainBalance[]</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">verifyStellarTransaction</td><td className="p-3 text-muted-foreground text-xs">txHash, testnet?</td><td className="p-3 text-muted-foreground text-xs">TxVerification</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">fundStellarTestnet</td><td className="p-3 text-muted-foreground text-xs">accountId</td><td className="p-3 text-muted-foreground text-xs">boolean</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/ripple" className="hover:text-foreground transition-colors">Ripple XRPL &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
