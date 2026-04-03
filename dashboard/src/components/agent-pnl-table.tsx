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
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Spending</TableHead>
          <TableHead>P/L</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((p) => (
          <TableRow key={p.agentId}>
            <TableCell>
              <Link
                href={`/agents/${p.agentId}`}
                className="font-medium hover:underline"
              >
                {p.agentId}
              </Link>
            </TableCell>
            <TableCell className="text-emerald-400">
              ${p.totalRevenue.toFixed(2)}
            </TableCell>
            <TableCell className="text-red-400">
              ${p.totalSpending.toFixed(2)}
            </TableCell>
            <TableCell
              className={
                p.profitLoss >= 0
                  ? "text-emerald-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              {p.profitLoss >= 0 ? "+" : ""}${p.profitLoss.toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge
                variant={p.profitLoss >= 0 ? "default" : "destructive"}
              >
                {p.profitLoss >= 0 ? "Profitable" : "Spending"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
