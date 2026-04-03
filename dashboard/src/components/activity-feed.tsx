import { Badge } from "@/components/ui/badge";
import type { ActivityItem } from "@/lib/aegis-data";

interface ActivityFeedProps {
  entries: ActivityItem[];
}

const badgeConfig: Record<
  ActivityItem["type"],
  {
    label: string;
    className: string;
    borderColor: string;
    glowClass: string;
  }
> = {
  earn: {
    label: "EARN",
    className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
    borderColor: "border-l-emerald-500/70",
    glowClass: "hover:shadow-[0_0_12px_rgba(16,185,129,0.08)]",
  },
  spend: {
    label: "SPEND",
    className: "bg-sky-500/20 text-sky-400 border border-sky-500/40",
    borderColor: "border-l-sky-500/70",
    glowClass: "hover:shadow-[0_0_12px_rgba(56,189,248,0.08)]",
  },
  block: {
    label: "BLOCK",
    className: "bg-red-500/20 text-red-400 border border-red-500/40",
    borderColor: "border-l-red-500/70",
    glowClass: "hover:shadow-[0_0_12px_rgba(239,68,68,0.08)]",
  },
  pass: {
    label: "PASS",
    className: "bg-white/[0.06] text-muted-foreground border border-white/10",
    borderColor: "border-l-white/20",
    glowClass: "",
  },
  deadswitch: {
    label: "DEAD",
    className: "bg-red-500/20 text-red-400 border border-red-500/40",
    borderColor: "border-l-red-500/70",
    glowClass: "hover:shadow-[0_0_12px_rgba(239,68,68,0.08)]",
  },
  discovery: {
    label: "XMTP",
    className: "bg-purple-500/20 text-purple-400 border border-purple-500/40",
    borderColor: "border-l-purple-500/70",
    glowClass: "hover:shadow-[0_0_12px_rgba(168,85,247,0.08)]",
  },
};

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const badge = badgeConfig[entry.type];
        return (
          <div
            key={`${entry.timestamp}-${i}`}
            className={`
              flex items-start gap-3 p-3 rounded-lg
              bg-white/[0.02] border border-white/[0.06] border-l-2 ${badge.borderColor}
              transition-all duration-200
              hover:bg-white/[0.04] hover:border-white/[0.10] ${badge.glowClass}
              animate-fade-up
            `}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Badge className={`mt-0.5 shrink-0 text-[10px] font-semibold px-1.5 py-0.5 ${badge.className}`}>
              {badge.label}
            </Badge>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="text-sm truncate">{entry.description}</div>
              {entry.amount && (
                <div className="text-xs text-muted-foreground font-mono">
                  ${entry.amount} {entry.token ?? ""}
                </div>
              )}
            </div>
            <time className="text-[10px] text-muted-foreground/70 shrink-0 pt-0.5 tabular-nums">
              {relativeTime(entry.timestamp)}
            </time>
          </div>
        );
      })}
    </div>
  );
}
