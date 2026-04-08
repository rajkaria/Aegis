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
      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
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
    { id: "overview", label: "Why OWS for Agents?" },
    { id: "aegis-usage", label: "What Aegis Uses OWS For" },
    { id: "use-cases", label: "Use Cases" },
    { id: "architecture", label: "Architecture" },
    { id: "signing", label: "Transaction Signing" },
    { id: "derivation", label: "Key Derivation" },
    { id: "multi-chain", label: "Multi-Chain Support" },
    { id: "payment-flow", label: "Payment Flow with OWS" },
    { id: "security", label: "Security Model" },
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

export default function OWSDocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <TableOfContents />
      <div className="max-w-3xl mx-auto px-6 xl:ml-[calc(50%-18rem)]">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Docs</Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-medium mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Open Wallet Standard
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">OWS Integration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Multi-chain wallet management, deterministic key derivation, and in-process transaction signing &mdash; one seed phrase, every chain.
          </p>
        </div>

        <SectionAnchor id="overview">
          <h2 className="text-2xl font-bold mb-6">Why OWS for Agents?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "\uD83D\uDD11", title: "One Seed, Every Chain", desc: "Single BIP-39 mnemonic derives wallets on Solana, Ethereum, XRP, and more" },
              { icon: "\uD83D\uDD10", title: "In-Process Signing", desc: "Sign transactions without CLI shell-out — no race conditions" },
              { icon: "\uD83C\uDF10", title: "8 Chains Supported", desc: "Solana, Ethereum, Base, Bitcoin, Cosmos, Tron, TON, Sui" },
              { icon: "\uD83E\uDDE9", title: "Deterministic", desc: "Same seed + wallet name = same address. Always. Reproducible across machines." },
              { icon: "\uD83D\uDEE1\uFE0F", title: "Keys Never Touch Disk", desc: "Private keys derived on-demand in memory, never persisted" },
              { icon: "\uD83D\uDD13", title: "Open Standard", desc: "Not locked to any wallet provider — portable across frameworks" },
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
          <h2 className="text-2xl font-bold mb-4">What Aegis Uses OWS For</h2>
          <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-emerald-400 mb-1">Agent Wallet Creation</h4>
              <p className="text-sm text-muted-foreground">Each agent gets a unique wallet derived from the master seed + its name. <code className="text-emerald-400 text-xs">&quot;data-miner&quot;</code> on Solana always yields the same address.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-emerald-400 mb-1">Solana Payment Signing</h4>
              <p className="text-sm text-muted-foreground">All SOL transfers and receipt anchoring use <code className="text-emerald-400 text-xs">signTransaction()</code> for in-process ed25519 signatures.</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="font-semibold text-emerald-400 mb-1">Agent Identity</h4>
              <p className="text-sm text-muted-foreground">Wallet addresses serve as unique agent IDs. Deterministic derivation means identity is portable across deployments.</p>
            </div>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="use-cases">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <UseCaseCard icon="\uD83D\uDD11" title="Agent Wallet Management" description="One seed phrase creates unique wallets per agent per chain. 3 agents × 8 chains = 24 wallets from one seed." example='signTransaction("data-miner", "solana", hex)' />
            <UseCaseCard icon="\uD83D\uDD10" title="Secure Signing" description="Private keys derived on-demand in process memory. Never written to disk, never passed via CLI args." example="OWS sign → ed25519 signature → broadcast" />
            <UseCaseCard icon="\uD83C\uDF10" title="Multi-Chain Identity" description="Same agent has consistent identity across Solana, Ethereum, and XRP. Wallet address is the universal ID." example="data-miner: SOL + ETH + XRP addresses" />
            <UseCaseCard icon="\uD83C\uDFED" title="Fleet Key Management" description="Deterministic derivation means you can reproduce any agent's wallet on any machine with the seed." example="seed + name → same wallet everywhere" />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="architecture">
          <h2 className="text-2xl font-bold mb-4">Architecture</h2>
          <CodeBlock title="Key Derivation Architecture">{`WALLET_SEED (BIP-39 Mnemonic — 12 or 24 words)
     │
     ▼
OWS Key Derivation Engine
     │
     ├── "data-miner" + "solana"    → ed25519 keypair → 2G55Sds...YCcq
     ├── "data-miner" + "ethereum"  → secp256k1 keypair → 0x1234...
     ├── "analyst" + "solana"       → ed25519 keypair → CePyeK...eSkL
     ├── "analyst" + "ethereum"     → secp256k1 keypair → 0x5678...
     └── "research-buyer" + "solana"→ ed25519 keypair → 9LK89M...Y22A

Same seed + same name + same chain = same wallet. Always.`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="signing">
          <h2 className="text-2xl font-bold mb-4">Transaction Signing</h2>
          <CodeBlock title="Sign a Solana transaction in-process">{`import { signTransaction } from "@open-wallet-standard/core";

// Build your transaction (e.g., Solana SystemProgram.transfer)
const messageBytes = transaction.serializeMessage();
const messageHex = Buffer.from(messageBytes).toString("hex");

// Sign in-process — key derived from seed, never touches disk
const result = signTransaction(
  "data-miner",    // wallet name
  "solana",        // chain
  messageHex       // serialized transaction as hex
);

// Add signature to transaction
const signatureBytes = Buffer.from(result.signature, "hex");
transaction.addSignature(fromPubkey, signatureBytes);

// Broadcast the fully-signed transaction
const txHash = await connection.sendRawTransaction(transaction.serialize());`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="font-semibold text-sm mb-2">Why in-process signing matters</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>No CLI shell-out — avoids blockhash race conditions</li>
              <li>No private key in environment variables or command args</li>
              <li>Key derived, used, and discarded in the same process</li>
              <li>Atomic: sign + broadcast happens in sequence, no gap</li>
            </ul>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="derivation">
          <h2 className="text-2xl font-bold mb-4">Key Derivation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            OWS uses deterministic key derivation: <strong>seed + wallet name + chain = keypair</strong>. The same inputs always produce the same output.
          </p>
          <CodeBlock title="Deterministic wallet addresses">{`// Same seed, different agents → different wallets:
"data-miner"     on Solana → 2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq
"analyst"        on Solana → CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL
"research-buyer" on Solana → 9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A

// Same seed, same agent, different chain → different wallet:
"data-miner" on Solana   → 2G55Sds... (ed25519)
"data-miner" on Ethereum → 0x1a2b3c... (secp256k1)

// Deploy on a new machine with the same seed → identical wallets`}</CodeBlock>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="multi-chain">
          <h2 className="text-2xl font-bold mb-4">Multi-Chain Support</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left p-3 font-semibold">Chain</th>
                  <th className="text-left p-3 font-semibold">Key Type</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr><td className="p-3">Solana</td><td className="p-3 font-mono text-xs text-emerald-400">ed25519</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span></td></tr>
                <tr><td className="p-3">Ethereum</td><td className="p-3 font-mono text-xs text-emerald-400">secp256k1</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span></td></tr>
                <tr><td className="p-3">Base</td><td className="p-3 font-mono text-xs text-emerald-400">secp256k1</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span></td></tr>
                <tr><td className="p-3">Bitcoin</td><td className="p-3 font-mono text-xs text-muted-foreground">secp256k1</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Planned</span></td></tr>
                <tr><td className="p-3">Cosmos</td><td className="p-3 font-mono text-xs text-muted-foreground">secp256k1</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Planned</span></td></tr>
                <tr><td className="p-3">Tron</td><td className="p-3 font-mono text-xs text-muted-foreground">secp256k1</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Planned</span></td></tr>
                <tr><td className="p-3">TON</td><td className="p-3 font-mono text-xs text-muted-foreground">ed25519</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Planned</span></td></tr>
                <tr><td className="p-3">Sui</td><td className="p-3 font-mono text-xs text-muted-foreground">ed25519</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Planned</span></td></tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="payment-flow">
          <h2 className="text-2xl font-bold mb-6">Payment Flow with OWS</h2>
          <div className="space-y-4 mb-8">
            <StepCard number="1" title="Agent receives payment request" description="x402 Gate responds with 402 status + payment details (price, token, chain, recipient)." />
            <StepCard number="2" title="Gate builds Solana Transaction" description="SystemProgram.transfer with amount in lamports, from agent to recipient." />
            <StepCard number="3" title="Transaction serialized" description="Transaction message serialized to bytes, converted to hex string." />
            <StepCard number="4" title="OWS signs in-process" description="signTransaction() derives the key from seed + wallet name, produces ed25519 signature." />
            <StepCard number="5" title="Signature added to transaction" description="Raw signature bytes added to the Transaction object." />
            <StepCard number="6" title="Broadcast to Solana RPC" description="Signed transaction sent via sendRawTransaction, then confirmed." />
            <StepCard number="7" title="Receipt anchored" description="SHA-256 receipt hash written to Solana Memo program as immutable proof." />
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="security">
          <h2 className="text-2xl font-bold mb-4">Security Model</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { title: "Keys never touch disk", desc: "Private keys are derived on-demand in process memory and discarded after signing." },
              { title: "In-process signing", desc: "No IPC, no CLI shell-out. Sign and broadcast happen atomically in the same process." },
              { title: "No blockhash race", desc: "Previous approach: CLI sign → delayed broadcast → expired blockhash. OWS: sign → broadcast instantly." },
              { title: "Single secret", desc: "The BIP-39 seed phrase is the only secret. Protect it, and all agent wallets are secure." },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <h4 className="font-semibold text-sm text-emerald-400 mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400 font-semibold mb-1">CRITICAL: Never commit WALLET_SEED</p>
            <p className="text-sm text-muted-foreground">
              Store it in <code className="text-emerald-400">.env</code> (gitignored) or a secrets manager. Anyone with the seed can derive all agent wallets and sign transactions.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="setup">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          <CodeBlock title=".env">{`# BIP-39 mnemonic phrase (12 or 24 words)
WALLET_SEED="your twelve word mnemonic phrase goes here for wallet derivation"

# Generate a new seed:
# npx @open-wallet-standard/cli init`}</CodeBlock>
          <CodeBlock title="Install dependency">{`npm install @open-wallet-standard/core`}</CodeBlock>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="font-semibold text-sm mb-2">Same seed = same wallets</h4>
            <p className="text-sm text-muted-foreground">
              If you deploy agents on multiple machines with the same <code className="text-emerald-400">WALLET_SEED</code>, they&apos;ll derive identical wallet addresses. This is by design &mdash; deterministic key derivation makes agent identity portable.
            </p>
          </div>
        </SectionAnchor>

        <hr className="border-white/[0.06] my-12" />

        <SectionAnchor id="hackathon">
          <h2 className="text-2xl font-bold mb-6">Hackathon Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { track: "Wallet Infrastructure", idea: "Multi-chain agent identity system — one seed, portable identity across all chains", color: "emerald" },
              { track: "Security Track", idea: "Zero-knowledge agent wallet management with on-demand key derivation", color: "red" },
              { track: "Agent Framework", idea: "Pluggable wallet backend for any agent framework (LangChain, CrewAI, AutoGPT)", color: "violet" },
              { track: "Enterprise", idea: "HSM-backed OWS for institutional agent deployments with audit trails", color: "sky" },
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
                <tr>
                  <td className="p-3 font-mono text-xs text-emerald-400">signTransaction</td>
                  <td className="p-3 text-muted-foreground text-xs">walletName, chain, messageHex</td>
                  <td className="p-3 text-muted-foreground text-xs">{'{signature: string}'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionAnchor>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="hover:text-foreground transition-colors">&larr; Back to Docs</Link>
            <Link href="/docs/xmtp" className="hover:text-foreground transition-colors">XMTP &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
