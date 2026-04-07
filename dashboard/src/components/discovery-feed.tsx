import { Badge } from "@/components/ui/badge";
import type { DiscoveryEvent } from "@/lib/aegis-data";

interface DiscoveryFeedProps {
  events: DiscoveryEvent[];
}

const typeConfig = {
  service_announcement: {
    label: "ANNOUNCE",
    className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
  },
  service_query: {
    label: "DISCOVER",
    className: "bg-sky-500/20 text-sky-400 border border-sky-500/40",
  },
  service_response: {
    label: "RESPOND",
    className: "bg-violet-500/20 text-violet-400 border border-violet-500/40",
  },
  negotiation_offer: {
    label: "NEGOTIATE",
    className: "bg-amber-500/20 text-amber-400 border border-amber-500/40",
  },
  negotiation_response: {
    label: "COUNTER",
    className: "bg-amber-500/20 text-amber-400 border border-amber-500/40",
  },
  health_ping: {
    label: "PING",
    className: "bg-sky-500/20 text-sky-400 border border-sky-500/40",
  },
  health_pong: {
    label: "PONG",
    className: "bg-sky-500/20 text-sky-400 border border-sky-500/40",
  },
  payment_receipt: {
    label: "RECEIPT",
    className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
  },
  reputation_gossip: {
    label: "GOSSIP",
    className: "bg-orange-500/20 text-orange-400 border border-orange-500/40",
  },
  sla_agreement: {
    label: "SLA",
    className: "bg-violet-500/20 text-violet-400 border border-violet-500/40",
  },
  supply_chain_invite: {
    label: "CHAIN",
    className: "bg-pink-500/20 text-pink-400 border border-pink-500/40",
  },
  direct_message: {
    label: "DM",
    className: "bg-blue-500/20 text-blue-400 border border-blue-500/40",
  },
  presence_update: {
    label: "PRESENCE",
    className: "bg-teal-500/20 text-teal-400 border border-teal-500/40",
  },
  delivery_receipt: {
    label: "DELIVERED",
    className: "bg-green-500/20 text-green-400 border border-green-500/40",
  },
  group_invite: {
    label: "GROUP",
    className: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40",
  },
} as const;

function getTypeConfig(type: string) {
  return (
    typeConfig[type as keyof typeof typeConfig] ?? {
      label: type.toUpperCase(),
      className: "bg-white/10 text-muted-foreground border border-white/10",
    }
  );
}

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function DiscoveryFeed({ events }: DiscoveryFeedProps) {
  if (events.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-purple-500/[0.12] bg-purple-500/[0.03] p-4">
      {/* Purple accent glow top-left */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold tracking-tight">Agent Discovery</h3>
          <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/40 px-1.5 py-0.5">
            via XMTP
          </Badge>
        </div>
        <div className="space-y-2">
          {events.map((e, i) => {
            const config = getTypeConfig(e.type);
            return (
              <div
                key={i}
                className="flex items-start gap-2 text-sm p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Badge className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 ${config.className}`}>
                  {config.label}
                </Badge>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground/90">{e.agentId}</span>
                  <span className="text-muted-foreground"> {e.detail}</span>
                </div>
                <time className="text-[10px] text-muted-foreground/70 shrink-0 ml-auto pt-0.5 tabular-nums">
                  {relativeTime(e.timestamp)}
                </time>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
