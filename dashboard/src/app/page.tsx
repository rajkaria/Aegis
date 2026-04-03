import { getEconomyOverview } from "@/lib/aegis-data";
import { StatCard } from "@/components/stat-card";
import { MoneyFlow } from "@/components/sankey-chart";
import { AgentPnlTable } from "@/components/agent-pnl-table";
import { ActivityFeed } from "@/components/activity-feed";
import { BudgetBar } from "@/components/budget-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function EconomyPage() {
  const data = getEconomyOverview();

  // Build flow nodes and links for the visualization
  const flowNodes = data.profiles.map((p) => ({
    name: p.agentId,
    revenue: p.totalRevenue,
    spending: p.totalSpending,
    profitLoss: p.profitLoss,
  }));

  const flowLinks = data.sankeyData.links.map((l) => ({
    from: data.sankeyData.nodes[l.source].name,
    to: data.sankeyData.nodes[l.target].name,
    value: l.value,
  }));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Aegis Nexus</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Agent Economy Dashboard — Real-time commerce, governance, and
          transparency
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Economy Flow"
          value={`$${data.totalFlow.toFixed(2)}`}
          description="Total volume across agents"
        />
        <StatCard
          title="Active Agents"
          value={data.agentCount}
          description="Agents in the economy"
        />
        <StatCard
          title="Net Profit"
          value={`${data.netProfit >= 0 ? "+" : ""}$${data.netProfit.toFixed(2)}`}
          description="Combined agent P&L"
        />
        <StatCard
          title="Transactions Blocked"
          value={data.totalBlocked}
          description="Blocked by policy enforcement"
        />
      </div>

      {/* Money Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Money Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <MoneyFlow nodes={flowNodes} links={flowLinks} />
        </CardContent>
      </Card>

      {/* Budget Consumption */}
      {data.budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Consumption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.budgets.map((b, i) => (
              <BudgetBar
                key={`${b.chainId}-${b.token}-${b.period}-${i}`}
                chainId={b.chainId}
                token={b.token}
                period={b.period}
                spent={b.spent}
                limit={b.limit}
                percentage={b.percentage}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Two columns: P&L Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentPnlTable profiles={data.profiles} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed entries={data.activity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
