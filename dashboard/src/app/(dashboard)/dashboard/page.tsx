import { getEconomyOverview } from "@/lib/aegis-data";
import { StatCard } from "@/components/stat-card";
import { MoneyFlow } from "@/components/sankey-chart";
import { AgentPnlTable } from "@/components/agent-pnl-table";
import { ActivityFeed } from "@/components/activity-feed";
import { BudgetBar } from "@/components/budget-bar";
import { DiscoveryFeed } from "@/components/discovery-feed";
import { DashboardControls } from "@/components/dashboard-controls";
import { Onboarding } from "@/components/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function DemoBanner() {
  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex items-start gap-3">
      <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center">
        <span className="text-sm">✨</span>
      </div>
      <div>
        <p className="text-sm font-medium text-sky-300">You&apos;re viewing a live preview</p>
        <p className="text-xs text-muted-foreground mt-1">
          This dashboard shows real transaction data from a 3-agent economy on Solana devnet. Click &apos;Run Economy Cycle&apos; above to add live transactions — they appear instantly and persist during your session.
          To create your own agents and send real payments, clone the repo and run <code className="bg-white/5 px-1 rounded">./setup.sh</code>
        </p>
      </div>
    </div>
  );
}

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
      <Onboarding />
      {/* Hero */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Aegis Nexus</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Agent Economy Dashboard — Real-time commerce, governance, and
          transparency
        </p>
        <div className="mt-3">
          <DashboardControls />
        </div>
      </div>

      {/* Demo Banner */}
      {process.env.VERCEL && <DemoBanner />}

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

      {/* Agent Status */}
      <div className="flex flex-wrap gap-2">
        {data.profiles.map(p => {
          const lastActivity = data.activity.find(a => a.agentId === p.agentId);
          const minutesAgo = lastActivity
            ? Math.floor((Date.now() - new Date(lastActivity.timestamp).getTime()) / 60000)
            : null;
          const isRecent = minutesAgo !== null && minutesAgo < 30;

          return (
            <div key={p.agentId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isRecent ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="font-medium">{p.agentId}</span>
              <span className="text-muted-foreground">
                {minutesAgo !== null ? (minutesAgo < 1 ? 'just now' : `${minutesAgo}m ago`) : 'no activity'}
              </span>
            </div>
          );
        })}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Budget Consumption</CardTitle>
            <span className="text-[10px] text-muted-foreground">
              Balance data powered by Zerion
            </span>
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

      {/* XMTP Discovery Feed */}
      {data.discoveryEvents.length > 0 && (
        <DiscoveryFeed events={data.discoveryEvents} />
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
      {/* Data Sources */}
      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-medium">Partner Data Sources</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Solana RPC", desc: "Native SOL + SPL balances", active: true },
            { name: "Ripple XRPL", desc: "XRP Ledger balances", active: true },
            { name: "Zerion", desc: "EVM portfolio data", active: !!process.env.ZERION_API_KEY },
            { name: "Uniblock", desc: "Multi-chain token balances", active: !!process.env.UNIBLOCK_API_KEY },
            { name: "Allium", desc: "On-chain tx verification", active: !!process.env.ALLIUM_API_KEY },
            { name: "MoonPay", desc: "Fiat on-ramp funding", active: true },
          ].map((src) => (
            <div
              key={src.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 text-xs"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${src.active ? "bg-emerald-500" : "bg-zinc-500"}`} />
              <span className="font-medium">{src.name}</span>
              <span className="text-muted-foreground hidden sm:inline">— {src.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
