import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  BudgetConfig,
  GuardConfig,
  DeadswitchConfig,
  PolicyLogEntry,
} from "@aegis-ows/shared";

interface PolicyCardProps {
  name: string;
  displayName: string;
  config: BudgetConfig | GuardConfig | DeadswitchConfig | null;
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
      const lastHb = dc.lastHeartbeat
        ? new Date(dc.lastHeartbeat)
        : null;
      const now = new Date();
      const minutesSinceHeartbeat = lastHb
        ? Math.floor((now.getTime() - lastHb.getTime()) / 60000)
        : null;
      const minutesUntilTrigger =
        minutesSinceHeartbeat !== null
          ? Math.max(0, dc.maxInactiveMinutes - minutesSinceHeartbeat)
          : null;

      return (
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge variant={dc.enabled ? "default" : "secondary"}>
              {dc.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p>Max inactive: {dc.maxInactiveMinutes} minutes</p>
          <p>On trigger: {dc.onTrigger.replace("_", " ")}</p>
          {dc.sweepFunds && <p>Sweep funds: enabled</p>}
          {lastHb && (
            <p>
              Last heartbeat:{" "}
              {minutesSinceHeartbeat !== null
                ? `${minutesSinceHeartbeat}m ago`
                : "unknown"}
            </p>
          )}
          {minutesUntilTrigger !== null && dc.enabled && (
            <p
              className={
                minutesUntilTrigger <= 5
                  ? "text-red-400 font-medium"
                  : "text-muted-foreground"
              }
            >
              Time until trigger:{" "}
              {minutesUntilTrigger === 0
                ? "IMMINENT"
                : `${minutesUntilTrigger}m`}
            </p>
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">
          {displayName}
        </CardTitle>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderConfigSummary()}
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
            <div className="text-xs text-muted-foreground">Blocked</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
