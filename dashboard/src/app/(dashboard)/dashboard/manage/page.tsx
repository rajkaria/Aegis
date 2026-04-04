"use client";

import { useState, useCallback } from "react";
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

function friendlyError(error: string): string {
  if (error.includes("ENOENT") || error.includes("not found")) {
    return "OWS is not installed on this server. This feature requires a local installation \u2014 clone the repo and run ./setup.sh";
  }
  if (error.includes("command not found") || error.includes("ows")) {
    return "Could not reach OWS. Make sure it's installed: curl -fsSL https://openwallet.sh/install.sh | bash";
  }
  if (error.includes("EACCES") || error.includes("permission")) {
    return "Permission denied. Check that the OWS wallet directory is accessible.";
  }
  if (error.includes("429") || error.includes("rate limit")) {
    return "Rate limited. Please wait a moment and try again.";
  }
  return error;
}

type Result = {
  type: "success" | "error";
  message: string;
  link?: string;
};

type ActivityEntry = {
  action: string;
  detail: string;
  timestamp: string;
  success: boolean;
  link?: string;
};

function SectionIcon({ icon }: { icon: string }) {
  return (
    <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm">
      {icon}
    </div>
  );
}

function GlassCard({
  title,
  description,
  icon,
  prominent,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  prominent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        prominent
          ? "bg-emerald-500/[0.04] border-emerald-500/20"
          : "bg-white/[0.03] border-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3 mb-1">
        <SectionIcon icon={icon} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5 ml-11">{description}</p>
      {children}
    </div>
  );
}

function ResultDisplay({ result }: { result: Result | null }) {
  if (!result) return null;
  const isSuccess = result.type === "success";
  return (
    <div
      className={`mt-4 rounded-lg px-4 py-3 text-sm font-mono whitespace-pre-wrap animate-in fade-in duration-300 ${
        isSuccess
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
          : "bg-red-500/10 border border-red-500/20 text-red-300"
      }`}
    >
      <div className="flex items-start gap-2">
        {isSuccess && (
          <span className="shrink-0 text-emerald-400 animate-in zoom-in duration-300">
            &#10003;
          </span>
        )}
        <span>{result.message}</span>
      </div>
      {result.link && (
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-3 text-sky-400 underline underline-offset-2 hover:text-sky-300 text-sm font-sans"
        >
          <span>&#9741;</span> View on Solana Explorer
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
  // -- Activity Log --
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const logActivity = useCallback(
    (action: string, detail: string, success: boolean, link?: string) => {
      setActivity((prev) => [
        {
          action,
          detail,
          timestamp: new Date().toLocaleTimeString(),
          success,
          link,
        },
        ...prev.slice(0, 4),
      ]);
    },
    []
  );

  // -- Create Wallet --
  const [walletName, setWalletName] = useState("");
  const [walletResult, setWalletResult] = useState<Result | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // -- Register Policy --
  const [policyType, setPolicyType] = useState(POLICY_TYPES[0]);
  const [policyResult, setPolicyResult] = useState<Result | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  // -- Custom Policy --
  const [customPolicyId, setCustomPolicyId] = useState("");
  const [customPolicyName, setCustomPolicyName] = useState("");
  const [customPolicyExec, setCustomPolicyExec] = useState("");
  const [customPolicyAction, setCustomPolicyAction] = useState("deny");
  const [customPolicyResult, setCustomPolicyResult] = useState<Result | null>(
    null
  );
  const [customPolicyLoading, setCustomPolicyLoading] = useState(false);

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
        logActivity("Create Wallet", walletName.trim(), true);
        setWalletName("");
      } else {
        setWalletResult({
          type: "error",
          message: friendlyError(data.error || "Failed to create wallet."),
        });
        logActivity("Create Wallet", friendlyError(data.error || "Failed"), false);
      }
    } catch {
      setWalletResult({
        type: "error",
        message: "Request failed. Is OWS installed locally?",
      });
      logActivity("Create Wallet", "Request failed", false);
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
        logActivity("Register Policy", policyType, true);
      } else {
        setPolicyResult({
          type: "error",
          message: friendlyError(data.error || "Failed to register policy."),
        });
        logActivity("Register Policy", friendlyError(data.error || "Failed"), false);
      }
    } catch {
      setPolicyResult({
        type: "error",
        message: "Request failed. Is OWS installed locally?",
      });
      logActivity("Register Policy", "Request failed", false);
    }
    setPolicyLoading(false);
  }

  async function handleCustomPolicy() {
    if (!customPolicyId.trim() || !customPolicyName.trim()) return;
    setCustomPolicyLoading(true);
    setCustomPolicyResult(null);
    try {
      const data = await callManage({
        action: "register_custom_policy",
        id: customPolicyId.trim(),
        name: customPolicyName.trim(),
        executable: customPolicyExec.trim(),
        policyAction: customPolicyAction,
      });
      if (data.success) {
        setCustomPolicyResult({
          type: "success",
          message: data.output || "Custom policy created successfully.",
        });
        logActivity("Custom Policy", customPolicyName.trim(), true);
        setCustomPolicyId("");
        setCustomPolicyName("");
        setCustomPolicyExec("");
      } else {
        setCustomPolicyResult({
          type: "error",
          message: friendlyError(data.error || "Failed to create custom policy."),
        });
        logActivity("Custom Policy", friendlyError(data.error || "Failed"), false);
      }
    } catch {
      setCustomPolicyResult({
        type: "error",
        message: "Request failed. Is OWS installed locally?",
      });
      logActivity("Custom Policy", "Request failed", false);
    }
    setCustomPolicyLoading(false);
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
        logActivity("Create API Key", keyName.trim(), true);
        setKeyName("");
      } else {
        setKeyResult({
          type: "error",
          message: friendlyError(data.error || "Failed to create API key."),
        });
        logActivity("Create API Key", friendlyError(data.error || "Failed"), false);
      }
    } catch {
      setKeyResult({
        type: "error",
        message: "Request failed. Is OWS installed locally?",
      });
      logActivity("Create API Key", "Request failed", false);
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
        const link = `https://explorer.solana.com/tx/${data.signature}?cluster=devnet`;
        setFundResult({
          type: "success",
          message: `Airdrop requested. Signature: ${data.signature}`,
          link,
        });
        logActivity("Fund Agent", `${fundAmount} SOL to ${fundAgent}`, true, link);
      } else {
        setFundResult({
          type: "error",
          message: friendlyError(data.error || "Airdrop failed."),
        });
        logActivity("Fund Agent", friendlyError(data.error || "Failed"), false);
      }
    } catch {
      setFundResult({ type: "error", message: "Airdrop request failed." });
      logActivity("Fund Agent", "Request failed", false);
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
        const link = `https://explorer.solana.com/tx/${data.txHash}?cluster=devnet`;
        setSendResult({
          type: "success",
          message: `Transaction sent. Hash: ${data.txHash}`,
          link,
        });
        logActivity(
          "Send Payment",
          `${sendAmount} SOL: ${sendFrom} -> ${sendTo}`,
          true,
          link
        );
      } else {
        setSendResult({
          type: "error",
          message: friendlyError(data.error || "Transaction failed."),
        });
        logActivity("Send Payment", friendlyError(data.error || "Failed"), false);
      }
    } catch {
      setSendResult({ type: "error", message: "Transaction request failed." });
      logActivity("Send Payment", "Request failed", false);
    }
    setSendLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Control Center</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Create wallets, register policies, and send real on-chain payments
          &mdash; everything the CLI does, from the browser.
        </p>
      </div>

      <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-4 py-3 text-sm text-sky-300">
        Management features require OWS installed locally. On Vercel, wallet
        operations are view-only.
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Create Wallet, Register Policy, Custom Policy, Create API Key */}
        <div className="space-y-6">
          {/* Section 1: Create Wallet */}
          <GlassCard
            title="Create Agent Wallet"
            description="Create a new OWS wallet with derived addresses across all supported chains."
            icon="&#128179;"
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
            icon="&#128737;"
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

          {/* Section 3: Custom Policy */}
          <GlassCard
            title="Custom Policy"
            description="Create and register your own policy executable with the OWS runtime."
            icon="&#128295;"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Policy ID (e.g. my-policy)"
                  value={customPolicyId}
                  onChange={(e) => setCustomPolicyId(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08]"
                />
                <Input
                  placeholder="Policy name"
                  value={customPolicyName}
                  onChange={(e) => setCustomPolicyName(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08]"
                />
              </div>
              <Input
                placeholder="Executable path (e.g. /usr/local/bin/my-policy)"
                value={customPolicyExec}
                onChange={(e) => setCustomPolicyExec(e.target.value)}
                className="bg-white/[0.03] border-white/[0.08]"
              />
              <div className="flex gap-3 items-center">
                <label className="text-xs text-muted-foreground">Action:</label>
                <select
                  value={customPolicyAction}
                  onChange={(e) => setCustomPolicyAction(e.target.value)}
                  className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus:border-ring"
                >
                  <option value="deny" className="bg-zinc-900">
                    deny
                  </option>
                  <option value="warn" className="bg-zinc-900">
                    warn
                  </option>
                </select>
                <Button
                  onClick={handleCustomPolicy}
                  disabled={
                    customPolicyLoading ||
                    !customPolicyId.trim() ||
                    !customPolicyName.trim()
                  }
                  className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {customPolicyLoading ? "Creating..." : "Register Policy"}
                </Button>
              </div>
            </div>
            <ResultDisplay result={customPolicyResult} />
          </GlassCard>

          {/* Section 4: Create API Key */}
          <GlassCard
            title="Create API Key"
            description="Generate an API key bound to specific wallets and policies."
            icon="&#128273;"
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
        </div>

        {/* Right column: Fund Agent, Send Payment */}
        <div className="space-y-6">
          {/* Section 5: Send Payment (prominent) */}
          <GlassCard
            title="Send Payment"
            description="Send real SOL between agent wallets on Solana devnet via OWS signing."
            icon="&#9889;"
            prominent
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
                <div className="flex items-end pb-0.5 text-muted-foreground">
                  &#8594;
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
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-10"
              >
                {sendLoading ? "Sending..." : "Send Payment on Solana Devnet"}
              </Button>
              {sendFrom === sendTo && (
                <p className="text-xs text-red-400">
                  From and To agents must be different.
                </p>
              )}
            </div>
            <ResultDisplay result={sendResult} />
          </GlassCard>

          {/* Section 6: Fund Agent */}
          <GlassCard
            title="Fund Agent (Solana Devnet)"
            description="Request a Solana devnet airdrop to fund an agent wallet."
            icon="&#128176;"
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
        </div>
      </div>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-sm">&#128203;</span> Recent Activity
          </h3>
          <div className="space-y-2">
            {activity.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className="flex items-center gap-3 text-sm py-2 border-b border-white/[0.04] last:border-0"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    entry.success ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium text-foreground w-32 shrink-0">
                  {entry.action}
                </span>
                <span className="text-muted-foreground truncate flex-1">
                  {entry.detail}
                </span>
                {entry.link && (
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 text-xs shrink-0"
                  >
                    Explorer
                  </a>
                )}
                <span className="text-xs text-muted-foreground shrink-0">
                  {entry.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
