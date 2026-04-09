"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateAgentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ agent: string; solana: string; evm: string } | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), displayName: displayName.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create agent");
        return;
      }

      setSuccess({
        agent: data.agent.name,
        solana: data.wallets.find((w: any) => w.chain === "solana")?.address ?? "",
        evm: data.wallets.find((w: any) => w.chain === "evm")?.address ?? "",
      });
      setName("");
      setDisplayName("");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Agent name (e.g. data-miner)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
            disabled={loading}
            required
            minLength={2}
            maxLength={50}
          />
          <Input
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Creating..." : "Create Agent"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-400 mt-3">{error}</p>
        )}

        {success && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <p className="text-sm text-emerald-400 font-medium">
              Agent &quot;{success.agent}&quot; created with wallets:
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              SOL: {success.solana}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              EVM: {success.evm}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
