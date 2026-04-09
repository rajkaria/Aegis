import { getAgentDetail, getEconomyOverview } from "@/lib/aegis-data";
import { getUserId } from "@/lib/auth-helpers";
import { StatCard } from "@/components/stat-card";
import { BudgetBar } from "@/components/budget-bar";
import { WalletBalance } from "@/components/wallet-balance";
import { ReputationBadge } from "@/components/reputation-badge";
import { MoonPayFundWidget } from "@/components/moonpay-fund-widget";
import { MoonPaySellWidget } from "@/components/moonpay-sell-widget";
import { MultiChainPaymentWidget } from "@/components/multi-chain-payment";
import { FeeComparisonCard } from "@/components/fee-comparison-card";
import { UnifiedTxHistory } from "@/components/unified-tx-history";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();
  const [{ profile, policyLog, budgets }, { reputations }] = await Promise.all([
    getAgentDetail(id, userId ?? undefined),
    getEconomyOverview(userId ?? undefined),
  ]);
  const reputation = reputations.find(r => r.agentId === id);

  const isProfit = profile.profitLoss >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/agents"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Agents
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{profile.agentId}</h2>
        <Badge variant={isProfit ? "default" : "destructive"}>
          {isProfit ? "Profitable" : "Spending"}
        </Badge>
      </div>

      {/* Reputation */}
      {reputation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reputation Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ReputationBadge score={reputation.score} level={reputation.level} />
              <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Successful Payments</span>
                  <div className="font-bold text-emerald-400">{reputation.successfulPayments}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Blocked Transactions</span>
                  <div className="font-bold text-red-400">{reputation.blockedTransactions}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Revenue"
          value={`$${profile.totalRevenue.toFixed(2)}`}
          description={`${profile.endpoints.length} endpoint${profile.endpoints.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          title="Spending"
          value={`$${profile.totalSpending.toFixed(2)}`}
          description={`${profile.vendors.length} vendor${profile.vendors.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          title="Profit / Loss"
          value={`${isProfit ? "+" : ""}$${profile.profitLoss.toFixed(2)}`}
          description="Net position"
        />
      </div>

      {/* Wallet Balance + MoonPay */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletBalance agentId={id} />
        <MoonPayFundWidget agentId={id} />
      </div>

      {/* Off-Ramp: Withdraw Profits (only shows when profitable) */}
      <MoonPaySellWidget agentId={id} profitLoss={profile.profitLoss} />

      {/* Multi-Chain Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MultiChainPaymentWidget agentId={id} />
        <FeeComparisonCard />
      </div>

      {/* Cross-Chain Transaction History */}
      <UnifiedTxHistory agentId={id} />

      {/* Revenue + Spending breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by endpoint */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.endpoints.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No revenue endpoints.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Calls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.endpoints.map((ep) => (
                    <TableRow key={ep.endpoint}>
                      <TableCell className="font-mono text-xs">
                        {ep.endpoint}
                      </TableCell>
                      <TableCell className="text-emerald-400">
                        ${ep.revenue.toFixed(2)}
                      </TableCell>
                      <TableCell>{ep.calls}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Spending by vendor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.vendors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No spending vendors.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Spending</TableHead>
                    <TableHead>Calls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.vendors.map((v) => (
                    <TableRow key={v.vendor}>
                      <TableCell className="font-mono text-xs">
                        {v.vendor}
                      </TableCell>
                      <TableCell className="text-red-400">
                        ${v.spending.toFixed(2)}
                      </TableCell>
                      <TableCell>{v.calls}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Consumption */}
      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Consumption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((b, i) => (
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

      {/* Policy Enforcement History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Policy Enforcement History</CardTitle>
        </CardHeader>
        <CardContent>
          {policyLog.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No policy events for this agent.
            </p>
          ) : (
            <div className="space-y-2">
              {policyLog.slice(0, 20).map((entry, i) => (
                <div
                  key={`${entry.timestamp}-${i}`}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50"
                >
                  <Badge
                    variant={entry.allowed ? "outline" : "destructive"}
                    className="mt-0.5 shrink-0 text-xs"
                  >
                    {entry.allowed ? "PASS" : "BLOCK"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{entry.policyName}</div>
                    {entry.reason && (
                      <div className="text-xs text-muted-foreground truncate">
                        {entry.reason}
                      </div>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
