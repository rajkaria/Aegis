"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AddAgent() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    addresses?: string;
  } | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_wallet", name: name.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          success: true,
          message: `Agent "${name}" created with OWS wallet`,
          addresses: data.output,
        });
        setName("");
      } else {
        const err = data.error ?? "Creation failed";
        if (err.includes("ENOENT") || err.includes("not found")) {
          setResult({ success: false, message: "OWS is not installed on this server. Clone the repo and run ./setup.sh locally." });
        } else if (err.includes("already exists")) {
          setResult({ success: false, message: `Agent "${name}" already exists.` });
        } else {
          setResult({ success: false, message: err });
        }
      }
    } catch {
      setResult({
        success: false,
        message: "Could not connect to OWS. This feature requires a local installation.",
      });
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group rounded-xl border border-dashed border-white/[0.08] hover:border-emerald-500/30 bg-white/[0.01] hover:bg-emerald-500/[0.03] p-5 transition-all duration-300 flex items-center gap-3 w-full"
      >
        <div className="w-8 h-8 rounded-full border border-white/[0.1] group-hover:border-emerald-500/40 flex items-center justify-center transition-colors">
          <svg
            className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div className="text-left">
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Add New Agent
          </span>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Create an OWS wallet with addresses on all supported chains
          </p>
        </div>
      </button>
    );
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Create New Agent</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Creates an OWS wallet with derived addresses on Solana, Ethereum,
              Base, Bitcoin, Cosmos, and more.
            </p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              setResult(null);
            }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="agent-name (e.g. data-processor)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="bg-white/[0.02] border-white/[0.08]"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 shrink-0"
            size="sm"
          >
            {loading ? "Creating..." : "Create Agent"}
          </Button>
        </div>

        {result && (
          <div
            className={`mt-4 rounded-lg text-sm ${
              result.success
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            <div
              className={`p-3 ${result.success ? "text-emerald-400" : "text-red-400"}`}
            >
              {result.success && (
                <span className="inline-flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {result.message}
                </span>
              )}
              {!result.success && result.message}
            </div>
            {result.addresses && (
              <pre className="p-3 border-t border-white/[0.06] text-xs text-muted-foreground font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                {result.addresses}
              </pre>
            )}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/50 mt-3">
          The agent wallet is stored in the OWS vault at ~/.ows/wallets/ with
          AES-256-GCM encryption. Private keys never leave the signing enclave.
        </p>
      </CardContent>
    </Card>
  );
}
