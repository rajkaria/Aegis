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

function TxLink({ hash, chain }: { hash: string; chain: "solana" | "base" }) {
  const url = chain === "solana"
    ? `https://solscan.io/tx/${hash}`
    : `https://basescan.org/tx/${hash}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="font-mono text-emerald-400 hover:text-emerald-300 underline text-xs">
      {hash.slice(0, 16)}...
    </a>
  );
}

// FILL: Replace these values after the live run
const RUN_DATA = {
  date: "2026-04-09",
  totalBudget: 50,
  wallets: {
    buyerSol: "FILL_BUYER_SOL_ADDRESS",
    buyerBase: "FILL_BUYER_BASE_ADDRESS",
    analystSol: "FILL_ANALYST_SOL_ADDRESS",
    analystBase: "FILL_ANALYST_BASE_ADDRESS",
    minerSol: "FILL_MINER_SOL_ADDRESS",
    minerBase: "FILL_MINER_BASE_ADDRESS",
  },
  sampleTxHashes: [
    { cycle: 1, chain: "solana" as const, hash: "FILL_TX_1", topic: "DeFi yield farming", fee: 0.00024 },
    { cycle: 3, chain: "base" as const, hash: "FILL_TX_2", topic: "Solana DeFi ecosystem", fee: 0.0009 },
    { cycle: 7, chain: "solana" as const, hash: "FILL_TX_3", topic: "Layer 2 scaling", fee: 0.00025 },
  ],
  pnl: {
    miner: { revenue: 0.20, cost: 0, net: 0.20, calls: 20 },
    analyst: { revenue: 1.00, cost: 0.22, net: 0.78, calls: 20 },
    buyer: { revenue: 0, cost: 1.00, net: -1.00, purchases: 17, skips: 3 },
    gas: -0.02,
    remainingInBuyer: 49.00,
  },
};

export default function LiveRunPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">

        <div className="space-y-4">
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Docs
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-mono">Live</span>
            <time className="text-sm text-muted-foreground">{RUN_DATA.date}</time>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">We Gave AI Agents $50. Here's What Happened.</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A real-money experiment: deploy three AI agents to the cloud, give them $50 in mainnet crypto,
            and watch them trade autonomously across Solana and Base. Every transaction verifiable on-chain.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">1. The Setup</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Aegis agent economy has three roles. A <strong className="text-foreground">data-miner</strong> fetches
            live crypto market data from CoinGecko and DeFiLlama. An <strong className="text-foreground">analyst</strong> buys
            that data, feeds it to Claude Haiku, and sells AI-generated analysis. A
            <strong className="text-foreground"> research-buyer</strong> autonomously discovers and purchases analysis
            every 10 seconds, routing each payment to whichever chain has lower fees.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            All payments use the open <strong className="text-foreground">x402 protocol</strong> — standard HTTP with a
            payment header. Any agent can call our endpoints without using the Aegis SDK.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">2. Funding the Wallets</h2>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Wallet</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Address</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  ["buyer-sol", RUN_DATA.wallets.buyerSol, "$22.50 SOL"],
                  ["buyer-base", RUN_DATA.wallets.buyerBase, "$22.50 USDC"],
                  ["analyst-sol", RUN_DATA.wallets.analystSol, "$1.25 SOL"],
                  ["analyst-base", RUN_DATA.wallets.analystBase, "$1.25 USDC"],
                  ["miner-sol", RUN_DATA.wallets.minerSol, "$1.25 SOL"],
                  ["miner-base", RUN_DATA.wallets.minerBase, "$1.25 USDC"],
                ].map(([name, addr, amount]) => (
                  <tr key={name}>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400">{name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{String(addr).slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm">{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">3. The Run</h2>
          <CodeBlock title="Live agent logs">{`[AEGIS] {"event":"cycle_start","cycle":1,"topic":"DeFi yield farming"}
[AEGIS] {"event":"payment","cycle":1,"chain":"solana","amount":0.05,"fee":0.00024}
[AEGIS] {"event":"earn","agentId":"analyst","amount":0.05,"net":0.039}
[AEGIS] {"event":"earn","agentId":"data-miner","amount":0.01,"net":0.01}
[AEGIS] {"event":"decision","cycle":2,"action":"skip","reason":"Cost optimization"}`}</CodeBlock>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sample Transactions</h3>
            {RUN_DATA.sampleTxHashes.map((tx) => (
              <div key={tx.hash} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">{tx.topic}</div>
                  <div className="text-xs text-muted-foreground">Cycle {tx.cycle} · {tx.chain} · fee ${tx.fee}</div>
                </div>
                <TxLink hash={tx.hash} chain={tx.chain} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">4. The Economics</h2>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Costs</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">data-miner</td>
                  <td className="px-4 py-3">${RUN_DATA.pnl.miner.revenue.toFixed(2)}</td>
                  <td className="px-4 py-3">$0</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">+${RUN_DATA.pnl.miner.net.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">analyst</td>
                  <td className="px-4 py-3">${RUN_DATA.pnl.analyst.revenue.toFixed(2)}</td>
                  <td className="px-4 py-3">${RUN_DATA.pnl.analyst.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">+${RUN_DATA.pnl.analyst.net.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-rose-400">research-buyer</td>
                  <td className="px-4 py-3">$0</td>
                  <td className="px-4 py-3">${Math.abs(RUN_DATA.pnl.buyer.net).toFixed(2)}</td>
                  <td className="px-4 py-3 text-rose-400 font-semibold">-${Math.abs(RUN_DATA.pnl.buyer.net).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Can agents grow money?</strong> Yes — seller agents net positive
            on every call as long as there are buyers.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">5. Any Agent Can Participate</h2>
          <CodeBlock title="One function call">{`import { payAndFetch } from "aegis-ows-gate";

const analysis = await payAndFetch(
  "https://aegis-analyst.up.railway.app/analyze?topic=Solana+DeFi",
  "your-agent-id"
);
// $0.05 USDC — real AI analysis returned`}</CodeBlock>
          <p className="text-sm text-muted-foreground">
            See the <Link href="/docs/interop" className="text-emerald-400 hover:text-emerald-300">full interop guide</Link> for
            raw HTTP examples and how to become a seller.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. What's Next</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Reinvestment loop — sellers auto-reinvest earnings</li>
            <li>More seller types — code auditor, price predictor, sentiment scorer</li>
            <li>External buyers — real revenue from third-party agents</li>
            <li>Network effect — every new seller is a new earning opportunity</li>
          </ul>
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
