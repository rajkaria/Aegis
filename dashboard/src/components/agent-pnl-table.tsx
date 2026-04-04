import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AgentProfile } from "@/lib/types";

function StatusDot({ profitable }: { profitable: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${
        profitable
          ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
          : "bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]"
      }`}
    />
  );
}

function ArrowIcon({ up }: { up: boolean }) {
  return (
    <svg
      className={`inline w-3 h-3 mr-0.5 ${up ? "text-emerald-400" : "text-red-400"}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {up ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  );
}

export function AgentPnlTable({ profiles }: { profiles: AgentProfile[] }) {
  if (profiles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No agent profiles yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/[0.06] hover:bg-transparent">
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70">Agent</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70">Revenue</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70">Spending</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70">P/L</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((p) => {
          const isProfitable = p.profitLoss >= 0;
          return (
            <TableRow
              key={p.agentId}
              className="border-white/[0.04] transition-colors hover:bg-white/[0.03] group"
            >
              <TableCell>
                <div className="flex items-center">
                  <StatusDot profitable={isProfitable} />
                  <Link
                    href={`/dashboard/agents/${p.agentId}`}
                    className="font-medium hover:underline group-hover:text-foreground transition-colors"
                  >
                    {p.agentId}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="text-emerald-400/90 font-mono tabular-nums text-sm">
                ${p.totalRevenue.toFixed(2)}
              </TableCell>
              <TableCell className="text-red-400/90 font-mono tabular-nums text-sm">
                ${p.totalSpending.toFixed(2)}
              </TableCell>
              <TableCell
                className={`font-bold font-mono tabular-nums text-sm ${
                  isProfitable ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <ArrowIcon up={isProfitable} />
                {isProfitable ? "+" : ""}${p.profitLoss.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge
                  className={`text-xs ${
                    isProfitable
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/15 text-red-400 border border-red-500/30"
                  }`}
                >
                  {isProfitable ? "Profitable" : "Spending"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
