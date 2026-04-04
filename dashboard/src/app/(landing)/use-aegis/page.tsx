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

function UseCaseSection({
  number,
  title,
  description,
  track,
  installCmd,
  serverCode,
  serverCodeTitle,
  testCode,
  testCodeTitle,
  explanation,
}: {
  number: string;
  title: string;
  description: string;
  track: string;
  installCmd: string;
  serverCode: string;
  serverCodeTitle: string;
  testCode?: string;
  testCodeTitle?: string;
  explanation: string[];
}) {
  return (
    <div className="mb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
          {number}
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {track}
        </span>
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        {description}
      </p>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Install
      </h3>
      <CodeBlock title="Terminal">{installCmd}</CodeBlock>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3">
        Code
      </h3>
      <CodeBlock title={serverCodeTitle}>{serverCode}</CodeBlock>

      {testCode && (
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3">
            Test it
          </h3>
          <CodeBlock title={testCodeTitle || "Terminal"}>{testCode}</CodeBlock>
        </>
      )}

      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3">
        What happens
      </h3>
      <div className="space-y-2">
        {explanation.map((line, i) => (
          <div key={i} className="flex gap-3 items-start text-sm">
            <span className="text-emerald-400 font-mono shrink-0 mt-0.5">
              &rarr;
            </span>
            <span className="text-muted-foreground leading-relaxed">
              {line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UseAegisPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
            Integration Guide
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Use Aegis in Your Project
          </h1>
          <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
            Aegis is published on npm and works with any Express app. Three real
            use cases, complete code, copy and paste.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href="https://www.npmjs.com/package/aegis-ows-gate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              npm: aegis-ows-gate@0.3.0
            </a>
            <a
              href="https://www.npmjs.com/package/aegis-ows-shared"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-colors"
            >
              npm: aegis-ows-shared@0.2.0
            </a>
          </div>
        </div>

        {/* Use Case 1: Monetize Any API */}
        <UseCaseSection
          number="1"
          title="Monetize Any API"
          description="Turn any Express endpoint into a paid service. One middleware line adds x402 micropayments &mdash; agents pay per call, you earn per call."
          track="Track 3 &mdash; API Monetization"
          installCmd={`npm install aegis-ows-gate express`}
          serverCodeTitle="server.js &mdash; complete, runnable"
          serverCode={`import express from "express";
import { aegisGate } from "aegis-ows-gate";

const app = express();

// Your API is now paid — $0.001 SOL per call
app.get("/api/data",
  aegisGate({ price: "0.001", token: "SOL", agentId: "my-service" }),
  (req, res) => {
    res.json({ result: "your data here" });
  }
);

app.listen(3000, () => {
  console.log("Paid API running on http://localhost:3000");
});`}
          testCode={`# Without payment → 402 Payment Required
curl http://localhost:3000/api/data
# Returns: { "error": "Payment Required", "x402": { "price": "0.001", "token": "SOL", ... } }

# With payment → 200 OK
curl http://localhost:3000/api/data \\
  -H 'X-PAYMENT: {"fromAgent":"buyer","txHash":"sig-123456789012345678","timestamp":"2026-04-04T00:00:00Z","deadline":9999999999}'
# Returns: { "result": "your data here" }`}
          testCodeTitle="Terminal &mdash; test with curl"
          explanation={[
            "Unpaid requests get a 402 response with payment instructions (price, token, payment address).",
            "Callers include an X-PAYMENT header with a signed payment proof.",
            "Gate verifies the proof, credits your agent's earnings ledger, and passes the request through.",
            "Every payment appears in the Aegis Nexus dashboard automatically.",
          ]}
        />

        <hr className="border-white/[0.06] my-12" />

        {/* Use Case 2: Agent-to-Agent Payments */}
        <UseCaseSection
          number="2"
          title="Agent-to-Agent Payments"
          description="One agent pays another for a service. payAndFetch handles the full x402 handshake &mdash; discover the price, sign the payment through OWS, get the content."
          track="Track 4 &mdash; Multi-Agent"
          installCmd={`npm install aegis-ows-gate`}
          serverCodeTitle="buyer-agent.js &mdash; pay for a service"
          serverCode={`import { payAndFetch } from "aegis-ows-gate";

// Agent discovers and pays for a service — one line
const result = await payAndFetch(
  "http://data-service:3000/api/data",
  "buyer-agent"
);

console.log(result); // The paid content

// What happened under the hood:
// 1. payAndFetch called the URL, got a 402 response
// 2. Read the price from the x402 payment details
// 3. Signed the payment through OWS (all policies checked)
// 4. Re-sent the request with the payment proof
// 5. Returned the 200 response body`}
          explanation={[
            "payAndFetch abstracts the entire payment flow into a single async call.",
            "The payment goes through OWS's signing enclave, so all active policies (budget, guard, deadswitch) are enforced.",
            "Both the buyer's spend and the seller's earnings are recorded in the Aegis ledger.",
            "Works with any Aegis Gate-protected endpoint, across agents, across machines.",
          ]}
        />

        <hr className="border-white/[0.06] my-12" />

        {/* Use Case 3: Add Spending Policies */}
        <UseCaseSection
          number="3"
          title="Add Spending Policies"
          description="Control how much your agent can spend, which addresses it can pay, and kill it if it goes silent. Three policy executables plug directly into OWS."
          track="Track 2 &mdash; Spend Governance"
          installCmd={`npm install aegis-ows-shared`}
          serverCodeTitle="budget-policy.json &mdash; spending limits"
          serverCode={`{
  "limits": [
    {
      "chainId": "solana:devnet",
      "token": "SOL",
      "daily": "1.00",
      "weekly": "5.00",
      "monthly": "15.00"
    },
    {
      "chainId": "eip155:1",
      "token": "USDC",
      "daily": "10.00",
      "weekly": "50.00"
    }
  ]
}`}
          testCode={`# Register policies with OWS
ows policy create \\
  --name aegis-budget \\
  --executable ./node_modules/.bin/aegis-budget \\
  --config ./budget-policy.json

# Or use the Aegis CLI for guided setup
npx aegis-ows-cli install`}
          testCodeTitle="Terminal &mdash; register with OWS"
          explanation={[
            "aegis-budget enforces per-chain, per-token spending caps (daily, weekly, monthly).",
            "aegis-guard maintains an address allowlist/blocklist so agents only pay trusted recipients.",
            "aegis-deadswitch revokes signing keys after a configurable period of inactivity.",
            "All three plug into OWS's policy engine via stdin/stdout &mdash; the standard extension point.",
          ]}
        />

        <hr className="border-white/[0.06] my-12" />

        {/* Bottom CTA */}
        <div className="text-center py-12">
          <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg mx-auto">
            Aegis is open source and published on npm. Use it in your hackathon
            project, or build on top of it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.npmjs.com/package/aegis-ows-gate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              npm
            </a>
            <a
              href="https://github.com/rajkaria/aegis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-colors"
            >
              Full Docs
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-colors"
            >
              Live Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
