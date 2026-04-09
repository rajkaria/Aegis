// Use the data provider which falls back to bundled seed data on Vercel
import {
  readLedger,
  readEarningsLedger,
  readPolicyLog,
  readBudgetConfig,
  readGuardConfig,
  readDeadswitchConfig,
  readMessages,
  readLedgerAsync,
  readEarningsLedgerAsync,
  readPolicyLogAsync,
  readBudgetConfigAsync,
} from "@/lib/data-provider";
import {
  getSpentInPeriod,
} from "@/lib/types";
import type {
  AgentProfile,
  SankeyData,
  PolicyLog,
  PolicyLogEntry,
  EarningsEntry,
  LedgerEntry,
  BudgetLedger,
  EarningsLedger,
} from "@/lib/types";

// === Reputation computation (inlined for standalone Vercel deploy) ===

interface AgentReputation {
  agentId: string;
  score: number;
  level: "new" | "trusted" | "verified" | "elite";
  successfulPayments: number;
  blockedTransactions: number;
}

function computeReputations(): AgentReputation[] {
  const ledger = readLedger();
  const earnings = readEarningsLedger();
  const policyLog = readPolicyLog();

  const agentIds = new Set<string>();
  for (const e of ledger.entries) agentIds.add(e.apiKeyId);
  for (const e of earnings.entries) agentIds.add(e.agentId);

  return Array.from(agentIds).map(agentId => {
    const asBuyer = ledger.entries.filter(e => e.apiKeyId === agentId).length;
    const asSeller = earnings.entries.filter(e => e.agentId === agentId).length;
    const successful = asBuyer + asSeller;
    const blocked = policyLog.entries.filter(e => e.apiKeyId === agentId && !e.allowed).length;
    const total = successful + blocked;

    let score = 0;
    if (total > 0) {
      score = 50 + Math.round((successful / Math.max(total, 1)) * 20) + Math.min(Math.round((successful / 10) * 15), 15) - Math.min(blocked * 10, 30);
      score = Math.max(0, Math.min(100, score));
    }

    const level = score >= 85 ? "elite" as const : score >= 65 ? "verified" as const : score >= 40 ? "trusted" as const : "new" as const;

    return { agentId, score, level, successfulPayments: successful, blockedTransactions: blocked };
  });
}

// === Local compute functions (use provider data instead of filesystem) ===

function computeAgentProfile(agentId: string): AgentProfile {
  const earnings = readEarningsLedger();
  const spending = readLedger();

  const revenueEntries = earnings.entries.filter(e => e.agentId === agentId);
  const totalRevenue = revenueEntries.reduce((s, e) => s + parseFloat(e.amount), 0);

  const spendingEntries = spending.entries.filter(e => e.apiKeyId === agentId);
  const totalSpending = spendingEntries.reduce((s, e) => s + parseFloat(e.amount), 0);

  const endpointMap = new Map<string, { revenue: number; calls: number }>();
  for (const e of revenueEntries) {
    const cur = endpointMap.get(e.endpoint) ?? { revenue: 0, calls: 0 };
    cur.revenue += parseFloat(e.amount);
    cur.calls += 1;
    endpointMap.set(e.endpoint, cur);
  }

  const vendorMap = new Map<string, { spending: number; calls: number }>();
  for (const e of spendingEntries) {
    const vendor = e.description?.match(/to (\S+)/)?.[1] ?? e.tool ?? "unknown";
    const cur = vendorMap.get(vendor) ?? { spending: 0, calls: 0 };
    cur.spending += parseFloat(e.amount);
    cur.calls += 1;
    vendorMap.set(vendor, cur);
  }

  return {
    agentId,
    totalRevenue,
    totalSpending,
    profitLoss: totalRevenue - totalSpending,
    endpoints: Array.from(endpointMap.entries()).map(([endpoint, data]) => ({ endpoint, ...data })),
    vendors: Array.from(vendorMap.entries()).map(([vendor, data]) => ({ vendor, ...data })),
  };
}

function computeAllProfiles(): AgentProfile[] {
  const earnings = readEarningsLedger();
  const spending = readLedger();

  const agentIds = new Set<string>();
  for (const e of earnings.entries) agentIds.add(e.agentId);
  for (const e of spending.entries) agentIds.add(e.apiKeyId);

  // Also discover agents from OWS wallets (so newly created wallets appear)
  try {
    const { execSync } = require("node:child_process");
    const owsPath = `${require("node:os").homedir()}/.ows/bin`;
    const output = execSync("ows wallet list", {
      encoding: "utf-8",
      timeout: 5000,
      env: { ...process.env, PATH: `${owsPath}:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` },
    });
    // Parse wallet names from "Name:    <name>" lines
    const nameMatches = output.matchAll(/Name:\s+(\S+)/g);
    for (const match of nameMatches) {
      agentIds.add(match[1]);
    }
  } catch {
    // OWS not available (Vercel) — skip wallet discovery
  }

  return Array.from(agentIds).map(id => computeAgentProfile(id));
}

function computeSankeyData(): SankeyData {
  const earnings = readEarningsLedger();

  const flowMap = new Map<string, Map<string, number>>();
  const allAgents = new Set<string>();

  for (const e of earnings.entries) {
    allAgents.add(e.fromAgent);
    allAgents.add(e.agentId);
    if (!flowMap.has(e.fromAgent)) flowMap.set(e.fromAgent, new Map());
    const targets = flowMap.get(e.fromAgent)!;
    targets.set(e.agentId, (targets.get(e.agentId) ?? 0) + parseFloat(e.amount));
  }

  const nodes = Array.from(allAgents).map(name => ({ name }));
  const nodeIndex = new Map(nodes.map((n, i) => [n.name, i]));

  const links: SankeyData["links"] = [];
  for (const [source, targets] of flowMap) {
    for (const [target, value] of targets) {
      if (source === target) continue;
      links.push({
        source: nodeIndex.get(source)!,
        target: nodeIndex.get(target)!,
        value: parseFloat(value.toFixed(4)),
      });
    }
  }

  return { nodes, links };
}

// === Insight generation (rule-based pattern detection) ===

export interface EconomyInsight {
  type: "info" | "warning" | "success" | "alert";
  title: string;
  description: string;
  metric?: string;
}

function generateDashboardInsights(
  profiles: AgentProfile[],
  ledger: BudgetLedger,
  earnings: EarningsLedger,
  policyLog: { entries: PolicyLogEntry[] },
  budgetConfig: import("@/lib/types").BudgetConfig | null,
): EconomyInsight[] {
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
      description: `The ${profiles.length}-agent economy has processed ${earnings.entries.length + ledger.entries.length} transactions with a net flow of ${netFlow >= 0 ? "+" : ""}${netFlow.toFixed(4)} SOL. ${netFlow >= 0 ? "The economy is self-sustaining." : "Agents are spending more than earning \u2014 monitor budget limits."}`,
      metric: `${netFlow >= 0 ? "+" : ""}${netFlow.toFixed(4)} SOL`,
    });
  }

  // 2. Top earner analysis
  if (profiles.length > 0) {
    const topEarner = profiles.reduce((best, p) => p.totalRevenue > best.totalRevenue ? p : best, profiles[0]);
    if (topEarner && topEarner.totalRevenue > 0) {
      const topEndpoint = topEarner.endpoints.sort((a, b) => b.revenue - a.revenue)[0];
      insights.push({
        type: "info",
        title: `Top Earner: ${topEarner.agentId}`,
        description: `${topEarner.agentId} leads revenue at ${topEarner.totalRevenue.toFixed(4)} SOL across ${topEarner.endpoints.length} endpoint(s). ${topEndpoint ? `Best-performing service: ${topEndpoint.endpoint} (${topEndpoint.calls} calls, ${topEndpoint.revenue.toFixed(4)} SOL).` : ""}`,
        metric: `${topEarner.totalRevenue.toFixed(4)} SOL`,
      });
    }
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
    });
  }

  return insights;
}

// === Data-driven compute helpers (accept pre-fetched data) ===

function computeAgentProfileFromData(agentId: string, earnings: EarningsLedger, spending: BudgetLedger): AgentProfile {
  const revenueEntries = earnings.entries.filter(e => e.agentId === agentId);
  const totalRevenue = revenueEntries.reduce((s, e) => s + parseFloat(e.amount), 0);

  const spendingEntries = spending.entries.filter(e => e.apiKeyId === agentId);
  const totalSpending = spendingEntries.reduce((s, e) => s + parseFloat(e.amount), 0);

  const endpointMap = new Map<string, { revenue: number; calls: number }>();
  for (const e of revenueEntries) {
    const cur = endpointMap.get(e.endpoint) ?? { revenue: 0, calls: 0 };
    cur.revenue += parseFloat(e.amount);
    cur.calls += 1;
    endpointMap.set(e.endpoint, cur);
  }

  const vendorMap = new Map<string, { spending: number; calls: number }>();
  for (const e of spendingEntries) {
    const vendor = e.description?.match(/to (\S+)/)?.[1] ?? e.tool ?? "unknown";
    const cur = vendorMap.get(vendor) ?? { spending: 0, calls: 0 };
    cur.spending += parseFloat(e.amount);
    cur.calls += 1;
    vendorMap.set(vendor, cur);
  }

  return {
    agentId,
    totalRevenue,
    totalSpending,
    profitLoss: totalRevenue - totalSpending,
    endpoints: Array.from(endpointMap.entries()).map(([endpoint, data]) => ({ endpoint, ...data })),
    vendors: Array.from(vendorMap.entries()).map(([vendor, data]) => ({ vendor, ...data })),
  };
}

function computeSankeyFromData(earnings: EarningsLedger): SankeyData {
  const flowMap = new Map<string, Map<string, number>>();
  const allAgents = new Set<string>();

  for (const e of earnings.entries) {
    allAgents.add(e.fromAgent);
    allAgents.add(e.agentId);
    if (!flowMap.has(e.fromAgent)) flowMap.set(e.fromAgent, new Map());
    const targets = flowMap.get(e.fromAgent)!;
    targets.set(e.agentId, (targets.get(e.agentId) ?? 0) + parseFloat(e.amount));
  }

  const nodes = Array.from(allAgents).map(name => ({ name }));
  const nodeIndex = new Map(nodes.map((n, i) => [n.name, i]));

  const links: SankeyData["links"] = [];
  for (const [source, targets] of flowMap) {
    for (const [target, value] of targets) {
      if (source === target) continue;
      links.push({
        source: nodeIndex.get(source)!,
        target: nodeIndex.get(target)!,
        value: parseFloat(value.toFixed(4)),
      });
    }
  }

  return { nodes, links };
}

function computeReputationsFromData(ledger: BudgetLedger, earnings: EarningsLedger, policyLog: PolicyLog): AgentReputation[] {
  const agentIds = new Set<string>();
  for (const e of ledger.entries) agentIds.add(e.apiKeyId);
  for (const e of earnings.entries) agentIds.add(e.agentId);

  return Array.from(agentIds).map(agentId => {
    const asBuyer = ledger.entries.filter(e => e.apiKeyId === agentId).length;
    const asSeller = earnings.entries.filter(e => e.agentId === agentId).length;
    const successful = asBuyer + asSeller;
    const blocked = policyLog.entries.filter(e => e.apiKeyId === agentId && !e.allowed).length;
    const total = successful + blocked;

    let score = 0;
    if (total > 0) {
      score = 50 + Math.round((successful / Math.max(total, 1)) * 20) + Math.min(Math.round((successful / 10) * 15), 15) - Math.min(blocked * 10, 30);
      score = Math.max(0, Math.min(100, score));
    }

    const level = score >= 85 ? "elite" as const : score >= 65 ? "verified" as const : score >= 40 ? "trusted" as const : "new" as const;

    return { agentId, score, level, successfulPayments: successful, blockedTransactions: blocked };
  });
}

// === Public types ===

export interface ActivityItem {
  timestamp: string;
  type: "spend" | "earn" | "block" | "pass" | "deadswitch" | "discovery";
  agentId: string;
  amount?: string;
  token?: string;
  description: string;
  txHash?: string;
}

export interface DiscoveryEvent {
  type: string;
  agentId: string;
  timestamp: string;
  detail: string;
}

export interface BudgetStatus {
  chainId: string;
  token: string;
  period: "daily" | "weekly" | "monthly";
  spent: number;
  limit: number;
  percentage: number;
}

// === Public functions ===

export async function getEconomyOverview(userId?: string) {
  const [spending, earnings, policyLog, budgetConfig] = await Promise.all([
    readLedgerAsync(userId),
    readEarningsLedgerAsync(userId),
    readPolicyLogAsync(userId),
    readBudgetConfigAsync(userId),
  ]);

  // Compute profiles from the fetched data
  const agentIds = new Set<string>();
  for (const e of earnings.entries) agentIds.add(e.agentId);
  for (const e of spending.entries) agentIds.add(e.apiKeyId);

  // OWS wallet discovery only for local/demo mode (no userId)
  if (!userId) {
    try {
      const { execSync } = require("node:child_process");
      const owsPath = `${require("node:os").homedir()}/.ows/bin`;
      const output = execSync("ows wallet list", {
        encoding: "utf-8",
        timeout: 5000,
        env: { ...process.env, PATH: `${owsPath}:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` },
      });
      const nameMatches = output.matchAll(/Name:\s+(\S+)/g);
      for (const match of nameMatches) {
        agentIds.add(match[1]);
      }
    } catch {
      // OWS not available — skip
    }
  }

  const profiles = Array.from(agentIds).map(agentId => computeAgentProfileFromData(agentId, earnings, spending));
  const sankeyData = computeSankeyFromData(earnings);

  const totalFlow = earnings.entries.reduce(
    (s, e) => s + parseFloat(e.amount),
    0
  );
  const totalBlocked = policyLog.entries.filter((e) => !e.allowed).length;
  const netProfit = profiles.reduce((s, p) => s + p.profitLoss, 0);

  // Build budget statuses
  const budgets: BudgetStatus[] = [];
  if (budgetConfig) {
    const apiKeyIds = [
      ...new Set(spending.entries.map((e) => e.apiKeyId)),
    ];
    if (apiKeyIds.length === 0) apiKeyIds.push("default");

    for (const limit of budgetConfig.limits) {
      const periods: ("daily" | "weekly" | "monthly")[] = [];
      if (limit.daily) periods.push("daily");
      if (limit.weekly) periods.push("weekly");
      if (limit.monthly) periods.push("monthly");

      for (const period of periods) {
        const limitValue = parseFloat(limit[period] as string);
        let totalSpent = 0;
        for (const apiKeyId of apiKeyIds) {
          totalSpent += getSpentInPeriod(
            spending,
            apiKeyId,
            limit.chainId,
            limit.token,
            period
          );
        }
        budgets.push({
          chainId: limit.chainId,
          token: limit.token,
          period,
          spent: totalSpent,
          limit: limitValue,
          percentage: limitValue > 0 ? (totalSpent / limitValue) * 100 : 0,
        });
      }
    }
  }

  // Build merged activity feed
  const activity: ActivityItem[] = [];

  for (const e of earnings.entries) {
    activity.push({
      timestamp: e.timestamp,
      type: "earn",
      agentId: e.agentId,
      amount: e.amount,
      token: e.token,
      description: `${e.agentId} earned ${e.amount} ${e.token} from ${e.fromAgent} (${e.endpoint})`,
      txHash: e.txHash,
    });
  }

  for (const e of spending.entries) {
    activity.push({
      timestamp: e.timestamp,
      type: "spend",
      agentId: e.apiKeyId,
      amount: e.amount,
      token: e.token,
      description:
        e.description ?? `${e.apiKeyId} spent ${e.amount} ${e.token}`,
      txHash: e.txHash,
    });
  }

  for (const e of policyLog.entries) {
    activity.push({
      timestamp: e.timestamp,
      type: e.allowed ? "pass" : "block",
      agentId: e.apiKeyId,
      description: `${e.policyName}: ${e.reason ?? (e.allowed ? "allowed" : "blocked")}`,
    });
  }

  // Add discovery events from XMTP message bus (demo mode only)
  const messages: ReturnType<typeof readMessages> = userId ? { messages: [] } : readMessages();
  for (const msg of messages.messages) {
    if (msg.type === "service_announcement") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} announced ${msg.services.length} service(s) via XMTP`,
      });
    } else if (msg.type === "service_query") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} discovered services: "${msg.query}" via XMTP`,
      });
    } else if (msg.type === "negotiation_offer") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} offered ${msg.offeredPrice} for ${msg.service} (listed at ${msg.originalPrice})`,
      });
    } else if (msg.type === "negotiation_response") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} ${msg.accepted ? "accepted" : "countered"} negotiation${msg.counterPrice ? ` at ${msg.counterPrice}` : ""}`,
      });
    } else if (msg.type === "health_ping" || msg.type === "health_pong") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} ${msg.type === "health_ping" ? "pinged" : "responded to"} ${msg.targetAgent}${msg.type === "health_pong" ? ` (${msg.status})` : ""}`,
      });
    } else if (msg.type === "payment_receipt") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} sent receipt to ${msg.toAgent} for ${msg.amount} ${msg.token}`,
      });
    } else if (msg.type === "reputation_gossip") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} rated ${msg.aboutAgent} as ${msg.rating}: ${msg.reason}`,
      });
    } else if (msg.type === "sla_agreement") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} ${msg.accepted ? "agreed" : "proposed"} SLA for ${msg.service} with ${msg.toAgent}`,
      });
    } else if (msg.type === "supply_chain_invite") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} created supply chain "${msg.description}" with ${msg.participants.length} agents`,
      });
    } else if (msg.type === "business_card") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} broadcast identity card — ${msg.services.length} service(s), reputation ${msg.reputation.score}/100 (${msg.reputation.level})`,
      });
    } else if (msg.type === "dispute") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} opened dispute against ${msg.againstAgent}: ${msg.reason}`,
      });
    } else if (msg.type === "dispute_response") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `${msg.agentId} ${msg.accepted ? "accepted" : "rejected"} dispute ${msg.disputeId}${msg.resolution ? `: ${msg.resolution}` : ""}`,
      });
    } else if (msg.type === "xmtp_notification") {
      activity.push({
        timestamp: msg.timestamp,
        type: "discovery",
        agentId: msg.agentId,
        description: `[${msg.severity.toUpperCase()}] ${msg.title}: ${msg.message}`,
      });
    }
  }

  activity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Build discovery events for the discovery feed
  const discoveryEvents: DiscoveryEvent[] = [];
  for (const msg of messages.messages) {
    if (msg.type === "service_announcement") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `announced ${msg.services.map((s) => s.endpoint).join(", ")}`,
      });
    } else if (msg.type === "service_query") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `queried for "${msg.query}"`,
      });
    } else if (msg.type === "service_response") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `responded to ${msg.inResponseTo} with ${msg.matches.length} match(es)`,
      });
    } else if (msg.type === "negotiation_offer") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `offered ${msg.offeredPrice} for ${msg.service} (listed at ${msg.originalPrice})`,
      });
    } else if (msg.type === "negotiation_response") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `${msg.accepted ? "accepted" : "countered"} negotiation${msg.counterPrice ? ` at ${msg.counterPrice}` : ""}`,
      });
    } else if (msg.type === "health_ping") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `pinged ${msg.targetAgent}`,
      });
    } else if (msg.type === "health_pong") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `responded to ${msg.targetAgent} (${msg.status}${msg.queueDepth !== undefined ? `, queue: ${msg.queueDepth}` : ""})`,
      });
    } else if (msg.type === "payment_receipt") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `sent receipt to ${msg.toAgent} for ${msg.amount} ${msg.token} (${msg.service})`,
      });
    } else if (msg.type === "reputation_gossip") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `rated ${msg.aboutAgent} as ${msg.rating}: "${msg.reason}"`,
      });
    } else if (msg.type === "sla_agreement") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `${msg.accepted ? "agreed" : "proposed"} SLA for ${msg.service} (${msg.terms.maxResponseTimeMs}ms, ${msg.terms.minUptime}% uptime)`,
      });
    } else if (msg.type === "supply_chain_invite") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `created supply chain "${msg.description}" with ${msg.participants.join(", ")}`,
      });
    } else if (msg.type === "business_card") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `broadcast identity — ${msg.services.length} service(s), reputation ${msg.reputation.score}/100 (${msg.reputation.level})`,
      });
    } else if (msg.type === "dispute") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `opened dispute against ${msg.againstAgent}: "${msg.reason}"`,
      });
    } else if (msg.type === "dispute_response") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `${msg.accepted ? "accepted" : "rejected"} dispute ${msg.disputeId}${msg.resolution ? ` — ${msg.resolution}` : ""}`,
      });
    } else if (msg.type === "xmtp_notification") {
      discoveryEvents.push({
        type: msg.type,
        agentId: msg.agentId,
        timestamp: msg.timestamp,
        detail: `[${msg.severity.toUpperCase()}] ${msg.title}`,
      });
    }
  }
  discoveryEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Generate economy insights
  const insights = generateDashboardInsights(profiles, spending, earnings, policyLog, budgetConfig);

  return {
    profiles,
    sankeyData,
    totalFlow,
    totalBlocked,
    netProfit,
    agentCount: profiles.length,
    activity: activity.slice(0, 30),
    budgetConfig,
    budgets,
    discoveryEvents,
    insights,
    reputations: computeReputationsFromData(spending, earnings, policyLog),
  };
}

export async function getAgentDetail(agentId: string, userId?: string) {
  const [spending, earnings, policyLog, budgetConfig] = await Promise.all([
    readLedgerAsync(userId),
    readEarningsLedgerAsync(userId),
    readPolicyLogAsync(userId),
    readBudgetConfigAsync(userId),
  ]);

  const profile = computeAgentProfileFromData(agentId, earnings, spending);

  const agentPolicyLog = policyLog.entries.filter(
    (e) => e.apiKeyId === agentId
  );

  const budgets: BudgetStatus[] = [];
  if (budgetConfig) {
    for (const limit of budgetConfig.limits) {
      const periods: ("daily" | "weekly" | "monthly")[] = [];
      if (limit.daily) periods.push("daily");
      if (limit.weekly) periods.push("weekly");
      if (limit.monthly) periods.push("monthly");

      for (const period of periods) {
        const limitValue = parseFloat(limit[period] as string);
        const spent = getSpentInPeriod(
          spending,
          agentId,
          limit.chainId,
          limit.token,
          period
        );
        budgets.push({
          chainId: limit.chainId,
          token: limit.token,
          period,
          spent,
          limit: limitValue,
          percentage: limitValue > 0 ? (spent / limitValue) * 100 : 0,
        });
      }
    }
  }

  return { profile, policyLog: agentPolicyLog, budgets };
}

export async function getPolicyData(userId?: string) {
  const [log, budgetConfig] = await Promise.all([
    readPolicyLogAsync(userId),
    readBudgetConfigAsync(userId),
  ]);
  // Guard and deadswitch configs are local-only (no Supabase table), so read sync
  const guardConfig = readGuardConfig();
  const deadswitchConfig = readDeadswitchConfig();
  return { log, budgetConfig, guardConfig, deadswitchConfig };
}
