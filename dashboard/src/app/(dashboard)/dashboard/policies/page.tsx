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
    </div>
  );
}
