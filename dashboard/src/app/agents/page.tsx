import { getEconomyOverview } from "@/lib/aegis-data";
import { AgentPnlTable } from "@/components/agent-pnl-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  const { profiles } = getEconomyOverview();

  const totalRevenue = profiles.reduce((s, p) => s + p.totalRevenue, 0);
  const totalSpending = profiles.reduce((s, p) => s + p.totalSpending, 0);
  const netPL = totalRevenue - totalSpending;
  const profitableCount = profiles.filter((p) => p.profitLoss >= 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agents</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Agent profit & loss across the economy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agents"
          value={profiles.length}
          description="Agents in the economy"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description="Combined agent earnings"
        />
        <StatCard
          title="Total Spending"
          value={`$${totalSpending.toFixed(2)}`}
          description="Combined agent costs"
        />
        <StatCard
          title="Profitable"
          value={`${profitableCount}/${profiles.length}`}
          description={`Net P&L: ${netPL >= 0 ? "+" : ""}$${netPL.toFixed(2)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentPnlTable profiles={profiles} />
        </CardContent>
      </Card>
    </div>
  );
}
