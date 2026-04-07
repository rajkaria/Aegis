import { Badge } from "@/components/ui/badge";

export interface XmtpStatusData {
  transport: "file" | "xmtp";
  encrypted: boolean;
  agentCount: number;
  messageCount: number;
  directMessages: number;
  presenceOnline: number;
  groupCount: number;
}

interface XmtpStatusProps {
  data: XmtpStatusData;
}

export function XmtpStatus({ data }: XmtpStatusProps) {
  const isXmtp = data.transport === "xmtp";

  return (
    <div className="relative overflow-hidden rounded-xl border border-blue-500/[0.12] bg-blue-500/[0.03] p-4">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">XMTP Agent Messaging</h3>
            <Badge className={`text-[10px] px-1.5 py-0.5 ${
              isXmtp
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
            }`}>
              {isXmtp ? "NETWORK" : "LOCAL"}
            </Badge>
          </div>
          {data.encrypted && (
            <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5">
              E2E Encrypted
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatusMetric
            label="Agents"
            value={data.agentCount}
            sublabel={`${data.presenceOnline} online`}
          />
          <StatusMetric
            label="Messages"
            value={data.messageCount}
            sublabel="on bus"
          />
          <StatusMetric
            label="DMs"
            value={data.directMessages}
            sublabel={data.encrypted ? "encrypted" : "plaintext"}
          />
          <StatusMetric
            label="Groups"
            value={data.groupCount}
            sublabel="active"
          />
        </div>
      </div>
    </div>
  );
}

function StatusMetric({ label, value, sublabel }: { label: string; value: number; sublabel: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
      <div className="text-lg font-bold text-foreground/90 tabular-nums">{value}</div>
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/60">{sublabel}</div>
    </div>
  );
}
