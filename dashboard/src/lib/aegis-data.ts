// Use the data provider which falls back to bundled seed data on Vercel
import {
  readLedger,
  readEarningsLedger,
  readPolicyLog,
  readBudgetConfig,
  readGuardConfig,
  readDeadswitchConfig,
  readMessages,
} from "@/lib/data-provider";
import {
  getSpentInPeriod,
} from "@/lib/types";
import type {
  AgentProfile,
  SankeyData,
  PolicyLogEntry,
  EarningsEntry,
  LedgerEntry,
  BudgetLedger,
  EarningsLedger,
} from "@/lib/types";

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

// === Public types ===

export interface ActivityItem {
  timestamp: string;
  type: "spend" | "earn" | "block" | "pass" | "deadswitch" | "discovery";
  agentId: string;
  amount?: string;
  token?: string;
  description: string;
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

export function getEconomyOverview() {
  const profiles = computeAllProfiles();
  const sankeyData = computeSankeyData();
  const policyLog = readPolicyLog();
  const earnings = readEarningsLedger();
  const spending = readLedger();
  const budgetConfig = readBudgetConfig();

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
      description: `${e.agentId} earned $${e.amount} from ${e.fromAgent} (${e.endpoint})`,
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
        e.description ?? `${e.apiKeyId} spent $${e.amount} ${e.token}`,
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

  // Add discovery events from XMTP message bus
  const messages = readMessages();
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
    }
  }
  discoveryEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
  };
}

export function getAgentDetail(agentId: string) {
  const profile = computeAgentProfile(agentId);
  const policyLog = readPolicyLog();
  const budgetConfig = readBudgetConfig();
  const spending = readLedger();

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

export function getPolicyData() {
  const log = readPolicyLog();
  const budgetConfig = readBudgetConfig();
  const guardConfig = readGuardConfig();
  const deadswitchConfig = readDeadswitchConfig();
  return { log, budgetConfig, guardConfig, deadswitchConfig };
}
