"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const KNOWN_AGENTS = [
  {
    name: "data-miner",
    solana: "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
  },
  {
    name: "analyst",
    solana: "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
  },
  {
    name: "research-buyer",
    solana: "9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A",
  },
];

const POLICY_TYPES = ["aegis-budget", "aegis-guard", "aegis-deadswitch"];

type Result = {
  type: "success" | "error";
  message: string;
  link?: string;
};

function GlassCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>
      {children}
    </div>
  );
}

function ResultDisplay({ result }: { result: Result | null }) {
  if (!result) return null;
  const isSuccess = result.type === "success";
  return (
    <div
      className={`mt-4 rounded-lg px-4 py-3 text-sm font-mono whitespace-pre-wrap ${
        isSuccess
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
          : "bg-red-500/10 border border-red-500/20 text-red-300"
      }`}
    >
      {result.message}
      {result.link && (
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-sky-400 underline underline-offset-2 hover:text-sky-300"
        >
          View on Solana Explorer
        </a>
      )}
    </div>
  );
}

async function callManage(body: Record<string, unknown>): Promise<{
  success: boolean;
  output?: string;
  signature?: string;
  txHash?: string;
  error?: string;
}> {
  const res = await fetch("/api/manage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function ManagePage() {
  // -- Create Wallet --
  const [walletName, setWalletName] = useState("");
  const [walletResult, setWalletResult] = useState<Result | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // -- Register Policy --
  const [policyType, setPolicyType] = useState(POLICY_TYPES[0]);
  const [policyResult, setPolicyResult] = useState<Result | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  // -- Create API Key --
  const [keyName, setKeyName] = useState("");
  const [keyWallets, setKeyWallets] = useState("");
  const [keyPolicies, setKeyPolicies] = useState("");
  const [keyResult, setKeyResult] = useState<Result | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  // -- Fund Agent --
  const [fundAgent, setFundAgent] = useState(KNOWN_AGENTS[0].name);
  const [fundAmount, setFundAmount] = useState("1");
  const [fundResult, setFundResult] = useState<Result | null>(null);
  const [fundLoading, setFundLoading] = useState(false);

  // -- Send Payment --
  const [sendFrom, setSendFrom] = useState(KNOWN_AGENTS[0].name);
  const [sendTo, setSendTo] = useState(KNOWN_AGENTS[1].name);
  const [sendAmount, setSendAmount] = useState("0.1");
  const [sendResult, setSendResult] = useState<Result | null>(null);
  const [sendLoading, setSendLoading] = useState(false);

  async function handleCreateWallet() {
    if (!walletName.trim()) return;
    setWalletLoading(true);
    setWalletResult(null);
    try {
      const data = await callManage({
        action: "create_wallet",
        name: walletName.trim(),
      });
      if (data.success) {
        setWalletResult({
          type: "success",
          message: data.output || "Wallet created successfully.",
        });
        setWalletName("");
      } else {
        setWalletResult({
          type: "error",
          message: data.error || "Failed to create wallet.",
        });
      }
    } catch {
      setWalletResult({
        type: "error",
        message: "Request failed. Is OWS installed locally?",
      });
    }
    setWalletLoading(false);
  }

  async function handleRegisterPolicy() {
    setPolicyLoading(true);
    setPolicyResult(null);
    try {
      const data = await callManage({
        action: "register_policy",
        name: policyType,
      });
      if (data.success) {
        setPolicyResult({
          type: "success",
          message: data.output || "Policy registered successfully.",
        });
      } else {
        setPolicyResult({
          type: "error",
          message: data.error || "Failed to register policy.",
        });
      }
    } catch {
      setPolicyResult({
        type: "error",
        message: "Request failed. Is OWS installed locally?",
      });
    }
    setPolicyLoading(false);
  }

  async function handleCreateApiKey() {
    if (!keyName.trim()) return;
    setKeyLoading(true);
    setKeyResult(null);
    try {
      const wallets = keyWallets
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const policies = keyPolicies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const data = await callManage({
        action: "create_apikey",
        name: keyName.trim(),
        wallets,
        policies,
      });
      if (data.success) {
        setKeyResult({
          type: "success",
          message: data.output || "API key created.",
        });
        setKeyName("");
      } else {
        setKeyResult({
          type: "error",
          message: data.error || "Failed to create API key.",
        });
      }
    } catch {
      setKeyResult({
        type: "error",
        message: "Request failed. Is OWS installed locally?",
      });
    }
    setKeyLoading(false);
  }

  async function handleFund() {
    setFundLoading(true);
    setFundResult(null);
    const agent = KNOWN_AGENTS.find((a) => a.name === fundAgent);
    if (!agent) return;
    try {
      const data = await callManage({
        action: "fund_solana",
        address: agent.solana,
        amount: fundAmount,
      });
      if (data.success) {
        setFundResult({
          type: "success",
          message: `Airdrop requested. Signature: ${data.signature}`,
          link: `https://explorer.solana.com/tx/${data.signature}?cluster=devnet`,
        });
      } else {
        setFundResult({
          type: "error",
          message: data.error || "Airdrop failed.",
        });
      }
    } catch {
      setFundResult({ type: "error", message: "Airdrop request failed." });
    }
    setFundLoading(false);
  }

  async function handleSend() {
    setSendLoading(true);
    setSendResult(null);
    const fromAgent = KNOWN_AGENTS.find((a) => a.name === sendFrom);
    const toAgent = KNOWN_AGENTS.find((a) => a.name === sendTo);
    if (!fromAgent || !toAgent) return;
    try {
      const data = await callManage({
        action: "send_sol",
        fromAddress: fromAgent.solana,
        toAddress: toAgent.solana,
        fromWallet: fromAgent.name,
        amount: sendAmount,
      });
      if (data.success) {
        setSendResult({
          type: "success",
          message: `Transaction sent. Hash: ${data.txHash}`,
          link: `https://explorer.solana.com/tx/${data.txHash}?cluster=devnet`,
        });
      } else {
        setSendResult({
          type: "error",
          message: data.error || "Transaction failed.",
        });
      }
    } catch {
      setSendResult({ type: "error", message: "Transaction request failed." });
    }
    setSendLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Wallets, policies, funding, and payments — everything the CLI does,
          from the browser.
        </p>
      </div>

      <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-4 py-3 text-sm text-sky-300">
        Management features require OWS installed locally. On Vercel, wallet
        operations are view-only.
      </div>

      <div className="grid gap-6">
        {/* Section 1: Create Wallet */}
        <GlassCard
          title="Create Agent Wallet"
          description="Create a new OWS wallet with derived addresses across all supported chains."
        >
          <div className="flex gap-3">
            <Input
              placeholder="Wallet name (e.g. my-agent)"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="flex-1 bg-white/[0.03] border-white/[0.08]"
            />
            <Button
              onClick={handleCreateWallet}
              disabled={walletLoading || !walletName.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {walletLoading ? "Creating..." : "Create Wallet"}
            </Button>
          </div>
          <ResultDisplay result={walletResult} />
        </GlassCard>

        {/* Section 2: Register Policy */}
        <GlassCard
          title="Register Policy"
          description="Register an Aegis policy executable with the OWS runtime."
        >
          <div className="flex gap-3">
            <select
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
              className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus:border-ring"
            >
              {POLICY_TYPES.map((p) => (
                <option key={p} value={p} className="bg-zinc-900">
                  {p}
                </option>
              ))}
            </select>
            <Button
              onClick={handleRegisterPolicy}
              disabled={policyLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {policyLoading ? "Registering..." : "Register with OWS"}
            </Button>
          </div>
          <ResultDisplay result={policyResult} />
        </GlassCard>

        {/* Section 3: Create API Key */}
        <GlassCard
          title="Create API Key"
          description="Generate an API key bound to specific wallets and policies."
        >
          <div className="space-y-3">
            <Input
              placeholder="Key name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="bg-white/[0.03] border-white/[0.08]"
            />
            <Input
              placeholder="Wallets (comma-separated names)"
              value={keyWallets}
              onChange={(e) => setKeyWallets(e.target.value)}
              className="bg-white/[0.03] border-white/[0.08]"
            />
            <Input
              placeholder="Policies (comma-separated names)"
              value={keyPolicies}
              onChange={(e) => setKeyPolicies(e.target.value)}
              className="bg-white/[0.03] border-white/[0.08]"
            />
            <Button
              onClick={handleCreateApiKey}
              disabled={keyLoading || !keyName.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {keyLoading ? "Creating..." : "Create API Key"}
            </Button>
          </div>
          <ResultDisplay result={keyResult} />
        </GlassCard>

        {/* Section 4: Fund Agent */}
        <GlassCard
          title="Fund Agent (Solana Devnet)"
          description="Request a Solana devnet airdrop to fund an agent wallet."
        >
          <div className="flex gap-3">
            <select
              value={fundAgent}
              onChange={(e) => setFundAgent(e.target.value)}
              className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus:border-ring"
            >
              {KNOWN_AGENTS.map((a) => (
                <option key={a.name} value={a.name} className="bg-zinc-900">
                  {a.name} ({a.solana.slice(0, 8)}...)
                </option>
              ))}
            </select>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-28 bg-white/[0.03] border-white/[0.08]"
              placeholder="SOL"
            />
            <Button
              onClick={handleFund}
              disabled={fundLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {fundLoading ? "Requesting..." : "Request Airdrop"}
            </Button>
          </div>
          <ResultDisplay result={fundResult} />
        </GlassCard>

        {/* Section 5: Send Payment */}
        <GlassCard
          title="Send Payment"
          description="Send SOL between agent wallets on Solana devnet via OWS signing."
        >
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  From
                </label>
                <select
                  value={sendFrom}
                  onChange={(e) => setSendFrom(e.target.value)}
                  className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus:border-ring"
                >
                  {KNOWN_AGENTS.map((a) => (
                    <option
                      key={a.name}
                      value={a.name}
                      className="bg-zinc-900"
                    >
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  To
                </label>
                <select
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus:border-ring"
                >
                  {KNOWN_AGENTS.map((a) => (
                    <option
                      key={a.name}
                      value={a.name}
                      className="bg-zinc-900"
                    >
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Amount (SOL)
                </label>
                <Input
                  type="number"
                  min="0.001"
                  step="0.01"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08]"
                />
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={sendLoading || sendFrom === sendTo}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {sendLoading ? "Sending..." : "Send Payment"}
            </Button>
            {sendFrom === sendTo && (
              <p className="text-xs text-red-400">
                From and To agents must be different.
              </p>
            )}
          </div>
          <ResultDisplay result={sendResult} />
        </GlassCard>
      </div>
    </div>
  );
}
