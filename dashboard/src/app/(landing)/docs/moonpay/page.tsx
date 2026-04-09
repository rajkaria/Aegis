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

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function TableOfContents() {
  const sections = [
    { id: "overview", label: "Why MoonPay for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses MoonPay For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "embedded-widget", label: "Embedded On-Ramp Widget" },
    { id: "off-ramp", label: "Off-Ramp (Cash Out)" },
    { id: "swap", label: "Token Swaps" },
    { id: "tx-tracking", label: "Transaction Tracking" },
    { id: "webhooks", label: "Webhooks" },
    { id: "currencies-api", label: "Currencies API" },
    { id: "geo-check", label: "Geo Availability" },
    { id: "funding", label: "URL Generation" },
    { id: "cli", label: "CLI Integration" },
    { id: "flow", label: "Funding Flow" },
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

export default function MoonPayDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />
      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-xs text-purple-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400" />
            MoonPay
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">MoonPay Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Fiat on-ramp for AI agent wallets &mdash; fund agents with credit card or bank transfer. No crypto needed to get started.
          </p>
        </div>

        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why MoonPay for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\uD83D\uDCB3", title: "Fiat-to-Crypto Bridge", desc: "Fund agents with credit card, debit card, or bank transfer" },
              { icon: "\uD83D\uDDA5\uFE0F", title: "CLI + Web Widget", desc: "Developer CLI for automation, web widget for user-facing flows" },
              { icon: "\uD83E\uDE99", title: "Multi-Token Support", desc: "Buy USDC, ETH, SOL across Ethereum, Base, Solana, Polygon" },
              { icon: "\uD83D\uDD12", title: "KYC Compliant", desc: "Regulatory-compliant on-ramp — handles identity verification" },
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
          <h2 className="text-2xl font-bold mb-4">What Aegis Uses MoonPay For</h2>
          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-purple-400 mb-1">Agent Wallet Funding</h4>
              <p className="text-sm text-muted-foreground">Generate funding URLs and CLI commands to top up agent wallets from fiat currency.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-purple-400 mb-1">CLI Wallet Management</h4>
              <p className="text-sm text-muted-foreground">Check if MoonPay CLI is installed, list managed wallets, and initiate purchases programmatically.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-purple-400 mb-1">Zero-Crypto Onboarding</h4>
              <p className="text-sm text-muted-foreground">Deploy and fund agents without needing any existing cryptocurrency holdings.</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard icon="\uD83D\uDE80" title="Agent Onboarding" description="Fund new agent wallets without existing crypto. Credit card to USDC in one step." example="mp buy --currency usdc --wallet 0x..." />
            <UseCaseCard icon="\uD83D\uDD04" title="Budget Top-Up" description="Replenish agent budgets via fiat when funds run low. Triggered by budget policy alerts." example="budget alert → MoonPay URL → funded" />
            <UseCaseCard icon="\uD83C\uDFE2" title="Enterprise Deployment" description="Fund entire agent fleets via corporate credit card. No crypto treasury required." example="fleet.agents.map(a => fundUrl(a.addr))" />
            <UseCaseCard icon="\uD83D\uDEE0\uFE0F" title="Developer Experience" description="Quick testnet-to-mainnet transition. Same workflow, real funds." example="mp buy → agent funded → deploy" />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Embedded Widget */}
        <SectionAnchor id="embedded-widget">
          <h2 className="text-2xl font-bold mb-4">Embedded On-Ramp Widget</h2>
          <p className="text-sm text-muted-foreground mb-4">
            When <code className="text-emerald-400">MOONPAY_SECRET_KEY</code> is configured, the buy widget opens inline in the Aegis dashboard &mdash; operators never leave the app. Without it, falls back to opening MoonPay in a new tab.
          </p>
          <CodeBlock title="Generate a signed buy widget URL">{`import { getMoonPayBuyUrl } from "@aegis-ows/integrations";

const url = getMoonPayBuyUrl({
  walletAddress: "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
  currencyCode: "sol",           // "sol", "usdc", "eth"
  baseCurrencyCode: "usd",       // Fiat currency
  baseCurrencyAmount: "50",      // Pre-fill $50
  externalTransactionId: "aegis-data-miner-1234",
});

// With secret key: URL is HMAC-signed for embedded iframe mode
// Without: plain URL opens in new tab`}</CodeBlock>
          <CodeBlock title="Dashboard API route">{`// POST /api/moonpay/sign
const res = await fetch("/api/moonpay/sign", {
  method: "POST",
  body: JSON.stringify({
    walletAddress: agentId,
    currencyCode: "usdc",
    externalTransactionId: \`aegis-\${agentId}-\${Date.now()}\`,
  }),
});
const { url } = await res.json();
// url is ready for iframe src or window.open()`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Off-Ramp */}
        <SectionAnchor id="off-ramp">
          <h2 className="text-2xl font-bold mb-4">Off-Ramp (Cash Out Profits)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Agents that earn more than they spend can cash out to the operator&apos;s bank account. The &ldquo;Withdraw Profits&rdquo; card only appears when an agent has positive P&amp;L.
          </p>
          <CodeBlock title="Generate a sell widget URL">{`import { getMoonPaySellUrl } from "@aegis-ows/integrations";

const url = getMoonPaySellUrl({
  walletAddress: "2G55Sds...",
  currencyCode: "usdc",          // Crypto to sell
  baseCurrencyCode: "usd",       // Fiat to receive
  quoteCurrencyAmount: "100",    // Amount of crypto to sell
  externalTransactionId: "aegis-sell-analyst-5678",
});
// Opens MoonPay sell flow → crypto leaves wallet → fiat hits bank`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-400 font-semibold mb-1">Revenue isn&apos;t trapped in crypto</p>
            <p className="text-sm text-muted-foreground">
              Off-ramping makes agent economies feel like a real business. Operators can withdraw profits to their bank without touching an exchange.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Swap */}
        <SectionAnchor id="swap">
          <h2 className="text-2xl font-bold mb-4">Token Swaps</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Agent holds SOL but needs to pay in USDC? Swap in-flow via MoonPay &mdash; no DEX interaction needed.
          </p>
          <CodeBlock title="Generate a swap URL">{`import { getMoonPaySwapUrl } from "@aegis-ows/integrations";

const url = getMoonPaySwapUrl({
  walletAddress: "2G55Sds...",
  fromCurrencyCode: "sol",
  toCurrencyCode: "usdc",
});
// Opens MoonPay swap widget`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Transaction Tracking */}
        <SectionAnchor id="tx-tracking">
          <h2 className="text-2xl font-bold mb-4">Transaction Tracking</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Track buy/sell/swap transactions in real-time. Requires <code className="text-emerald-400">MOONPAY_SECRET_KEY</code>.
          </p>
          <CodeBlock title="Query transaction status">{`import { getMoonPayTransaction } from "@aegis-ows/integrations";

const tx = await getMoonPayTransaction("aegis-data-miner-1234");
// Returns:
// {
//   id: "tx_abc...",
//   status: "completed",        // waitingPayment | pending | completed | failed
//   cryptoAmount: "0.5",
//   baseCurrencyAmount: "50",
//   baseCurrency: "usd",
//   currency: "sol",
//   walletAddress: "2G55Sds...",
//   createdAt: "2024-01-15T10:30:00Z"
// }`}</CodeBlock>
          <CodeBlock title="Dashboard API">{`// GET /api/moonpay/transactions?externalId=aegis-data-miner-1234
// Returns MoonPayTransaction object
// Status polling: dashboard component polls every 10s until terminal state`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Webhooks */}
        <SectionAnchor id="webhooks">
          <h2 className="text-2xl font-bold mb-4">Webhooks</h2>
          <p className="text-sm text-muted-foreground mb-4">
            MoonPay sends real-time webhook events when transactions complete. Aegis validates the signature and logs to the agent activity feed.
          </p>
          <CodeBlock title="Webhook handler">{`// POST /api/moonpay/webhook
// Headers: moonpay-signature-v2: <HMAC-SHA256 signature>

// Events handled:
// transaction_completed → log success, trigger balance refresh
// transaction_failed    → log failure, notify operator
// transaction_updated   → log status change

// Signature validated using MOONPAY_WEBHOOK_KEY
// Invalid signatures return 401`}</CodeBlock>
          <CodeBlock title="Webhook validation">{`import { validateMoonPayWebhook } from "@aegis-ows/integrations";

const payload = validateMoonPayWebhook(rawBody, signatureHeader);
if (!payload) {
  // Invalid signature — reject
}
// payload.type: "transaction_completed" | "transaction_failed" | ...
// payload.data: transaction details`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Currencies API */}
        <SectionAnchor id="currencies-api">
          <h2 className="text-2xl font-bold mb-4">Currencies API</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Dynamically query which tokens MoonPay supports instead of hardcoding. Cached for 1 hour.
          </p>
          <CodeBlock title="Fetch supported currencies">{`import { getMoonPayCurrencies } from "@aegis-ows/integrations";

const currencies = await getMoonPayCurrencies();
// With API key: fetches from MoonPay /v3/currencies
// Without: returns hardcoded [SOL, USDC, ETH]

// Each currency:
// { code: "sol", name: "Solana", minBuyAmount: 0.1, maxBuyAmount: 30000,
//   isSellSupported: true, ... }`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Geo Availability */}
        <SectionAnchor id="geo-check">
          <h2 className="text-2xl font-bold mb-4">Geo Availability</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Check if MoonPay is available in the operator&apos;s country before showing funding options.
          </p>
          <CodeBlock title="Check availability">{`import { checkMoonPayAvailability } from "@aegis-ows/integrations";

const availability = await checkMoonPayAvailability();
// { isAllowed: true, isBuyAllowed: true, isSellAllowed: true, alpha2: "US" }

// Without API key: returns optimistic default (always allowed)
// With API key: checks MoonPay /v4/ip_address endpoint`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="funding">
          <h2 className="text-2xl font-bold mb-4">URL Generation</h2>
          <CodeBlock title="Generate funding options for an agent wallet">{`import { getMoonPayFundingOptions } from "@aegis-ows/integrations";

const options = getMoonPayFundingOptions("0x1234...");

// Returns:
// {
//   provider: "moonpay",
//   command: "mp buy --currency usdc --wallet 0x1234...",
//   url: "https://www.moonpay.com/buy/usdc?walletAddress=0x1234...",
//   supportedTokens: ["USDC", "ETH", "SOL"],
//   supportedChains: ["Ethereum", "Base", "Solana", "Polygon"]
// }`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            Returns both a CLI command and a web URL. Use the CLI for automation, or open the URL in a browser for a guided purchase flow.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="cli">
          <h2 className="text-2xl font-bold mb-4">CLI Integration</h2>
          <CodeBlock title="MoonPay CLI commands">{`# Check if MoonPay CLI is installed
mp --version

# Buy USDC for an agent wallet
mp buy --currency usdc --wallet 0x1234...

# List managed wallets
mp wallet list --json`}</CodeBlock>
          <CodeBlock title="Programmatic CLI usage">{`import { isMoonPayInstalled, getMoonPayWallets } from "@aegis-ows/integrations";

// Check CLI availability
if (isMoonPayInstalled()) {
  // List all wallets managed by MoonPay CLI
  const wallets = getMoonPayWallets();
  console.log("Managed wallets:", wallets);
  // ["0x1234...", "0x5678...", ...]
}`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="widget">
          <h2 className="text-2xl font-bold mb-4">Web Widget</h2>
          <CodeBlock title="Generate a funding URL">{`const agentWallet = "0x1234...";
const fundingUrl = \`https://www.moonpay.com/buy/usdc?walletAddress=\${agentWallet}\`;

// Open in browser for guided purchase flow
// MoonPay handles KYC, payment processing, and crypto delivery`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <p className="text-sm text-purple-400 font-semibold mb-1">No API key for URLs</p>
            <p className="text-sm text-muted-foreground">
              The web widget URL works without authentication. MoonPay handles the full purchase flow including identity verification, payment processing, and delivery to the agent wallet.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="flow">
          <h2 className="text-2xl font-bold mb-6">Funding Flow</h2>
          <div className="space-y-4 mb-8">
            <StepCard number="1" title="Agent Detects Low Balance" description="Budget policy alerts when agent balance drops below threshold." />
            <StepCard number="2" title="Aegis Generates Funding URL" description="getMoonPayFundingOptions() returns a purchase URL for the agent wallet." />
            <StepCard number="3" title="Operator Funds via Fiat" description="Credit card, debit card, or bank transfer through MoonPay checkout." />
            <StepCard number="4" title="MoonPay Delivers Crypto" description="USDC, ETH, or SOL delivered directly to the agent wallet address." />
            <StepCard number="5" title="Agent Resumes Operations" description="Agent detects new balance and resumes API purchases and service delivery." />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          <CodeBlock title=".env (all optional)">{`# Publishable key — enables embedded widget + currencies API
MOONPAY_API_KEY=pk_live_...

# Secret key — enables URL signing + transaction status queries
MOONPAY_SECRET_KEY=sk_live_...

# Webhook key — enables real-time transaction notifications
MOONPAY_WEBHOOK_KEY=whk_...`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-400 font-semibold mb-1">Graceful degradation</p>
            <p className="text-sm text-muted-foreground">
              Everything works without API keys (external URLs). Each key unlocks more features. Same pattern as Zerion and Allium.
            </p>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  <th className="text-left p-3 font-semibold">Requires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 text-muted-foreground">Buy/Sell/Swap URLs</td><td className="p-3 text-xs text-emerald-400">Nothing (works out of the box)</td></tr>
                <tr><td className="p-3 text-muted-foreground">Embedded widget (iframe)</td><td className="p-3 text-xs text-muted-foreground">MOONPAY_SECRET_KEY</td></tr>
                <tr><td className="p-3 text-muted-foreground">Currencies API</td><td className="p-3 text-xs text-muted-foreground">MOONPAY_API_KEY</td></tr>
                <tr><td className="p-3 text-muted-foreground">Geo availability check</td><td className="p-3 text-xs text-muted-foreground">MOONPAY_API_KEY</td></tr>
                <tr><td className="p-3 text-muted-foreground">Transaction status</td><td className="p-3 text-xs text-muted-foreground">MOONPAY_SECRET_KEY</td></tr>
                <tr><td className="p-3 text-muted-foreground">Webhooks</td><td className="p-3 text-xs text-muted-foreground">MOONPAY_WEBHOOK_KEY</td></tr>
                <tr><td className="p-3 text-muted-foreground">CLI purchases</td><td className="p-3 text-xs text-muted-foreground">@moonpay/cli</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { track: "UX Track", idea: "Seamless fiat-to-agent funding flow — deploy and fund agents with a credit card", color: "purple" },
              { track: "Onboarding", idea: "Zero-crypto-knowledge agent deployment — no MetaMask, no seed phrases for operators", color: "emerald" },
              { track: "Enterprise", idea: "Corporate card funding for agent fleets with expense tracking and receipts", color: "sky" },
              { track: "Payments", idea: "Hybrid fiat/crypto agent economies — agents earn crypto, operators fund with fiat", color: "amber" },
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
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getMoonPayBuyUrl</td><td className="p-3 text-muted-foreground text-xs">options</td><td className="p-3 text-muted-foreground text-xs">string (signed URL)</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getMoonPaySellUrl</td><td className="p-3 text-muted-foreground text-xs">options</td><td className="p-3 text-muted-foreground text-xs">string (signed URL)</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getMoonPaySwapUrl</td><td className="p-3 text-muted-foreground text-xs">options</td><td className="p-3 text-muted-foreground text-xs">string</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getMoonPayTransaction</td><td className="p-3 text-muted-foreground text-xs">externalId</td><td className="p-3 text-muted-foreground text-xs">MoonPayTransaction | null</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getMoonPayCurrencies</td><td className="p-3 text-muted-foreground text-xs">(none)</td><td className="p-3 text-muted-foreground text-xs">MoonPayCurrency[]</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">checkMoonPayAvailability</td><td className="p-3 text-muted-foreground text-xs">ipAddress?</td><td className="p-3 text-muted-foreground text-xs">MoonPayAvailability</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">validateMoonPayWebhook</td><td className="p-3 text-muted-foreground text-xs">rawBody, signature</td><td className="p-3 text-muted-foreground text-xs">payload | null</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">signMoonPayUrl</td><td className="p-3 text-muted-foreground text-xs">url</td><td className="p-3 text-muted-foreground text-xs">string | null</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getMoonPayConfig</td><td className="p-3 text-muted-foreground text-xs">(none)</td><td className="p-3 text-muted-foreground text-xs">config object</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getMoonPayFundingOptions</td><td className="p-3 text-muted-foreground text-xs">walletAddress</td><td className="p-3 text-muted-foreground text-xs">FundingOption</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/ows" className="hover:text-foreground transition-colors">OWS &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
