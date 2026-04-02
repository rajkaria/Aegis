import { Badge } from "@/components/ui/badge";
import type { PolicyLogEntry } from "@aegis-ows/shared";

interface ActivityFeedProps {
  entries: PolicyLogEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  const sorted = [...entries]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 20);

  if (sorted.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No policy activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((entry, i) => (
        <div
          key={`${entry.timestamp}-${i}`}
          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
        >
          <Badge
            variant={entry.allowed ? "default" : "destructive"}
            className="mt-0.5 shrink-0 text-xs"
          >
            {entry.allowed ? "PASS" : "BLOCK"}
          </Badge>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium truncate">{entry.apiKeyId}</span>
              <span className="text-muted-foreground text-xs">
                {entry.policyName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Chain: {entry.chainId}</span>
              {entry.reason && (
                <>
                  <span>-</span>
                  <span className="truncate">{entry.reason}</span>
                </>
              )}
            </div>
          </div>
          <time className="text-xs text-muted-foreground shrink-0">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </time>
        </div>
      ))}
    </div>
  );
}
