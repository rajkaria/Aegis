import { getEconomyOverview } from "@/lib/aegis-data";
import { readAllLiveMetrics, type LiveAgentMetrics } from "@/lib/data-provider";
import { getUserId } from "@/lib/auth-helpers";
import { StatCard } from "@/components/stat-card";
import { MoneyFlow } from "@/components/sankey-chart";
import { AgentPnlTable } from "@/components/agent-pnl-table";
import { ActivityFeed } from "@/components/activity-feed";
import { BudgetBar } from "@/components/budget-bar";
import { DiscoveryFeed } from "@/components/discovery-feed";
import { DashboardControls } from "@/components/dashboard-controls";
import { Onboarding } from "@/components/onboarding";
import { ReceiptList } from "@/components/receipt-list";
import { EconomyInsights } from "@/components/economy-insights";
import { FleetManager } from "@/components/fleet-manager";
import { RealtimeIndicator } from "@/components/realtime-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function DemoBanner({ hasLive }: { hasLive: boolean }) {
  if (hasLive) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
        <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-300">Live Railway agents connected</p>
          <p className="text-xs text-muted-foreground mt-1">
            The agents below are running on Railway mainnet. Metrics refresh on every page load. Economy simulation below uses devnet seed data.
          </p>
        </div>
      </div>
    );
  }
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

function LiveAgentCard({ m }: { m: LiveAgentMetrics }) {
  const net = m.earned - (m.costs ?? 0);
  const recentTx = m.txHistory.slice(-5).reverse();
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-sm">{m.agent}</span>
          <Badge variant="outline" className="text-[9px]">Railway</Badge>
        </div>
        <span className={`text-xs font-mono font-semibold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {net >= 0 ? "+" : ""}${net.toFixed(4)} net
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Earned</p>
          <p className="font-mono font-medium">${m.earned.toFixed(4)}</p>
        </div>
        {m.costs !== undefined && (
          <div>
            <p className="text-muted-foreground">Costs</p>
            <p className="font-mono font-medium">${m.costs.toFixed(4)}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground">Calls</p>
          <p className="font-mono font-medium">{m.calls}</p>
        </div>
      </div>
      {recentTx.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recent transactions</p>
          {recentTx.map((tx, i) => {
            const amt = tx.net ?? tx.amount ?? 0;
            return (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[60%]">
                  {tx.topic ?? "payment"}
                </span>
                <span className={`font-mono ${amt >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {amt >= 0 ? "+" : ""}${Math.abs(amt).toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="pt-1 border-t border-white/[0.04] space-y-1">
        <p className="text-[10px] text-muted-foreground">
          SOL: <span className="font-mono">{m.solanaAddress.slice(0, 8)}…{m.solanaAddress.slice(-6)}</span>
        </p>
        <p className="text-[10px] text-muted-foreground">
          EVM: <span className="font-mono">{m.evmAddress.slice(0, 8)}…{m.evmAddress.slice(-6)}</span>
        </p>
      </div>
    </div>
  );
}

export default async function EconomyPage() {
  const userId = await getUserId();
  const [data, liveAgents] = await Promise.all([
    getEconomyOverview(userId ?? undefined),
    readAllLiveMetrics(),
  ]);

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
        <div className="mt-3 flex items-center gap-3">
          <DashboardControls />
          <RealtimeIndicator />
        </div>
      </div>

      {/* Banner */}
      {process.env.VERCEL && <DemoBanner hasLive={liveAgents.length > 0} />}

      {/* Live Railway Agents */}
      {liveAgents.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Live Railway Agents</CardTitle>
            <span className="text-[10px] text-muted-foreground">real-time — refreshes on load</span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveAgents.map(m => <LiveAgentCard key={m.agent} m={m} />)}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Economy Intelligence */}
      <EconomyInsights insights={data.insights} />

      {/* Fleet Manager */}
      <FleetManager agents={data.profiles.map(p => {
        const rep = data.reputations?.find(r => r.agentId === p.agentId);
        const lastActivity = data.activity.find(a => a.agentId === p.agentId);
        const minutesAgo = lastActivity ? Math.floor((Date.now() - new Date(lastActivity.timestamp).getTime()) / 60000) : null;
        const budgetUsage = data.budgets.length > 0 ? Math.min(data.budgets[0].percentage, 100) : 0;

        return {
          agentId: p.agentId,
          revenue: p.totalRevenue,
          spending: p.totalSpending,
          profitLoss: p.profitLoss,
          score: rep?.score ?? 0,
          level: rep?.level ?? "new",
          lastActivity: lastActivity?.timestamp ?? null,
          status: (minutesAgo !== null && minutesAgo < 30 ? "active" : minutesAgo !== null ? "idle" : "new") as "active" | "idle" | "blocked" | "new",
          budgetUsage: Math.round(budgetUsage),
        };
      })} />

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
            <AgentPnlTable profiles={data.profiles} reputations={data.reputations} />
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
      {/* Payment Receipts */}
      <ReceiptList />

      {/* Multi-Chain Support */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">{"\u{1F517}"}</span>
          <h3 className="text-sm font-medium">Multi-Chain Ready</h3>
          <Badge variant="outline" className="text-[9px] ml-auto">via OWS</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Solana", active: true },
            { name: "Ethereum", active: true },
            { name: "Base", active: true },
            { name: "Stellar", active: true },
            { name: "Bitcoin", active: false },
            { name: "Cosmos", active: false },
            { name: "Tron", active: false },
            { name: "TON", active: false },
            { name: "Sui", active: false },
          ].map(chain => (
            <span key={chain.name} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${chain.active ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-white/[0.06] bg-white/[0.02] text-muted-foreground"}`}>
              <span className={`w-1 h-1 rounded-full ${chain.active ? "bg-emerald-500" : "bg-zinc-500"}`} />
              {chain.name}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Aegis Gate and Policies work on any OWS-supported chain. Demo runs on Solana devnet.
        </p>
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
            { name: "Stellar Horizon", desc: "XLM + token balances", active: true },
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
