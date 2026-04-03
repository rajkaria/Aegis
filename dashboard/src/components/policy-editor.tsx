"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type {
  BudgetConfig,
  BudgetLimit,
  GuardConfig,
  DeadswitchConfig,
} from "@/lib/types";

// ─── Budget Editor ───────────────────────────────────────────────

interface BudgetEditorProps {
  config: BudgetConfig | null;
  onSave: (config: BudgetConfig) => Promise<void>;
}

export function BudgetEditor({ config, onSave }: BudgetEditorProps) {
  const [limits, setLimits] = useState<BudgetLimit[]>(
    config?.limits ?? [{ chainId: "base", token: "USDC" }]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateLimit(idx: number, field: keyof BudgetLimit, value: string) {
    setLimits((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function addLimit() {
    setLimits((prev) => [...prev, { chainId: "base", token: "USDC" }]);
  }

  function removeLimit(idx: number) {
    setLimits((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await onSave({ limits });
      setMessage("Saved successfully");
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {limits.map((limit, idx) => (
        <div
          key={idx}
          className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
        >
          <div>
            <label className="text-xs text-muted-foreground">Chain ID</label>
            <Input
              value={limit.chainId}
              onChange={(e) =>
                updateLimit(idx, "chainId", e.target.value)
              }
              placeholder="base"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Token</label>
            <Input
              value={limit.token}
              onChange={(e) =>
                updateLimit(idx, "token", e.target.value)
              }
              placeholder="USDC"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Daily Limit
            </label>
            <Input
              type="number"
              value={limit.daily ?? ""}
              onChange={(e) =>
                updateLimit(idx, "daily", e.target.value)
              }
              placeholder="e.g. 10"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Weekly Limit
            </label>
            <Input
              type="number"
              value={limit.weekly ?? ""}
              onChange={(e) =>
                updateLimit(idx, "weekly", e.target.value)
              }
              placeholder="e.g. 50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Monthly Limit
            </label>
            <Input
              type="number"
              value={limit.monthly ?? ""}
              onChange={(e) =>
                updateLimit(idx, "monthly", e.target.value)
              }
              placeholder="e.g. 200"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeLimit(idx)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addLimit}>
          + Add Limit
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {message && (
        <p
          className={`text-xs ${message.includes("success") ? "text-emerald-500" : "text-red-500"}`}
        >
          {message}
        </p>
      )}

      {/* JSON Preview */}
      <details className="text-xs">
        <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
          View raw JSON
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/50 overflow-auto text-muted-foreground">
          {JSON.stringify({ limits }, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// ─── Guard Editor ────────────────────────────────────────────────

interface GuardEditorProps {
  config: GuardConfig | null;
  onSave: (config: GuardConfig) => Promise<void>;
}

export function GuardEditor({ config, onSave }: GuardEditorProps) {
  const [mode, setMode] = useState<"allowlist" | "blocklist">(
    config?.mode ?? "allowlist"
  );
  const [addresses, setAddresses] = useState<Record<string, string[]>>(
    config?.addresses ?? {}
  );
  const [blockAddresses, setBlockAddresses] = useState<string[]>(
    config?.blockAddresses ?? []
  );
  const [newChain, setNewChain] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newBlockAddress, setNewBlockAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addAddress() {
    if (!newChain || !newAddress) return;
    setAddresses((prev) => ({
      ...prev,
      [newChain]: [...(prev[newChain] ?? []), newAddress],
    }));
    setNewAddress("");
  }

  function removeAddress(chain: string, addr: string) {
    setAddresses((prev) => ({
      ...prev,
      [chain]: (prev[chain] ?? []).filter((a) => a !== addr),
    }));
  }

  function addBlockAddress() {
    if (!newBlockAddress) return;
    setBlockAddresses((prev) => [...prev, newBlockAddress]);
    setNewBlockAddress("");
  }

  function removeBlockAddress(addr: string) {
    setBlockAddresses((prev) => prev.filter((a) => a !== addr));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await onSave({ mode, addresses, blockAddresses });
      setMessage("Saved successfully");
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const configJson = { mode, addresses, blockAddresses };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground">Mode:</label>
        <Button
          variant={mode === "allowlist" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("allowlist")}
        >
          Allowlist
        </Button>
        <Button
          variant={mode === "blocklist" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("blocklist")}
        >
          Blocklist
        </Button>
      </div>

      {/* Chain Addresses */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Chain Addresses
        </label>
        {Object.entries(addresses).map(([chain, addrs]) => (
          <div key={chain} className="space-y-1">
            <span className="text-xs font-mono text-muted-foreground">
              {chain}:
            </span>
            {addrs.map((addr) => (
              <div
                key={addr}
                className="flex items-center gap-2 pl-4 text-xs"
              >
                <span className="font-mono truncate flex-1">{addr}</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => removeAddress(chain, addr)}
                >
                  x
                </Button>
              </div>
            ))}
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={newChain}
            onChange={(e) => setNewChain(e.target.value)}
            placeholder="Chain (e.g. base)"
            className="w-28"
          />
          <Input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="0x... address"
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={addAddress}>
            Add
          </Button>
        </div>
      </div>

      {/* Block Addresses */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Globally Blocked Addresses
        </label>
        {blockAddresses.map((addr) => (
          <div key={addr} className="flex items-center gap-2 text-xs">
            <span className="font-mono truncate flex-1">{addr}</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => removeBlockAddress(addr)}
            >
              x
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={newBlockAddress}
            onChange={(e) => setNewBlockAddress(e.target.value)}
            placeholder="0x... blocked address"
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={addBlockAddress}>
            Block
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {message && (
        <p
          className={`text-xs ${message.includes("success") ? "text-emerald-500" : "text-red-500"}`}
        >
          {message}
        </p>
      )}

      <details className="text-xs">
        <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
          View raw JSON
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/50 overflow-auto text-muted-foreground">
          {JSON.stringify(configJson, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// ─── Deadswitch Editor ───────────────────────────────────────────

interface DeadswitchEditorProps {
  config: DeadswitchConfig | null;
  onSave: (config: DeadswitchConfig) => Promise<void>;
}

export function DeadswitchEditor({ config, onSave }: DeadswitchEditorProps) {
  const [maxInactiveMinutes, setMaxInactiveMinutes] = useState(
    config?.maxInactiveMinutes ?? 60
  );
  const [sweepFunds, setSweepFunds] = useState(config?.sweepFunds ?? false);
  const [recoveryWallet, setRecoveryWallet] = useState(
    config?.recoveryWallet ?? ""
  );
  const [enabled, setEnabled] = useState(config?.enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await onSave({
        maxInactiveMinutes,
        onTrigger: "revoke_key",
        recoveryWallet: recoveryWallet || undefined,
        sweepFunds,
        lastHeartbeat: config?.lastHeartbeat,
        enabled,
      });
      setMessage("Saved successfully");
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const configJson = {
    maxInactiveMinutes,
    onTrigger: "revoke_key",
    recoveryWallet: recoveryWallet || undefined,
    sweepFunds,
    enabled,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">
            Max Inactive (minutes)
          </label>
          <Input
            type="number"
            value={maxInactiveMinutes}
            onChange={(e) =>
              setMaxInactiveMinutes(parseInt(e.target.value) || 0)
            }
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">
            Recovery Wallet
          </label>
          <Input
            value={recoveryWallet}
            onChange={(e) => setRecoveryWallet(e.target.value)}
            placeholder="0x..."
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={sweepFunds}
            onChange={(e) => setSweepFunds(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-muted-foreground">Sweep Funds</span>
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-muted-foreground">Enabled</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {message && (
        <p
          className={`text-xs ${message.includes("success") ? "text-emerald-500" : "text-red-500"}`}
        >
          {message}
        </p>
      )}

      <details className="text-xs">
        <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
          View raw JSON
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/50 overflow-auto text-muted-foreground">
          {JSON.stringify(configJson, null, 2)}
        </pre>
      </details>
    </div>
  );
}
