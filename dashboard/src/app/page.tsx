import { getSpendingData, getPolicyData } from "@/lib/aegis-data";
import { StatCard } from "@/components/stat-card";
import { BudgetBar } from "@/components/budget-bar";
import { ActivityFeed } from "@/components/activity-feed";
import { SpendingChart } from "@/components/spending-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const spending = getSpendingData();
  const policyData = getPolicyData();

  const uniqueAgents = new Set(spending.ledger.entries.map((e) => e.apiKeyId)).size;
  const uniqueChains = new Set(spending.ledger.entries.map((e) => e.chainId)).size;
  const blockedCount = policyData.log.entries.filter((e) => !e.allowed).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time agent spending and policy enforcement dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Spending"
          value={`$${spending.todayTotal.toFixed(4)}`}
          description="Total spend today across all agents"
        />
        <StatCard
          title="Active Agents"
          value={uniqueAgents}
          description="Unique API keys with transactions"
        />
        <StatCard
          title="Chains Used"
          value={uniqueChains}
          description="Active blockchain networks"
        />
        <StatCard
          title="Transactions Blocked"
          value={blockedCount}
          description="Blocked by policy enforcement"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart entries={spending.ledger.entries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Consumption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spending.budgets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No budget limits configured.
              </p>
            ) : (
              spending.budgets.map((b, i) => (
                <BudgetBar
                  key={`${b.chainId}-${b.token}-${b.period}-${i}`}
                  chainId={b.chainId}
                  token={b.token}
                  period={b.period}
                  spent={b.spent}
                  limit={b.limit}
                  percentage={b.percentage}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed entries={policyData.log.entries} />
        </CardContent>
      </Card>
    </div>
  );
}
