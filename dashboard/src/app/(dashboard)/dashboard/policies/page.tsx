"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BudgetEditor,
  GuardEditor,
  DeadswitchEditor,
} from "@/components/policy-editor";
import { Input } from "@/components/ui/input";
import type {
  BudgetConfig,
  GuardConfig,
  DeadswitchConfig,
  PolicyLogEntry,
} from "@/lib/types";

interface PolicyData {
  log: { entries: PolicyLogEntry[] };
  budgetConfig: BudgetConfig | null;
  guardConfig: GuardConfig | null;
  deadswitchConfig: DeadswitchConfig | null;
}

export default function PoliciesPage() {
  const [data, setData] = useState<PolicyData | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/policies")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Policies</h2>
          <p className="text-muted-foreground text-sm mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  const { log, budgetConfig, guardConfig, deadswitchConfig } = data;

  async function savePolicy(name: string, config: unknown) {
    const res = await fetch(`/api/policies/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error("Save failed");
    // Refresh data
    const fresh = await fetch("/api/policies").then((r) => r.json());
    setData(fresh);
  }

  function renderConfigSummary(
    name: string,
    config: BudgetConfig | GuardConfig | DeadswitchConfig | null
  ) {
    if (!config)
      return (
        <p className="text-sm text-muted-foreground">Not configured</p>
      );

    if (name === "aegis-budget") {
      const bc = config as BudgetConfig;
      return (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            {bc.limits.length} budget limit
            {bc.limits.length !== 1 ? "s" : ""} configured
          </p>
          {bc.limits.slice(0, 3).map((l, i) => (
            <p key={i} className="text-xs pl-2">
              {l.token} on {l.chainId}:
              {l.daily && ` ${l.daily}/day`}
              {l.weekly && ` ${l.weekly}/week`}
              {l.monthly && ` ${l.monthly}/month`}
            </p>
          ))}
        </div>
      );
    }

    if (name === "aegis-guard") {
      const gc = config as GuardConfig;
      const addressCount = Object.values(gc.addresses).flat().length;
      return (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Mode: {gc.mode}</p>
          <p>
            {addressCount} address{addressCount !== 1 ? "es" : ""} in{" "}
            {gc.mode}
          </p>
          {gc.blockAddresses && gc.blockAddresses.length > 0 && (
            <p>{gc.blockAddresses.length} globally blocked</p>
          )}
        </div>
      );
    }

    if (name === "aegis-deadswitch") {
      const dc = config as DeadswitchConfig;
      return (
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge variant={dc.enabled ? "default" : "secondary"}>
              {dc.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p>Max inactive: {dc.maxInactiveMinutes} minutes</p>
          <p>Sweep funds: {dc.sweepFunds ? "yes" : "no"}</p>
        </div>
      );
    }

    return null;
  }

  const policies = [
    {
      name: "aegis-budget",
      displayName: "Aegis Budget",
      config: budgetConfig,
    },
    {
      name: "aegis-guard",
      displayName: "Aegis Guard",
      config: guardConfig,
    },
    {
      name: "aegis-deadswitch",
      displayName: "Aegis Deadswitch",
      config: deadswitchConfig,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Policies</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Policy configuration and enforcement statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((policy) => {
          const blockCount = log.entries.filter(
            (e) => e.policyName === policy.name && !e.allowed
          ).length;
          const passCount = log.entries.filter(
            (e) => e.policyName === policy.name && e.allowed
          ).length;
          const isActive = policy.config !== null;
          const isExpanded = expanded === policy.name;

          return (
            <Card key={policy.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">
                  {policy.displayName}
                </CardTitle>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderConfigSummary(policy.name, policy.config)}

                <div className="flex gap-4 pt-2 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-500">
                      {passCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">
                      {blockCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Blocked
                    </div>
                  </div>
                </div>

                {/* Edit button + expandable editor */}
                <div className="pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setExpanded(isExpanded ? null : policy.name)
                    }
                  >
                    {isExpanded ? "Close Editor" : "Edit Config"}
                  </Button>

                  {isExpanded && (
                    <div className="mt-4">
                      {policy.name === "aegis-budget" && (
                        <BudgetEditor
                          config={budgetConfig}
                          onSave={(c) => savePolicy("aegis-budget", c)}
                        />
                      )}
                      {policy.name === "aegis-guard" && (
                        <GuardEditor
                          config={guardConfig}
                          onSave={(c) => savePolicy("aegis-guard", c)}
                        />
                      )}
                      {policy.name === "aegis-deadswitch" && (
                        <DeadswitchEditor
                          config={deadswitchConfig}
                          onSave={(c) => savePolicy("aegis-deadswitch", c)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Policy Registration */}
      <CustomPolicySection />
    </div>
  );
}

function CustomPolicySection() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [executable, setExecutable] = useState("");
  const [action, setAction] = useState<"deny" | "warn">("deny");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleRegister() {
    if (!id || !name || !executable) {
      setResult({ success: false, message: "All fields are required" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register_custom_policy", id, name, executable, policyAction: action }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: `Policy "${id}" registered successfully` });
        setId("");
        setName("");
        setExecutable("");
      } else {
        setResult({ success: false, message: data.error ?? "Registration failed" });
      }
    } catch {
      setResult({ success: false, message: "Could not connect to OWS. This feature requires a local installation." });
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Create Custom Policy</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Register any script as an OWS policy. It must read PolicyContext from stdin and write PolicyResult to stdout.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">OWS Compatible</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Policy ID</label>
            <Input
              placeholder="my-custom-policy"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="bg-white/[0.02] border-white/[0.08]"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
            <Input
              placeholder="My Custom Policy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/[0.02] border-white/[0.08]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Executable Path</label>
            <Input
              placeholder="/path/to/policy-script.js"
              value={executable}
              onChange={(e) => setExecutable(e.target.value)}
              className="bg-white/[0.02] border-white/[0.08] font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Action</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAction("deny")}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  action === "deny"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.04]"
                }`}
              >
                Deny (block tx)
              </button>
              <button
                onClick={() => setAction("warn")}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  action === "warn"
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.04]"
                }`}
              >
                Warn (log only)
              </button>
            </div>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleRegister}
              disabled={loading || !id || !name || !executable}
              className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
              size="sm"
            >
              {loading ? "Registering..." : "Register Policy with OWS"}
            </Button>
          </div>
        </div>

        {result && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            result.success
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            {result.message}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <p className="text-xs text-muted-foreground mb-2 font-medium">How custom policies work:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Your script receives a <code className="bg-white/[0.06] px-1 rounded">PolicyContext</code> JSON on stdin</li>
            <li>It evaluates your custom rules</li>
            <li>It writes <code className="bg-white/[0.06] px-1 rounded">{`{"allow": true}`}</code> or <code className="bg-white/[0.06] px-1 rounded">{`{"allow": false, "reason": "..."}`}</code> to stdout</li>
            <li>OWS runs it before every signing operation</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
