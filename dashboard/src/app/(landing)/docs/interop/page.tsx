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

export default function InteropPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">

        <div className="space-y-4">
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Docs
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Open Agent Interop</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Any HTTP agent can call Aegis-powered endpoints — no Aegis SDK required. If your agent can make
            HTTP requests, it can pay and receive services from our agents on Solana and Base.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">How x402 Works</h2>
          <p className="text-muted-foreground leading-relaxed">
            Aegis uses the open <strong className="text-foreground">x402 payment protocol</strong>. The flow is
            standard HTTP — no proprietary handshakes:
          </p>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li>Your agent sends a GET request to a paid endpoint</li>
            <li>The server returns <strong className="text-foreground">HTTP 402</strong> with payment details (price, wallet address, chain)</li>
            <li>Your agent signs a payment authorization and sends the transaction</li>
            <li>Your agent retries with an <code className="text-emerald-400">X-PAYMENT</code> header containing the tx hash</li>
            <li>The server verifies and responds with data</li>
          </ol>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Live Endpoints</h2>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Endpoint</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Returns</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 font-mono text-emerald-400 text-xs">GET /scrape?topic=DeFi</td>
                  <td className="px-4 py-3 text-muted-foreground">$0.01 USDC</td>
                  <td className="px-4 py-3 text-muted-foreground">Real CoinGecko + DeFiLlama market data</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-emerald-400 text-xs">GET /analyze?topic=DeFi</td>
                  <td className="px-4 py-3 text-muted-foreground">$0.05 USDC</td>
                  <td className="px-4 py-3 text-muted-foreground">AI analysis (sentiment, signals, summary)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Both endpoints accept payment on Solana (mainnet) or Base.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Three Ways to Integrate</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-white/[0.06] px-2 py-1 rounded">Tier 1</span>
              <h3 className="text-lg font-semibold">Raw HTTP (any language)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No SDK needed. Probe for 402, read payment details, send tx, retry.
            </p>
            <CodeBlock title="curl — full x402 flow">{`# Step 1: Probe — get payment details
curl https://aegis-analyst.up.railway.app/analyze?topic=DeFi

# Response: 402 with payment details
# {
#   "x402Version": 1,
#   "payTo": "0x4ef5...",
#   "price": "0.05",
#   "token": "USDC",
#   "acceptedChains": ["eip155:8453", "solana:mainnet"]
# }

# Step 2: Send USDC on Base to the payTo address
# (Use your wallet, CLI, or on-chain script)
TX_HASH="0xabc123..."

# Step 3: Retry with X-PAYMENT header
curl -H 'X-PAYMENT: {"fromAgent":"my-agent","txHash":"'$TX_HASH'","chain":"eip155:8453","amount":"0.05","timestamp":"2026-04-09T12:00:00Z"}' \\
  https://aegis-analyst.up.railway.app/analyze?topic=DeFi`}</CodeBlock>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-emerald-400">Tier 2 — Recommended</span>
              <h3 className="text-lg font-semibold">payAndFetch() — one function</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Install <code className="text-emerald-400">aegis-ows-gate</code> from npm. One call handles probe, sign, retry.
            </p>
            <CodeBlock title="npm install aegis-ows-gate">{`npm install aegis-ows-gate`}</CodeBlock>
            <CodeBlock title="TypeScript / Node.js">{`import { payAndFetch } from "aegis-ows-gate";

// One call: probes for 402, signs payment, retries
const analysis = await payAndFetch(
  "https://aegis-analyst.up.railway.app/analyze?topic=DeFi",
  "my-agent-id"
);

console.log(analysis);
// { "analysis": { "sentiment": "bullish", "confidence": 0.82, ... } }`}</CodeBlock>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-white/[0.06] px-2 py-1 rounded">Tier 3</span>
              <h3 className="text-lg font-semibold">aegisGate() — become a seller</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Add <code className="text-emerald-400">aegisGate()</code> middleware to any Express route to earn from AI agents.
            </p>
            <CodeBlock title="Sell your own data">{`import express from "express";
import { aegisGate } from "aegis-ows-gate";

const app = express();

app.get("/my-data", aegisGate({
  price: "0.02",
  token: "USDC",
  agentId: "my-seller",
  walletAddress: "0xYourWallet",
  network: "eip155:8453",
}), (req, res) => {
  res.json({ data: "your valuable data" });
});

app.listen(3000);`}</CodeBlock>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Payment Verification</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The <code className="text-emerald-400">X-PAYMENT</code> header must include:
          </p>
          <CodeBlock title="X-PAYMENT header schema">{`{
  "fromAgent": "your-agent-id",
  "txHash": "0x...",
  "chain": "eip155:8453",
  "amount": "0.05",
  "timestamp": "2026-04-09T..."
}`}</CodeBlock>
        </section>

        <div className="pt-4">
          <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            ← Back to all docs
          </Link>
        </div>

      </div>
    </div>
  );
}
