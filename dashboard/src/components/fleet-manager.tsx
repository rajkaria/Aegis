"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FleetAgent {
  agentId: string;
  revenue: number;
  spending: number;
  profitLoss: number;
  score: number;
  level: string;
  lastActivity: string | null;
  status: "active" | "idle" | "blocked" | "new";
  budgetUsage: number; // 0-100
}

export function FleetManager({ agents }: { agents: FleetAgent[] }) {
  const activeCount = agents.filter(a => a.status === "active").length;
  const totalRevenue = agents.reduce((s, a) => s + a.revenue, 0);
  const totalSpending = agents.reduce((s, a) => s + a.spending, 0);
  const avgScore = agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.score, 0) / agents.length) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Fleet Manager</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Monitor and manage all agents from one place</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{agents.length} agents</Badge>
            <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{activeCount} active</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Fleet summary */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="text-lg font-bold text-emerald-400">${totalRevenue.toFixed(3)}</div>
            <div className="text-[10px] text-muted-foreground">Fleet Revenue</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="text-lg font-bold text-red-400">${totalSpending.toFixed(3)}</div>
            <div className="text-[10px] text-muted-foreground">Fleet Spending</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className={`text-lg font-bold ${totalRevenue - totalSpending >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalRevenue - totalSpending >= 0 ? "+" : ""}${(totalRevenue - totalSpending).toFixed(3)}
            </div>
            <div className="text-[10px] text-muted-foreground">Net P&L</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="text-lg font-bold text-sky-400">{avgScore}</div>
            <div className="text-[10px] text-muted-foreground">Avg Reputation</div>
          </div>
        </div>

        {/* Agent grid */}
        <div className="space-y-2">
          {agents.map(agent => {
            const statusColors = {
              active: "bg-emerald-500",
              idle: "bg-yellow-500",
              blocked: "bg-red-500",
              new: "bg-zinc-500",
            };

            return (
              <div key={agent.agentId} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]} ${agent.status === "active" ? "animate-pulse" : ""}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{agent.agentId}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground capitalize">{agent.level}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Rev: ${agent.revenue.toFixed(3)} · Spend: ${agent.spending.toFixed(3)} · Score: {agent.score}
                  </div>
                </div>
                {/* Budget bar mini */}
                <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full ${agent.budgetUsage > 80 ? "bg-red-500" : agent.budgetUsage > 50 ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(agent.budgetUsage, 100)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{agent.budgetUsage}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
