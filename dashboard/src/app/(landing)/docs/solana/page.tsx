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

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
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
    { id: "overview", label: "Why Solana for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses Solana For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "architecture", label: "Architecture" },
    { id: "payments", label: "On-Chain Payments" },
    { id: "receipts", label: "Receipt Anchoring" },
    { id: "balances", label: "Balance Monitoring" },
    { id: "verification", label: "Settlement Verification" },
    { id: "x402-flow", label: "x402 Payment Flow" },
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

export default function SolanaDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />

      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400" />
            Solana Protocol
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Solana Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            On-chain payments, receipt anchoring, and balance monitoring for AI agent economies &mdash; sub-second finality at fractions of a cent.
          </p>
        </div>

        {/* Why Solana */}
        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why Solana for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\u26A1", title: "Sub-Second Finality", desc: "~400ms confirmation — agents don't wait" },
              { icon: "\uD83D\uDCB0", title: "Lowest Fees", desc: "~$0.00025 per transaction — micropayments are viable" },
              { icon: "\uD83E\uDE99", title: "SPL Token Support", desc: "USDC, custom tokens via Token Program" },
              { icon: "\uD83D\uDCDD", title: "Memo Program", desc: "Anchor arbitrary data on-chain for proof" },
              { icon: "\uD83C\uDF10", title: "Massive Ecosystem", desc: "Largest developer community in crypto" },
              { icon: "\uD83D\uDD10", title: "OWS Native", desc: "In-process ed25519 signing via Open Wallet Standard" },
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

        {/* What Aegis Uses Solana For */}
        <SectionAnchor id="aegis-usage">
          <h2 className="text-2xl font-bold mb-4">What Aegis Uses Solana For</h2>
          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-violet-400 mb-1">SOL Transfers Between Agents</h4>
              <p className="text-sm text-muted-foreground">Agent-to-agent micropayments via <code className="text-emerald-400 text-xs">sendSolPayment()</code> — build a Transaction, sign with OWS, broadcast and confirm.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-violet-400 mb-1">Receipt Anchoring via Memo Program</h4>
              <p className="text-sm text-muted-foreground">Immutable payment proof — SHA-256 receipt hashes written on-chain via <code className="text-emerald-400 text-xs">anchorReceiptOnChain()</code>.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-violet-400 mb-1">Balance Monitoring</h4>
              <p className="text-sm text-muted-foreground">Real-time SOL and USDC balance queries via <code className="text-emerald-400 text-xs">getSolanaBalances()</code> for budget enforcement and dashboard display.</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Use Cases */}
        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard
              icon="\uD83D\uDCB8"
              title="Agent-to-Agent Payments"
              description="Autonomous micropayments for API access using the x402 protocol. Agents pay each other fractions of SOL per request."
              example="sendSolPayment('buyer', recipientAddr, 0.001)"
            />
            <UseCaseCard
              icon="\uD83D\uDD17"
              title="Receipt Anchoring"
              description="Immutable proof of payment on-chain. SHA-256 hashes of payment data written to Solana via the Memo program."
              example="anchorReceiptOnChain('analyst', receiptHash)"
            />
            <UseCaseCard
              icon="\uD83D\uDCCA"
              title="Balance Monitoring"
              description="Real-time SOL and USDC balance tracking for budget enforcement, spending alerts, and dashboard visualization."
              example="getSolanaBalances(walletAddress)"
            />
            <UseCaseCard
              icon="\uD83C\uDFED"
              title="Multi-Agent Economies"
              description="Supply chain payments: research-buyer pays analyst, analyst pays data-miner. Each payment is an on-chain SOL transfer."
              example="buyer → analyst → miner (0.005 → 0.001 SOL)"
            />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Architecture */}
        <SectionAnchor id="architecture">
          <h2 className="text-2xl font-bold mb-4">Architecture</h2>
          <CodeBlock title="Payment Flow">{`Agent Request
    ↓
x402 Gate Middleware (gateMiddleware)
    ↓
solana-pay.ts → Build Transaction (SystemProgram.transfer)
    ↓
OWS signTransaction() → ed25519 signature (in-process)
    ↓
Solana RPC → sendRawTransaction → confirmTransaction
    ↓
receipt-anchor.ts → Memo Program ("AEGIS_RECEIPT:<hash>")
    ↓
On-chain proof ✓`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            The entire flow happens in-process. OWS derives the private key from your seed, signs the transaction bytes, and the signed transaction is broadcast to the Solana RPC. No CLI shell-out, no blockhash race conditions.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* On-Chain Payments */}
        <SectionAnchor id="payments">
          <h2 className="text-2xl font-bold mb-4">On-Chain Payments</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send SOL between agent wallets. Uses <code className="text-emerald-400">SystemProgram.transfer</code> under the hood with OWS in-process signing.
          </p>
          <CodeBlock title="packages/gate/src/solana-pay.ts">{`import { sendSolPayment } from "@aegis-ows/gate";

// Pay 0.001 SOL from data-miner to analyst
const txHash = await sendSolPayment(
  "data-miner",                    // sender wallet name (OWS)
  "CePyeKXCtB6RzAatosDnnun3yry",  // recipient Solana address
  0.001                            // amount in SOL
);

if (txHash) {
  console.log(\`Payment confirmed: \${txHash}\`);
  // View: https://explorer.solana.com/tx/{txHash}
}`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="font-semibold text-sm mb-2">How it works</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Fetches latest blockhash from Solana RPC</li>
              <li>Builds a <code className="text-emerald-400 text-xs">Transaction</code> with <code className="text-emerald-400 text-xs">SystemProgram.transfer</code></li>
              <li>Serializes the transaction message to bytes</li>
              <li>Signs in-process with <code className="text-emerald-400 text-xs">OWS signTransaction()</code></li>
              <li>Broadcasts via <code className="text-emerald-400 text-xs">sendRawTransaction</code></li>
              <li>Waits for confirmation</li>
            </ol>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Receipt Anchoring */}
        <SectionAnchor id="receipts">
          <h2 className="text-2xl font-bold mb-4">Receipt Anchoring</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Anchor payment receipt hashes on Solana using the <strong>Memo Program</strong>. Creates an immutable on-chain proof that a payment occurred.
          </p>
          <CodeBlock title="Anchor a receipt hash on-chain">{`import { anchorReceiptOnChain } from "@aegis-ows/gate";

// Write receipt hash to Solana via Memo program
const txHash = await anchorReceiptOnChain(
  "analyst",                       // signer wallet (OWS)
  "sha256:a1b2c3d4e5f6..."        // receipt hash
);

// On-chain memo data: "AEGIS_RECEIPT:sha256:a1b2c3d4e5f6..."
// Verifiable at: https://explorer.solana.com/tx/{txHash}`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-muted-foreground">
            <p className="mb-2"><strong className="text-foreground">Memo Program:</strong> <code className="text-emerald-400 text-xs">MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr</code></p>
            <p>The receipt hash is a SHA-256 of the canonical payment data (amount, sender, recipient, timestamp). Anyone can verify the receipt by computing the same hash and checking the on-chain memo.</p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Balance Monitoring */}
        <SectionAnchor id="balances">
          <h2 className="text-2xl font-bold mb-4">Balance Monitoring</h2>
          <CodeBlock title="Query SOL + USDC balances">{`import { getSolanaBalances } from "@aegis-ows/integrations";

const balances = await getSolanaBalances(
  "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq"
);

// Returns:
// [
//   { chain: "Solana", token: "SOL",  balance: "1.500000", usdValue: "270.00", source: "solana-rpc" },
//   { chain: "Solana", token: "USDC", balance: "50.000000", usdValue: "50.00", source: "solana-rpc" }
// ]`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            Queries native SOL balance via <code className="text-emerald-400">getBalance()</code> and USDC SPL token accounts via <code className="text-emerald-400">getParsedTokenAccountsByOwner()</code>. Used by the dashboard wallet balance display and budget policy enforcement.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Settlement Verification */}
        <SectionAnchor id="verification">
          <h2 className="text-2xl font-bold mb-4">Settlement Verification</h2>
          <CodeBlock title="Verify a Solana transaction">{`import { verifySettlement } from "@aegis-ows/gate";

const confirmed = await verifySettlement(
  txHash,
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"  // Solana mainnet
);

// true  = confirmed on-chain
// false = not found or failed
// null  = unable to verify (RPC error)`}</CodeBlock>
          <p className="text-sm text-muted-foreground mt-4">
            Uses <code className="text-emerald-400">getTransaction()</code> to check if the transaction exists and succeeded. Supports both devnet and mainnet via the <code className="text-emerald-400">SOLANA_RPC_URL</code> env var.
          </p>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* x402 Payment Flow */}
        <SectionAnchor id="x402-flow">
          <h2 className="text-2xl font-bold mb-6">x402 Payment Flow</h2>
          <div className="space-y-4 mb-6">
            <StepCard number="1" title="Client Requests Protected Endpoint" description="Agent sends HTTP request to a gated API endpoint." />
            <StepCard number="2" title="402 Payment Required" description="Gate middleware responds with payment details: price, token, chain, recipient." />
            <StepCard number="3" title="Client Signs Payment" description="Agent builds a Solana transaction and signs with OWS." />
            <StepCard number="4" title="Payment Lands On-Chain" description="Signed transaction broadcast to Solana RPC and confirmed." />
            <StepCard number="5" title="Receipt Anchored" description="SHA-256 receipt hash written to Solana Memo program." />
            <StepCard number="6" title="Access Granted" description="Gate middleware verifies payment and serves the response." />
          </div>
          <CodeBlock title="Gate middleware setup">{`import { gateMiddleware } from "@aegis-ows/gate";

app.use("/api/data", gateMiddleware({
  price: "0.001",
  token: "SOL",
  chain: "solana",
  recipient: "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL"
}));`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Setup Guide */}
        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          <CodeBlock title=".env">{`# Required — no default (forces explicit network choice)
SOLANA_RPC_URL=https://api.devnet.solana.com

# For mainnet:
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# OWS wallet seed for key derivation
WALLET_SEED="your twelve word mnemonic phrase goes here..."`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-400 font-semibold mb-1">No default RPC URL</p>
            <p className="text-sm text-muted-foreground">
              <code className="text-emerald-400">SOLANA_RPC_URL</code> has no fallback by design. This forces you to explicitly choose devnet or mainnet &mdash; preventing accidental real-money transactions during development.
            </p>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">Dependencies</h4>
            <CodeBlock>{`npm install @solana/web3.js @open-wallet-standard/core`}</CodeBlock>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Hackathon Ideas */}
        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { track: "Solana Renaissance / Colosseum", idea: "AI agent marketplace with on-chain SOL payments and receipt proofs", color: "violet" },
              { track: "DeFi Track", idea: "Autonomous trading agents with budget policies and spending caps", color: "emerald" },
              { track: "Infrastructure", idea: "Receipt anchoring as verifiable proof-of-work for AI agents", color: "sky" },
              { track: "Payments Track", idea: "x402 micropayment protocol for monetizing any API endpoint", color: "amber" },
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
                  <th className="text-left p-3 font-semibold">Package</th>
                  <th className="text-left p-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 font-mono text-xs text-emerald-400">sendSolPayment(from, to, amount)</td><td className="p-3 text-muted-foreground">@aegis-ows/gate</td><td className="p-3 text-muted-foreground">Transfer SOL between agent wallets</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">anchorReceiptOnChain(signer, hash)</td><td className="p-3 text-muted-foreground">@aegis-ows/gate</td><td className="p-3 text-muted-foreground">Write receipt hash to Memo program</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">getSolanaBalances(address)</td><td className="p-3 text-muted-foreground">@aegis-ows/integrations</td><td className="p-3 text-muted-foreground">Query SOL + USDC balances</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">verifySettlement(txHash, network)</td><td className="p-3 text-muted-foreground">@aegis-ows/gate</td><td className="p-3 text-muted-foreground">Verify transaction on-chain</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/ows" className="hover:text-foreground transition-colors">OWS Integration &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
