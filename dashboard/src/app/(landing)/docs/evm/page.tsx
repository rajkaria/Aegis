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
    { id: "overview", label: "Why EVM for Agents?" },
    { id: "supported-chains", label: "Supported Chains" },
    { id: "quick-start", label: "Quick Start" },
    { id: "auto-chain", label: "Auto-Chain Selection" },
    { id: "erc20-tokens", label: "ERC-20 Tokens" },
    { id: "gas-estimation", label: "Gas Estimation" },
    { id: "receipt-anchoring", label: "Receipt Anchoring" },
    { id: "ens-resolution", label: "ENS Resolution" },
    { id: "contract-interactions", label: "Contract Interactions" },
    { id: "gate-integration", label: "Gate Integration" },
    { id: "env-vars", label: "Environment Variables" },
    { id: "hackathon", label: "Hackathon Ideas" },
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

export default function EVMDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />

      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
            EVM Chains
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">EVM Multi-Chain Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Native payments on Ethereum, Base, Polygon, Arbitrum, and Optimism &mdash; unified PaymentRouter with auto-chain selection for cost-optimized agent transactions.
          </p>
        </div>

        {/* Why EVM */}
        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why EVM for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\uD83D\uDD17", title: "Unified PaymentRouter", desc: "Single API for all EVM chains — same code, any chain, auto-picks cheapest" },
              { icon: "\u26A1", title: "Sub-cent L2 Fees", desc: "Base and Optimism transactions cost ~$0.001 — ideal for agent micropayments" },
              { icon: "\uD83E\uDE99", title: "USDC Native", desc: "USDC deployed natively on all major EVM chains for stable-value agent payments" },
              { icon: "\uD83D\uDCC4", title: "Receipt Anchoring", desc: "0-value calldata receipts on L2s cost ~$0.001 — permanent on-chain proof" },
              { icon: "\uD83D\uDCD6", title: "ENS Resolution", desc: "Pay to .eth names — agents use human-readable addresses for discovery" },
              { icon: "\uD83E\uDD1D", title: "Contract Interactions", desc: "Generic ABI read/write for DeFi integrations and on-chain agent coordination" },
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

        {/* Supported Chains */}
        <SectionAnchor id="supported-chains">
          <h2 className="text-2xl font-bold mb-4">Supported Chains</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Chain</th>
                  <th className="text-left p-3 font-semibold">CAIP-2 ID</th>
                  <th className="text-left p-3 font-semibold">Native Token</th>
                  <th className="text-left p-3 font-semibold">Gas Cost</th>
                  <th className="text-left p-3 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr>
                  <td className="p-3 font-semibold">Ethereum</td>
                  <td className="p-3 font-mono text-xs text-indigo-400">eip155:1</td>
                  <td className="p-3 text-muted-foreground">ETH</td>
                  <td className="p-3 text-muted-foreground">~$2&ndash;10</td>
                  <td className="p-3 text-muted-foreground">High-value, ENS</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Base <span className="text-xs text-emerald-400 ml-1">recommended</span></td>
                  <td className="p-3 font-mono text-xs text-indigo-400">eip155:8453</td>
                  <td className="p-3 text-muted-foreground">ETH</td>
                  <td className="p-3 text-muted-foreground">~$0.001</td>
                  <td className="p-3 text-muted-foreground">Agent micropayments</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Polygon</td>
                  <td className="p-3 font-mono text-xs text-indigo-400">eip155:137</td>
                  <td className="p-3 text-muted-foreground">POL</td>
                  <td className="p-3 text-muted-foreground">~$0.01</td>
                  <td className="p-3 text-muted-foreground">High throughput</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Arbitrum</td>
                  <td className="p-3 font-mono text-xs text-indigo-400">eip155:42161</td>
                  <td className="p-3 text-muted-foreground">ETH</td>
                  <td className="p-3 text-muted-foreground">~$0.01</td>
                  <td className="p-3 text-muted-foreground">DeFi ecosystem</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Optimism</td>
                  <td className="p-3 font-mono text-xs text-indigo-400">eip155:10</td>
                  <td className="p-3 text-muted-foreground">ETH</td>
                  <td className="p-3 text-muted-foreground">~$0.005</td>
                  <td className="p-3 text-muted-foreground">Superchain</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Quick Start */}
        <SectionAnchor id="quick-start">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Three lines to send a payment on any EVM chain. The <code className="text-emerald-400">PaymentRouter</code> handles RPC selection, gas estimation, and signing.
          </p>
          <CodeBlock title="Send a payment on Base">{`import { PaymentRouter } from "@aegis-ows/integrations";

const router = new PaymentRouter();
const result = await router.sendPayment({
  chain: "eip155:8453",       // Base
  to: "0xRecipient",
  amount: "5.00",
  token: "USDC",
});

// result.txHash — on-chain transaction hash
// result.chain  — "eip155:8453"
// result.fee    — gas cost in USD`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-sm text-indigo-400 font-semibold mb-1">Base is recommended for agent micropayments</p>
            <p className="text-sm text-muted-foreground">
              At ~$0.001 per transaction, Base makes it economical for agents to pay for every API call. USDC is deployed natively on Base with no bridging required.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Auto-Chain Selection */}
        <SectionAnchor id="auto-chain">
          <h2 className="text-2xl font-bold mb-4">Auto-Chain Selection</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code className="text-emerald-400">sendPaymentAuto</code> picks the cheapest chain from a preferred list at the time of the transaction — real-time gas comparison across all specified chains.
          </p>
          <CodeBlock title="Auto-select cheapest chain">{`import { PaymentRouter } from "@aegis-ows/integrations";

const router = new PaymentRouter();
const result = await router.sendPaymentAuto({
  to: "0xRecipient",
  amount: "10.00",
  token: "USDC",
  chains: ["eip155:8453", "eip155:137", "eip155:42161"],
});

// Automatically picks the chain with lowest gas at execution time
// result.chain — which chain was selected
// result.feeUSD — gas cost in USD (usually <$0.02)`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="font-semibold text-sm mb-2">How auto-selection works</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Fetches current gas prices from each chain in parallel</li>
              <li>Estimates total fee in USD (gas units &times; gas price &times; ETH/USD or POL/USD)</li>
              <li>Selects chain with lowest total fee</li>
              <li>Executes the payment on the winning chain</li>
            </ol>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* ERC-20 Tokens */}
        <SectionAnchor id="erc20-tokens">
          <h2 className="text-2xl font-bold mb-4">ERC-20 Tokens</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Built-in registry covers USDC, USDT, DAI, and WETH on all supported chains. For custom tokens, pass the contract address directly.
          </p>
          <CodeBlock title="Built-in token registry">{`// Built-in tokens — no address needed
await router.sendPayment({ chain: "eip155:8453", to: "0x...", amount: "5.00", token: "USDC" });
await router.sendPayment({ chain: "eip155:1",    to: "0x...", amount: "0.01", token: "WETH" });
await router.sendPayment({ chain: "eip155:137",  to: "0x...", amount: "100",  token: "USDT" });`}</CodeBlock>
          <CodeBlock title="Custom ERC-20 token">{`// Custom token via contract address
await router.sendPayment({
  chain: "eip155:8453",
  to: "0xRecipient",
  amount: "50.00",
  token: "0xContractAddress",  // any ERC-20
});`}</CodeBlock>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Token</th>
                  <th className="text-left p-3 font-semibold">Ethereum</th>
                  <th className="text-left p-3 font-semibold">Base</th>
                  <th className="text-left p-3 font-semibold">Polygon</th>
                  <th className="text-left p-3 font-semibold">Arbitrum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 font-semibold">USDC</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td></tr>
                <tr><td className="p-3 font-semibold">USDT</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-muted-foreground text-xs">Bridged</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td></tr>
                <tr><td className="p-3 font-semibold">DAI</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td></tr>
                <tr><td className="p-3 font-semibold">WETH</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td><td className="p-3 text-emerald-400 text-xs">Native</td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Gas Estimation */}
        <SectionAnchor id="gas-estimation">
          <h2 className="text-2xl font-bold mb-4">Gas Estimation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Estimate fees before committing a transaction. Useful for budget enforcement — agents can reject operations that exceed cost thresholds.
          </p>
          <CodeBlock title="Estimate fees for a single payment">{`import { estimatePaymentFees } from "@aegis-ows/integrations";

const estimate = await estimatePaymentFees({
  chain: "eip155:8453",
  to: "0xRecipient",
  amount: "10.00",
  token: "USDC",
});

// {
//   gasUnits: 65000,
//   gasPriceGwei: "0.001",
//   feeETH: "0.000000065",
//   feeUSD: "0.00018"
// }`}</CodeBlock>
          <CodeBlock title="Compare fees across chains">{`import { compareFeesAcrossChains } from "@aegis-ows/integrations";

const comparison = await compareFeesAcrossChains({
  amount: "10.00",
  token: "USDC",
  chains: ["eip155:1", "eip155:8453", "eip155:137", "eip155:42161"],
});

// Returns sorted array, cheapest first:
// [
//   { chain: "eip155:8453",  feeUSD: "0.00018", name: "Base" },
//   { chain: "eip155:42161", feeUSD: "0.00850", name: "Arbitrum" },
//   { chain: "eip155:137",   feeUSD: "0.01200", name: "Polygon" },
//   { chain: "eip155:1",     feeUSD: "4.20000", name: "Ethereum" },
// ]`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Receipt Anchoring */}
        <SectionAnchor id="receipt-anchoring">
          <h2 className="text-2xl font-bold mb-4">Receipt Anchoring</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Every Aegis payment generates a SHA-256 receipt hash. The hash is anchored on-chain via a 0-value self-transfer with the receipt in calldata &mdash; costs ~$0.001 on L2s.
          </p>
          <CodeBlock title="Anchor a receipt on Base">{`import { anchorReceiptEVM } from "@aegis-ows/integrations";

const proofTx = await anchorReceiptEVM({
  receiptHash: "sha256:abc123...",
  chain: "eip155:8453",         // Base — ~$0.001
  agentAddress: "0xAgent",
});

// proofTx.txHash — transaction on Base with receipt in calldata
// Anyone can inspect the calldata: AEGIS_RECEIPT:<hash>
// Verifiable on Basescan forever`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-400 font-semibold mb-1">Permanent proof, minimal cost</p>
            <p className="text-sm text-muted-foreground">
              A 0-value self-transfer with calldata costs ~65,000 gas. On Base at sub-cent gas prices, that is roughly $0.001 per receipt &mdash; economical enough to anchor every single payment.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* ENS Resolution */}
        <SectionAnchor id="ens-resolution">
          <h2 className="text-2xl font-bold mb-4">ENS Resolution</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use <code className="text-emerald-400">.eth</code> names as payment addresses. Aegis resolves them to the underlying EVM address before sending.
          </p>
          <CodeBlock title="Pay to an ENS name">{`import { resolveENS, PaymentRouter } from "@aegis-ows/integrations";

// Resolve a .eth name
const address = await resolveENS("analyst.eth");
// "0x1234...abcd"

// Or pass directly to PaymentRouter — it resolves automatically
const router = new PaymentRouter();
await router.sendPayment({
  chain: "eip155:1",        // ENS lives on Ethereum mainnet
  to: "analyst.eth",        // resolved automatically
  amount: "5.00",
  token: "USDC",
});`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm text-muted-foreground">
              ENS resolution always queries Ethereum mainnet regardless of the payment chain. The resolved address is used for the payment on the target chain.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Contract Interactions */}
        <SectionAnchor id="contract-interactions">
          <h2 className="text-2xl font-bold mb-4">Contract Interactions</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Generic ABI read and write for DeFi integrations and on-chain agent coordination. Read-only calls are free; writes cost gas.
          </p>
          <CodeBlock title="Read from a contract">{`import { contractRead } from "@aegis-ows/integrations";

// Read USDC balance from any ERC-20
const balance = await contractRead({
  chain: "eip155:8453",
  address: "0xUSDCContractAddress",
  abi: ["function balanceOf(address) view returns (uint256)"],
  method: "balanceOf",
  args: ["0xAgentAddress"],
});
// balance: BigInt`}</CodeBlock>
          <CodeBlock title="Encode a contract write">{`import { encodeContractWrite } from "@aegis-ows/integrations";

// Encode calldata for a contract write
const calldata = encodeContractWrite({
  abi: ["function approve(address spender, uint256 amount)"],
  method: "approve",
  args: ["0xSpender", BigInt("1000000")],
});

// Send as a raw transaction via PaymentRouter
await router.sendRawTransaction({
  chain: "eip155:8453",
  to: "0xContractAddress",
  data: calldata,
});`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Gate Integration */}
        <SectionAnchor id="gate-integration">
          <h2 className="text-2xl font-bold mb-4">Gate Integration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Multi-chain x402 middleware accepts payment proof from any of the specified EVM chains. The gate verifies the on-chain transaction before granting access.
          </p>
          <CodeBlock title="Multi-chain x402 middleware">{`import { aegisGate } from "aegis-ows-gate";

app.use(aegisGate({
  price: "0.01",
  token: "USDC",
  agentId: "my-agent",
  acceptedChains: ["eip155:8453", "eip155:137"],
}));

// Clients can pay from Base or Polygon — gate accepts either
// Payment verified on-chain before access is granted
// Receipts anchored to the cheapest accepted chain`}</CodeBlock>
          <CodeBlock title="Client-side payment (payAndFetch)">{`import { payAndFetch } from "aegis-ows-gate";

const response = await payAndFetch("https://api.myservice.com/data", {
  network: "eip155:8453",    // Pay from Base
  walletAddress: "0xAgent",
});`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Environment Variables */}
        <SectionAnchor id="env-vars">
          <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Set chain-specific RPC endpoints. <code className="text-emerald-400">EVM_RPC_URL</code> is used as a fallback when no chain-specific URL is set. Public endpoints are used if no variables are configured.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Variable</th>
                  <th className="text-left p-3 font-semibold">Description</th>
                  <th className="text-left p-3 font-semibold">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3 font-mono text-xs text-emerald-400">EVM_RPC_URL</td><td className="p-3 text-muted-foreground text-xs">Fallback RPC for any EVM chain</td><td className="p-3 text-muted-foreground text-xs">No</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">ETHEREUM_RPC_URL</td><td className="p-3 text-muted-foreground text-xs">Ethereum mainnet RPC endpoint</td><td className="p-3 text-muted-foreground text-xs">No</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">BASE_RPC_URL</td><td className="p-3 text-muted-foreground text-xs">Base mainnet RPC endpoint</td><td className="p-3 text-muted-foreground text-xs">No</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">POLYGON_RPC_URL</td><td className="p-3 text-muted-foreground text-xs">Polygon mainnet RPC endpoint</td><td className="p-3 text-muted-foreground text-xs">No</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">ARBITRUM_RPC_URL</td><td className="p-3 text-muted-foreground text-xs">Arbitrum One RPC endpoint</td><td className="p-3 text-muted-foreground text-xs">No</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">OPTIMISM_RPC_URL</td><td className="p-3 text-muted-foreground text-xs">Optimism mainnet RPC endpoint</td><td className="p-3 text-muted-foreground text-xs">No</td></tr>
                <tr><td className="p-3 font-mono text-xs text-emerald-400">SEPOLIA_RPC_URL</td><td className="p-3 text-muted-foreground text-xs">Sepolia testnet RPC (for dev)</td><td className="p-3 text-muted-foreground text-xs">No</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-400 font-semibold mb-1">Graceful degradation</p>
            <p className="text-sm text-muted-foreground">
              Public RPC endpoints are used when no env vars are set. For production, configure dedicated RPC endpoints (Alchemy, Infura, QuickNode) to avoid rate limits and improve reliability.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        {/* Hackathon Ideas */}
        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard icon="\uD83E\uDD16" title="Agent Micropayments on Base" description="Deploy an agent economy where every API call is paid in USDC on Base. Near-zero fees make per-call billing economical at any scale." example="$0.001 USDC per API call on Base" />
            <UseCaseCard icon="\uD83D\uDCC8" title="Cross-Chain Arbitrage Bots" description="Agents monitor price differences across chains and exploit arbitrage. Auto-chain selection optimizes net profit after gas." example="router.sendPaymentAuto({ chains: [...] })" />
            <UseCaseCard icon="\u26FD" title="Gas-Optimized Payment Routing" description="Build a routing layer that always picks the cheapest chain for a given payment size. Agents save gas by routing dynamically." example="compareFeesAcrossChains({ amount, chains })" />
            <UseCaseCard icon="\uD83E\uDD1D" title="DeFi Agent with Contract Interactions" description="Agents that interact with DeFi protocols (Uniswap, Aave) to earn yield on idle budget. Read balances, approve spends, execute swaps." example="contractRead({ chain, address, method })" />
          </div>
        </SectionAnchor>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/solana" className="hover:text-foreground transition-colors">Solana &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
