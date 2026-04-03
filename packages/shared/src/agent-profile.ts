import { readLedger } from "./ledger.js";
import { readEarningsLedger } from "./earnings.js";
import type { AgentProfile, SankeyData } from "./types.js";

export function computeAgentProfile(agentId: string): AgentProfile {
  const earnings = readEarningsLedger();
  const spending = readLedger();

  // Revenue: earnings where this agent is the seller
  const revenueEntries = earnings.entries.filter(e => e.agentId === agentId);
  const totalRevenue = revenueEntries.reduce((s, e) => s + parseFloat(e.amount), 0);

  // Spending: ledger entries where this agent is the buyer
  const spendingEntries = spending.entries.filter(e => e.apiKeyId === agentId);
  const totalSpending = spendingEntries.reduce((s, e) => s + parseFloat(e.amount), 0);

  // Revenue by endpoint
  const endpointMap = new Map<string, { revenue: number; calls: number }>();
  for (const e of revenueEntries) {
    const cur = endpointMap.get(e.endpoint) ?? { revenue: 0, calls: 0 };
    cur.revenue += parseFloat(e.amount);
    cur.calls += 1;
    endpointMap.set(e.endpoint, cur);
  }

  // Spending by vendor (extract vendor from description or tool field)
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

export function computeAllProfiles(): AgentProfile[] {
  const earnings = readEarningsLedger();
  const spending = readLedger();

  const agentIds = new Set<string>();
  for (const e of earnings.entries) agentIds.add(e.agentId);
  for (const e of spending.entries) agentIds.add(e.apiKeyId);

  return Array.from(agentIds).map(id => computeAgentProfile(id));
}

export function computeSankeyData(): SankeyData {
  const earnings = readEarningsLedger();

  // Build flow map: fromAgent -> agentId -> total value
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
      if (source === target) continue; // skip self-payments
      links.push({
        source: nodeIndex.get(source)!,
        target: nodeIndex.get(target)!,
        value: parseFloat(value.toFixed(4)),
      });
    }
  }

  return { nodes, links };
}
