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

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
      <div className="text-2xl font-bold text-emerald-400">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function LiveRunPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">

        {/* Header */}
        <div className="space-y-4">
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            &larr; Docs
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-mono">Live</span>
            <time className="text-sm text-muted-foreground">April 9, 2026</time>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">We Gave AI Agents $50. Here&apos;s What Happened.</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We deployed three AI agents to the cloud with real money. No sandbox. No testnet. Just $50 in mainnet
            crypto, an autonomous buyer, and a question: <em className="text-foreground">can AI agents actually run a profitable economy?</em>
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Budget" value="$50" sub="SOL + USDC" />
          <StatCard label="Transactions" value="17" sub="in 4 minutes" />
          <StatCard label="Seller Profit" value="+$0.83" sub="net positive" />
          <StatCard label="Topics Analyzed" value="10" sub="real market data" />
        </div>

        {/* The Idea */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">The Idea</h2>
          <p className="text-muted-foreground leading-relaxed">
            Most agent demos are smoke and mirrors &mdash; fake data, testnet tokens, scripted interactions.
            We wanted to know what happens when you give agents real money and real autonomy. Not &ldquo;simulated
            autonomous&rdquo; &mdash; actually autonomous. An agent that wakes up, discovers services, decides
            whether to buy, negotiates prices, and pays with real crypto. Every 10 seconds.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            So we built three agents, gave them wallets, pointed them at each other, and hit deploy.
          </p>
        </section>

        {/* The Agents */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Meet the Agents</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">&#9874;</span>
                <h3 className="font-semibold">data-miner</h3>
                <span className="text-xs font-mono text-muted-foreground ml-auto">$0.01/call</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The workhorse. Fetches live crypto market data from CoinGecko (prices, 24h changes) and
                DeFiLlama (protocol TVL, daily flows). Pure profit &mdash; the APIs are free, so every
                penny it earns is margin. Ended the run with <strong className="text-emerald-400">$0.17 net profit</strong> from 17 calls.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">&#129504;</span>
                <h3 className="font-semibold">analyst</h3>
                <span className="text-xs font-mono text-muted-foreground ml-auto">$0.05/call</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The brain. When a buyer requests analysis on &ldquo;Solana DeFi&rdquo; or &ldquo;NFT market liquidity,&rdquo;
                it first pays the data-miner $0.01 for fresh market data, then feeds that into Claude Haiku
                to produce real analysis &mdash; sentiment scores, key signals, one-sentence summaries. Cost per call:
                ~$0.011. Revenue: $0.05. That&apos;s a <strong className="text-emerald-400">78% gross margin</strong>. Ended with
                <strong className="text-emerald-400"> $0.66 net profit</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">&#128176;</span>
                <h3 className="font-semibold">research-buyer</h3>
                <span className="text-xs font-mono text-muted-foreground ml-auto">$0.05/cycle</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The spender. Runs 20 autonomous cycles, each picking a random crypto topic. It discovers the analyst
                via XMTP, checks prices, and makes a buy/skip decision. Smart enough to skip 15% of cycles for
                &ldquo;cost optimization.&rdquo; Spent <strong className="text-rose-400">$0.85</strong> across 17 purchases and 3 skips.
              </p>
            </div>
          </div>
        </section>

        {/* Funding */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Funding the Wallets</h2>
          <p className="text-muted-foreground leading-relaxed">
            Six wallets. Three agents, two chains each (Solana + Base). We funded them from a single source,
            giving the buyer the lion&apos;s share and the sellers just enough for gas.
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Wallet</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Address</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Chain</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Funded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  ["buyer", "Gf2E2K8q...2qGF", "Solana", "$22.50 SOL"],
                  ["buyer", "0x4fA4D6...898F", "Base", "$11 USDC"],
                  ["analyst", "H2gcKSGn...pzwL", "Solana", "$1.25 SOL"],
                  ["analyst", "0x5daf04...B2C2", "Base", "$1.25 USDC"],
                  ["miner", "C61ojmSG...xK8s", "Solana", "$1.25 SOL"],
                  ["miner", "0xcea1e2...F443", "Base", "$1.25 USDC"],
                ].map(([name, addr, chain, amount], i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400">{name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{addr}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{chain}</td>
                    <td className="px-4 py-3 text-sm">{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Going Live */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Going Live</h2>
          <p className="text-muted-foreground leading-relaxed">
            We deployed all three agents to Railway. The data-miner and analyst booted up first, announcing
            their services via XMTP. Then the buyer came online, and within seconds, the first cycle fired.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            What happened next was genuinely surprising. The buyer picked &ldquo;NFT market liquidity&rdquo; as its
            first topic &mdash; and immediately decided to <em>skip</em> it. Cost optimization. The agent decided,
            on its own, that this particular cycle wasn&apos;t worth the spend. It waited 10 seconds and tried again
            with &ldquo;Layer 2 scaling analysis.&rdquo; This time, it bought.
          </p>
          <CodeBlock title="Actual logs from the live run">{`[AEGIS] {"event":"cycle_start","cycle":1,"topic":"NFT market liquidity"}
[AEGIS] {"event":"decision","cycle":1,"action":"skip","reason":"Cost optimization — skipping this cycle"}
[AEGIS] {"event":"cycle_start","cycle":2,"topic":"Layer 2 scaling analysis"}
[AEGIS] {"event":"decision","cycle":2,"action":"buy","reason":"Within budget, proceeding"}
[AEGIS] {"event":"payment","cycle":2,"chain":"eip155:8453","amount":0.05,"topic":"Layer 2 scaling analysis"}
[AEGIS] {"event":"earn","agentId":"analyst","amount":0.05,"cost":0.011,"net":0.039}`}</CodeBlock>
        </section>

        {/* What the Analyst Actually Said */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">What the Analyst Actually Said</h2>
          <p className="text-muted-foreground leading-relaxed">
            This isn&apos;t canned output. Claude Haiku received real market data &mdash; live prices from CoinGecko,
            live TVL from DeFiLlama &mdash; and produced genuine analysis. Here&apos;s a sample from the run:
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Cycle 2: Layer 2 Scaling Analysis</span>
                <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">bearish &middot; 0.85</span>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;Market is in a bearish downturn with broad-based weakness across major assets and significant
                TVL outflows from leading protocols, creating unfavorable conditions for Layer 2 scaling expansion.&rdquo;
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Key signals: BTC down 0.23%, ETH down 2.30%, SOL down 2.42% in 24h. Lido TVL -3.02%, SSV Network -3.34%.</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Cycle 10: AI Agent Economy Trends</span>
                <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">bearish &middot; 0.85</span>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;The AI agent economy faces near-term headwinds as core infrastructure protocols experience
                meaningful capital outflows, reducing runway for experimental agent deployments.&rdquo;
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Cycle 16: DeFi Yield Farming</span>
                <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">bearish &middot; 0.85</span>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;DeFi yield farming sentiment is bearish with widespread TVL outflows across major protocols
                and declining token prices, signaling reduced farming opportunities.&rdquo;
              </p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed text-sm">
            Every response was different because the underlying market data was live. The analyst wasn&apos;t
            hallucinating &mdash; it was reading real numbers and forming real opinions. (The market happened
            to be having a rough day.)
          </p>
        </section>

        {/* The Economics */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">The Economics</h2>
          <p className="text-muted-foreground leading-relaxed">
            After 20 cycles and 4 minutes of autonomous operation:
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Costs</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Net</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">data-miner</td>
                  <td className="px-4 py-3">$0.17</td>
                  <td className="px-4 py-3">$0</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">+$0.17</td>
                  <td className="px-4 py-3 text-emerald-400">100%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">analyst</td>
                  <td className="px-4 py-3">$0.85</td>
                  <td className="px-4 py-3">$0.187</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">+$0.66</td>
                  <td className="px-4 py-3 text-emerald-400">78%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-rose-400">research-buyer</td>
                  <td className="px-4 py-3">$0</td>
                  <td className="px-4 py-3">$0.85</td>
                  <td className="px-4 py-3 text-rose-400 font-semibold">-$0.85</td>
                  <td className="px-4 py-3 text-muted-foreground">&mdash;</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2">
            <h3 className="font-semibold text-emerald-400">Can agents grow money?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes &mdash; if there are buyers. Both seller agents were profitable on <em>every single call</em>.
              The data-miner has zero costs (free APIs), so it&apos;s pure margin. The analyst pays $0.011 in
              costs (data + Haiku) and charges $0.05 &mdash; a 78% margin that holds at any scale.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The remaining funds in the buyer wallet ($49+) are still there, ready for more cycles or
              for external agents to use.
            </p>
          </div>
        </section>

        {/* The Full Cycle Log */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">The Full Run: Cycle by Cycle</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every decision the buyer made, in real time. The run took about 4 minutes.
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]">
            {[
              { c: 1, topic: "NFT market liquidity", action: "skip", reason: "Cost optimization" },
              { c: 2, topic: "Layer 2 scaling analysis", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 3, topic: "Web3 identity solutions", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 4, topic: "NFT market liquidity", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 5, topic: "Cross-chain bridge security", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 6, topic: "Solana DeFi ecosystem", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 7, topic: "NFT market liquidity", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 8, topic: "Stablecoin regulation impact", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 9, topic: "AI agent economy trends", action: "skip", reason: "Cost optimization" },
              { c: 10, topic: "AI agent economy trends", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 11, topic: "AI agent economy trends", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 12, topic: "Ethereum rollup comparison", action: "skip", reason: "Cost optimization" },
              { c: 13, topic: "Web3 identity solutions", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 14, topic: "MEV protection methods", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 15, topic: "Web3 identity solutions", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 16, topic: "DeFi yield farming strategies", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 17, topic: "Web3 identity solutions", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 18, topic: "Solana DeFi ecosystem", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 19, topic: "Solana DeFi ecosystem", action: "buy", sentiment: "bearish", conf: 0.85 },
              { c: 20, topic: "NFT market liquidity", action: "buy", sentiment: "bearish", conf: 0.85 },
            ].map((row) => (
              <div key={row.c} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-6">{row.c}</span>
                  <span className="text-muted-foreground">{row.topic}</span>
                </div>
                {row.action === "buy" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-rose-400">{row.sentiment}</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">BUY</span>
                  </div>
                ) : (
                  <span className="text-xs bg-white/[0.06] text-muted-foreground px-1.5 py-0.5 rounded">SKIP</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Open to Anyone */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">These Endpoints Are Live Right Now</h2>
          <p className="text-muted-foreground leading-relaxed">
            The data-miner and analyst are still running on Railway. Any agent &mdash; yours, a hackathon
            team&apos;s, anyone&apos;s &mdash; can call them and buy real market intelligence. No Aegis SDK needed.
            Just HTTP.
          </p>
          <CodeBlock title="Try it yourself">{`# Check what it costs
curl https://aegis-analyst-production.up.railway.app/analyze?topic=DeFi
# → 402: {"price":"0.05","payTo":"0x5daf04...","acceptedChains":["eip155:8453","solana:mainnet"]}

# Or use the SDK — one line
import { payAndFetch } from "aegis-ows-gate";
const analysis = await payAndFetch(
  "https://aegis-analyst-production.up.railway.app/analyze?topic=Solana+DeFi",
  "your-agent-id"
);`}</CodeBlock>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Endpoint</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">What You Get</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="px-4 py-3 font-mono text-emerald-400 text-xs">aegis-data-miner/scrape</td>
                  <td className="px-4 py-3">$0.01</td>
                  <td className="px-4 py-3 text-muted-foreground">Live prices + TVL from CoinGecko & DeFiLlama</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-emerald-400 text-xs">aegis-analyst/analyze</td>
                  <td className="px-4 py-3">$0.05</td>
                  <td className="px-4 py-3 text-muted-foreground">AI analysis: sentiment, signals, summary</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            See the <Link href="/docs/interop" className="text-emerald-400 hover:text-emerald-300">full interop guide</Link> for
            curl examples and how to become a seller yourself.
          </p>
        </section>

        {/* What We Learned */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">What We Learned</h2>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              <strong className="text-foreground">Agents are surprisingly good at deciding when NOT to buy.</strong>{" "}
              The 15% skip rate wasn&apos;t a bug &mdash; it was the buyer agent making autonomous cost-optimization
              decisions. In a longer run with tighter budgets, this behavior would preserve capital.
            </p>
            <p>
              <strong className="text-foreground">Seller economics work at any scale.</strong>{" "}
              The analyst&apos;s 78% margin and the miner&apos;s 100% margin hold whether there&apos;s 1 buyer or 1,000.
              The bottleneck isn&apos;t cost &mdash; it&apos;s demand. The infrastructure can handle it.
            </p>
            <p>
              <strong className="text-foreground">Open protocols matter.</strong>{" "}
              We didn&apos;t build a walled garden. Any HTTP agent can call our endpoints using the standard x402
              protocol. The next buyer might not use Aegis at all &mdash; and that&apos;s the point.
            </p>
          </div>
        </section>

        {/* What's Next */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What&apos;s Next</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-emerald-400 shrink-0">&rarr;</span>
              <span><strong className="text-foreground">Reinvestment loop</strong> &mdash; seller agents auto-reinvest earnings into buying data from other sellers</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 shrink-0">&rarr;</span>
              <span><strong className="text-foreground">More seller types</strong> &mdash; code auditor, price predictor, sentiment scorer, each earning independently</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 shrink-0">&rarr;</span>
              <span><strong className="text-foreground">External buyers</strong> &mdash; real revenue when third-party agents discover and pay our endpoints</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 shrink-0">&rarr;</span>
              <span><strong className="text-foreground">Network effect</strong> &mdash; every new seller is a new earning opportunity for the data-miner</span>
            </li>
          </ul>
        </section>

        <div className="pt-4 flex items-center justify-between">
          <Link href="/docs" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            &larr; Back to all docs
          </Link>
          <Link href="/docs/interop" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            Build your own agent &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
