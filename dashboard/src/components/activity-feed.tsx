import { Badge } from "@/components/ui/badge";
import type { ActivityItem } from "@/lib/aegis-data";

interface ActivityFeedProps {
  entries: ActivityItem[];
}

const badgeConfig: Record<
  ActivityItem["type"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  earn: { label: "EARN", variant: "default" },
  spend: { label: "SPEND", variant: "secondary" },
  block: { label: "BLOCK", variant: "destructive" },
  pass: { label: "PASS", variant: "outline" },
  deadswitch: { label: "DEAD", variant: "destructive" },
  discovery: { label: "XMTP", variant: "secondary" },
};

export function ActivityFeed({ entries }: ActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const badge = badgeConfig[entry.type];
        return (
          <div
            key={`${entry.timestamp}-${i}`}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 animate-fade-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <Badge
              variant={badge.variant}
              className={`mt-0.5 shrink-0 text-xs ${
                entry.type === "earn"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : ""
              }`}
            >
              {badge.label}
            </Badge>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-sm truncate">{entry.description}</div>
              {entry.amount && (
                <div className="text-xs text-muted-foreground">
                  ${entry.amount} {entry.token ?? ""}
                </div>
              )}
            </div>
            <time className="text-xs text-muted-foreground shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </time>
          </div>
        );
      })}
    </div>
  );
}
