import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  BudgetConfig,
  GuardConfig,
  ApproveConfig,
  PolicyLogEntry,
} from "@aegis-ows/shared";

interface PolicyCardProps {
  name: string;
  displayName: string;
  config: BudgetConfig | GuardConfig | ApproveConfig | null;
  entries: PolicyLogEntry[];
}

export function PolicyCard({
  name,
  displayName,
  config,
  entries,
}: PolicyCardProps) {
  const blockCount = entries.filter(
    (e) => e.policyName === name && !e.allowed
  ).length;
  const passCount = entries.filter(
    (e) => e.policyName === name && e.allowed
  ).length;

  const isActive = config !== null;

  function renderConfigSummary() {
    if (!config) return <p className="text-sm text-muted-foreground">Not configured</p>;

    if (name === "aegis-budget") {
      const bc = config as BudgetConfig;
      return (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{bc.limits.length} budget limit{bc.limits.length !== 1 ? "s" : ""} configured</p>
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
          <p>{addressCount} address{addressCount !== 1 ? "es" : ""} in {gc.mode}</p>
          {gc.blockAddresses && gc.blockAddresses.length > 0 && (
            <p>{gc.blockAddresses.length} globally blocked</p>
          )}
        </div>
      );
    }

    if (name === "aegis-approve") {
      const ac = config as ApproveConfig;
      return (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Auto-approve below: {ac.thresholds.auto_approve_below}</p>
          <p>Require approval above: {ac.thresholds.require_approval_above}</p>
          <p>Hard block above: {ac.thresholds.hard_block_above}</p>
          <p>TTL: {ac.approval_ttl_minutes} minutes</p>
        </div>
      );
    }

    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">{displayName}</CardTitle>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderConfigSummary()}
        <div className="flex gap-4 pt-2 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-500">{passCount}</div>
            <div className="text-xs text-muted-foreground">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">{blockCount}</div>
            <div className="text-xs text-muted-foreground">Blocked</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
