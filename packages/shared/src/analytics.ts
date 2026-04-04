import { readLedger } from "./ledger.js";
import { readEarningsLedger } from "./earnings.js";
import { readPolicyLog } from "./policy-log.js";
import { computeAllProfiles } from "./agent-profile.js";
import { readBudgetConfig } from "./config.js";

export interface EconomyInsight {
  type: "info" | "warning" | "success" | "alert";
  title: string;
  description: string;
  metric?: string;
  timestamp: string;
}

export function generateInsights(): EconomyInsight[] {
  const profiles = computeAllProfiles();
  const ledger = readLedger();
  const earnings = readEarningsLedger();
  const policyLog = readPolicyLog();
  const budgetConfig = readBudgetConfig();
  const insights: EconomyInsight[] = [];
  const now = new Date();

  // 1. Economy health
  const totalRevenue = profiles.reduce((s, p) => s + p.totalRevenue, 0);
  const totalSpending = profiles.reduce((s, p) => s + p.totalSpending, 0);
  const netFlow = totalRevenue - totalSpending;

  if (profiles.length > 0) {
    insights.push({
      type: netFlow >= 0 ? "success" : "warning",
      title: "Economy Health",
      description: `The ${profiles.length}-agent economy has processed ${earnings.entries.length + ledger.entries.length} transactions with a net flow of ${netFlow >= 0 ? "+" : ""}${netFlow.toFixed(4)} SOL. ${netFlow >= 0 ? "The economy is self-sustaining." : "Agents are spending more than earning — monitor budget limits."}`,
      metric: `${netFlow >= 0 ? "+" : ""}${netFlow.toFixed(4)} SOL`,
      timestamp: now.toISOString(),
    });
  }

  // 2. Top earner analysis
  const topEarner = profiles.reduce((best, p) => p.totalRevenue > best.totalRevenue ? p : best, profiles[0]);
  if (topEarner && topEarner.totalRevenue > 0) {
    const topEndpoint = topEarner.endpoints.sort((a, b) => b.revenue - a.revenue)[0];
    insights.push({
      type: "info",
      title: `Top Earner: ${topEarner.agentId}`,
      description: `${topEarner.agentId} leads revenue at ${topEarner.totalRevenue.toFixed(4)} SOL across ${topEarner.endpoints.length} endpoint(s). ${topEndpoint ? `Best-performing service: ${topEndpoint.endpoint} (${topEndpoint.calls} calls, ${topEndpoint.revenue.toFixed(4)} SOL).` : ""}`,
      metric: `${topEarner.totalRevenue.toFixed(4)} SOL`,
      timestamp: now.toISOString(),
    });
  }

  // 3. Budget risk detection
  if (budgetConfig) {
    for (const limit of budgetConfig.limits) {
      if (!limit.daily) continue;
      const dailyCap = parseFloat(limit.daily);

      for (const profile of profiles) {
        const todaySpend = ledger.entries
          .filter(e => {
            if (e.apiKeyId !== profile.agentId) return false;
            const entryDate = new Date(e.timestamp);
            return entryDate.toDateString() === now.toDateString();
          })
          .reduce((s, e) => s + parseFloat(e.amount), 0);

        const usage = dailyCap > 0 ? (todaySpend / dailyCap) * 100 : 0;

        if (usage > 80) {
          insights.push({
            type: usage > 95 ? "alert" : "warning",
            title: `Budget Alert: ${profile.agentId}`,
            description: `${profile.agentId} has used ${usage.toFixed(0)}% of its daily ${limit.token === "*" ? "" : limit.token + " "}budget (${todaySpend.toFixed(4)}/${dailyCap.toFixed(4)}). ${usage > 95 ? "Transactions will be blocked soon." : "Consider increasing limits or reducing activity."}`,
            metric: `${usage.toFixed(0)}%`,
            timestamp: now.toISOString(),
          });
        }
      }
    }
  }

  // 4. Policy enforcement analysis
  const recentBlocks = policyLog.entries.filter(e => !e.allowed);
  const recentPasses = policyLog.entries.filter(e => e.allowed);

  if (recentBlocks.length > 0) {
    const blocksByPolicy: Record<string, number> = {};
    for (const b of recentBlocks) {
      blocksByPolicy[b.policyName] = (blocksByPolicy[b.policyName] ?? 0) + 1;
    }
    const topBlocker = Object.entries(blocksByPolicy).sort((a, b) => b[1] - a[1])[0];

    insights.push({
      type: "warning",
      title: "Policy Enforcement",
      description: `${recentBlocks.length} transaction(s) blocked, ${recentPasses.length} allowed. Most active policy: ${topBlocker[0]} (${topBlocker[1]} blocks). ${recentBlocks.length > recentPasses.length ? "High block rate suggests policies may be too restrictive." : "Policies are operating normally."}`,
      metric: `${recentBlocks.length} blocked`,
      timestamp: now.toISOString(),
    });
  }

  // 5. Supply chain efficiency
  const buyerAgents = profiles.filter(p => p.totalSpending > 0 && p.totalRevenue === 0);
  const sellerAgents = profiles.filter(p => p.totalRevenue > 0 && p.totalSpending === 0);
  const middleAgents = profiles.filter(p => p.totalRevenue > 0 && p.totalSpending > 0);

  if (middleAgents.length > 0) {
    const avgMargin = middleAgents.reduce((s, p) => s + (p.profitLoss / p.totalRevenue), 0) / middleAgents.length;
    insights.push({
      type: "info",
      title: "Supply Chain Analysis",
      description: `Economy has ${buyerAgents.length} pure buyer(s), ${middleAgents.length} intermediary(ies), and ${sellerAgents.length} pure seller(s). Average intermediary margin: ${(avgMargin * 100).toFixed(0)}%. ${avgMargin > 0.5 ? "High margins indicate room for competition." : "Margins are competitive."}`,
      metric: `${(avgMargin * 100).toFixed(0)}% margin`,
      timestamp: now.toISOString(),
    });
  }

  // 6. Activity trend
  const last24h = ledger.entries.filter(e => (now.getTime() - new Date(e.timestamp).getTime()) < 86400000);
  const prev24h = ledger.entries.filter(e => {
    const age = now.getTime() - new Date(e.timestamp).getTime();
    return age >= 86400000 && age < 172800000;
  });

  if (last24h.length > 0 || prev24h.length > 0) {
    const trend = prev24h.length > 0 ? ((last24h.length - prev24h.length) / prev24h.length * 100) : 100;
    insights.push({
      type: trend >= 0 ? "success" : "warning",
      title: "Activity Trend",
      description: `${last24h.length} transactions in the last 24 hours${prev24h.length > 0 ? ` (${trend >= 0 ? "+" : ""}${trend.toFixed(0)}% vs previous 24h)` : ""}. ${last24h.length > 10 ? "High activity indicates a healthy economy." : "Consider running more agent workflows to increase volume."}`,
      metric: `${last24h.length} txns`,
      timestamp: now.toISOString(),
    });
  }

  return insights;
}
