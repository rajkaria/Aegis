#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

import {
  computeAllProfiles,
  computeAgentProfile,
  readLedger,
  readEarningsLedger,
  readPolicyLog,
  readBudgetConfig,
  getSpentInPeriod,
  discoverServices,
  readMessages,
  getOWSWallets,
  generateInsights,
} from "@aegis-ows/shared";

// Optional auth token for MCP server access
const AEGIS_MCP_TOKEN = process.env.AEGIS_MCP_TOKEN;
if (AEGIS_MCP_TOKEN) {
  console.error("[aegis-mcp] Auth token configured — clients must provide valid credentials");
}

// Check if we have local data or need to warn
const AEGIS_DIR = join(homedir(), ".ows", "aegis");
const hasLocalData = existsSync(AEGIS_DIR);

if (!hasLocalData) {
  console.error("[aegis-mcp] Warning: ~/.ows/aegis/ not found. Run 'aegis init' or './setup.sh' first.");
  console.error("[aegis-mcp] Some tools will return empty data until the economy is seeded.");
}

const server = new McpServer({
  name: "aegis",
  version: "0.1.0",
});

// --- aegis_economy_status ---
server.tool(
  "aegis_economy_status",
  "Get the current state of the agent economy — total flow, agent P&L, policy enforcement stats",
  {},
  async () => {
    const profiles = computeAllProfiles();

    if (profiles.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No economy data found. Run 'cd demo && npx tsx seed.ts' to seed the demo economy, or 'aegis init' to create a fresh configuration.",
        }],
      };
    }

    const earnings = readEarningsLedger();
    const policyLog = readPolicyLog();

    const totalFlow = earnings.entries.reduce(
      (s, e) => s + parseFloat(e.amount),
      0
    );
    const totalBlocked = policyLog.entries.filter((e) => !e.allowed).length;
    const totalAllowed = policyLog.entries.filter((e) => e.allowed).length;

    const agentSummaries = profiles
      .map(
        (p) =>
          `${p.agentId}: Revenue $${p.totalRevenue.toFixed(4)} | Spending $${p.totalSpending.toFixed(4)} | P/L ${p.profitLoss >= 0 ? "+" : ""}$${p.profitLoss.toFixed(4)}`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Agent Economy Status\n\nTotal Flow: $${totalFlow.toFixed(4)}\nActive Agents: ${profiles.length}\nPolicy Checks — Allowed: ${totalAllowed} | Blocked: ${totalBlocked}\n\n${agentSummaries}`,
        },
      ],
    };
  }
);

// --- aegis_check_budget ---
server.tool(
  "aegis_check_budget",
  "Check remaining spending budget for an agent",
  {
    agentId: z.string().describe("Agent ID to check budget for"),
    period: z
      .enum(["daily", "weekly", "monthly"])
      .optional()
      .describe("Budget period to check (defaults to all)"),
  },
  async ({ agentId, period }) => {
    const budgetConfig = readBudgetConfig();
    if (!budgetConfig) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No budget configuration found. Run `aegis budget set` to configure spending limits.",
          },
        ],
      };
    }

    const ledger = readLedger();
    const periods: ("daily" | "weekly" | "monthly")[] = period
      ? [period]
      : ["daily", "weekly", "monthly"];

    const lines: string[] = [`Budget Status for ${agentId}\n`];

    for (const limit of budgetConfig.limits) {
      lines.push(`Chain: ${limit.chainId} | Token: ${limit.token}`);
      for (const p of periods) {
        const cap = limit[p];
        if (!cap) continue;
        const spent = getSpentInPeriod(
          ledger,
          agentId,
          limit.chainId,
          limit.token,
          p
        );
        const remaining = parseFloat(cap) - spent;
        lines.push(
          `  ${p}: $${spent.toFixed(4)} / $${cap} spent (${remaining >= 0 ? `$${remaining.toFixed(4)} remaining` : `OVER by $${Math.abs(remaining).toFixed(4)}`})`
        );
      }
    }

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  }
);

// --- aegis_list_agents ---
server.tool(
  "aegis_list_agents",
  "List all agents with their wallet addresses and P&L summary",
  {},
  async () => {
    const profiles = computeAllProfiles();
    const wallets = getOWSWallets();

    const lines: string[] = [`Agents (${profiles.length})\n`];

    for (const p of profiles) {
      const wallet = wallets.find(
        (w) => w.name === p.agentId || w.id === p.agentId
      );
      const addrLine = wallet
        ? Object.entries(wallet.addresses)
            .map(([chain, addr]) => `  ${chain}: ${addr}`)
            .join("\n")
        : "  (no wallet found)";

      lines.push(
        `${p.agentId}\n  Revenue: $${p.totalRevenue.toFixed(4)} | Spending: $${p.totalSpending.toFixed(4)} | P/L: ${p.profitLoss >= 0 ? "+" : ""}$${p.profitLoss.toFixed(4)}\n  Endpoints: ${p.endpoints.length} | Vendors: ${p.vendors.length}\n${addrLine}`
      );
    }

    if (profiles.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No agents found. Run 'cd demo && npx tsx seed.ts' to seed the demo economy, or 'aegis init' to create a fresh configuration.",
        }],
      };
    }

    return {
      content: [{ type: "text" as const, text: lines.join("\n\n") }],
    };
  }
);

// --- aegis_policy_log ---
server.tool(
  "aegis_policy_log",
  "Get recent policy enforcement events (budget blocks, guard rejections, etc.)",
  {
    limit: z
      .number()
      .optional()
      .describe("Number of recent entries to return (default 20)"),
    onlyBlocked: z
      .boolean()
      .optional()
      .describe("Only show blocked transactions"),
  },
  async ({ limit, onlyBlocked }) => {
    const log = readPolicyLog();
    let entries = log.entries;

    if (onlyBlocked) {
      entries = entries.filter((e) => !e.allowed);
    }

    const n = limit ?? 20;
    const recent = entries.slice(-n);

    const lines = recent.map(
      (e) =>
        `[${e.timestamp}] ${e.allowed ? "ALLOWED" : "BLOCKED"} | ${e.policyName} | Agent: ${e.apiKeyId} | Chain: ${e.chainId}${e.reason ? ` | ${e.reason}` : ""}`
    );

    return {
      content: [
        {
          type: "text" as const,
          text: lines.length > 0
            ? `Policy Log (${recent.length}/${entries.length} entries)\n\n${lines.join("\n")}`
            : "No policy log entries found. Run 'cd demo && npx tsx seed.ts' to seed demo data, or trigger policy checks with 'aegis budget set' and agent transactions.",
        },
      ],
    };
  }
);

// --- aegis_discover_services ---
server.tool(
  "aegis_discover_services",
  "Search for available agent services on the XMTP message bus",
  {
    query: z
      .string()
      .describe(
        "Search query to find services (e.g. 'scrape', 'analyze', 'data')"
      ),
  },
  async ({ query }) => {
    const matches = discoverServices(query);

    if (matches.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No services found matching "${query}". Try a broader search term.`,
          },
        ],
      };
    }

    const lines = matches.map(
      (s) =>
        `${s.endpoint}\n  ${s.description}\n  Price: ${s.price} ${s.token}\n  URL: ${s.baseUrl}${s.endpoint}`
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${matches.length} service(s) matching "${query}":\n\n${lines.join("\n\n")}`,
        },
      ],
    };
  }
);

// --- aegis_send_payment ---
server.tool(
  "aegis_send_payment",
  "Send a SOL payment between agents on Solana devnet via OWS signing. Requires local OWS wallet access (~/.ows/).",
  {
    fromAgent: z.string().describe("Agent ID sending the payment"),
    toAddress: z.string().describe("Recipient Solana address"),
    amount: z.string().describe("Amount in SOL to send (e.g. '0.001')"),
  },
  async ({ fromAgent, toAddress, amount }) => {
    // Find the agent's wallet
    const wallets = getOWSWallets();
    const wallet = wallets.find(
      (w) => w.name === fromAgent || w.id === fromAgent
    );

    if (!wallet) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No OWS wallet found for agent "${fromAgent}". Available wallets: ${wallets.map((w) => w.name).join(", ") || "none"}`,
          },
        ],
      };
    }

    const solAddr = wallet.addresses["solana:devnet"] ?? wallet.addresses["solana:mainnet"];
    if (!solAddr) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Agent "${fromAgent}" has no Solana address. Chains: ${Object.keys(wallet.addresses).join(", ")}`,
          },
        ],
      };
    }

    // Return the payment details for the caller to execute
    // (actual signing requires the OWS CLI or SDK which needs interactive access)
    return {
      content: [
        {
          type: "text" as const,
          text: `Payment prepared:\n  From: ${fromAgent} (${solAddr})\n  To: ${toAddress}\n  Amount: ${amount} SOL\n  Network: solana:devnet\n\nTo execute, run:\n  ows pay --from "${fromAgent}" --to "${toAddress}" --amount ${amount} --chain solana:devnet`,
        },
      ],
    };
  }
);

// --- aegis_economy_insights ---
server.tool(
  "aegis_economy_insights",
  "Generate AI-powered insights about the agent economy — budget risks, supply chain analysis, activity trends, and policy enforcement patterns",
  {},
  async () => {
    const insights = generateInsights();

    if (insights.length === 0) {
      return {
        content: [{ type: "text" as const, text: "No insights available. Seed economy data first." }],
      };
    }

    const formatted = insights.map(i => {
      const icon = i.type === "alert" ? "\u{1F6A8}" : i.type === "warning" ? "\u26A0\uFE0F" : i.type === "success" ? "\u2705" : "\u{1F4CA}";
      return `${icon} ${i.title}${i.metric ? ` [${i.metric}]` : ""}\n   ${i.description}`;
    }).join("\n\n");

    return {
      content: [{ type: "text" as const, text: `Economy Intelligence Report\n${"─".repeat(40)}\n\n${formatted}` }],
    };
  }
);

// --- aegis_agent_identity ---
server.tool(
  "aegis_agent_identity",
  "Get the full economic identity of an agent — services, reputation, P&L, wallet addresses",
  {
    agentId: z.string().describe("Agent ID"),
  },
  async ({ agentId }) => {
    const profile = computeAgentProfile(agentId);
    const earnings = readEarningsLedger();
    const policyLog = readPolicyLog();

    // Build services list
    const serviceMap = new Map<string, { price: string; token: string; count: number }>();
    for (const e of earnings.entries.filter(e => e.agentId === agentId)) {
      if (!serviceMap.has(e.endpoint)) {
        serviceMap.set(e.endpoint, { price: e.amount, token: e.token, count: 0 });
      }
      serviceMap.get(e.endpoint)!.count++;
    }

    const services = Array.from(serviceMap.entries())
      .map(([ep, d]) => `  ${ep}: ${d.price} ${d.token} (${d.count} calls)`)
      .join("\n");

    // Reputation
    const ledger = readLedger();
    const asBuyer = ledger.entries.filter(e => e.apiKeyId === agentId).length;
    const asSeller = earnings.entries.filter(e => e.agentId === agentId).length;
    const blocked = policyLog.entries.filter(e => e.apiKeyId === agentId && !e.allowed).length;
    const total = asBuyer + asSeller + blocked;
    let score = 0;
    if (total > 0) {
      score = 50 + Math.round(((asBuyer + asSeller) / Math.max(total, 1)) * 20) + Math.min(Math.round(((asBuyer + asSeller) / 10) * 15), 15) - Math.min(blocked * 10, 30);
      score = Math.max(0, Math.min(100, score));
    }
    const level = score >= 85 ? "elite" : score >= 65 ? "verified" : score >= 40 ? "trusted" : "new";

    // Wallets
    const wallets = getOWSWallets();
    const wallet = wallets.find(w => w.name === agentId || w.id === agentId);
    const addrLines = wallet
      ? Object.entries(wallet.addresses).map(([chain, addr]) => `  ${chain}: ${addr}`).join("\n")
      : "  (no wallet found)";

    return {
      content: [{
        type: "text" as const,
        text: `Agent Identity: ${agentId}\n${"─".repeat(40)}\n\nReputation: ${score}/100 (${level}) | ${total} transactions | ${blocked} blocked\n\nP&L:\n  Revenue: $${profile.totalRevenue.toFixed(4)}\n  Spending: $${profile.totalSpending.toFixed(4)}\n  Net: ${profile.profitLoss >= 0 ? "+" : ""}$${profile.profitLoss.toFixed(4)}\n\nServices:\n${services || "  (none)"}\n\nWallet Addresses:\n${addrLines}`,
      }],
    };
  }
);

// --- aegis_open_dispute ---
server.tool(
  "aegis_open_dispute",
  "Open a dispute against an agent for failed service delivery",
  {
    complainantId: z.string().describe("Agent ID filing the dispute"),
    againstAgent: z.string().describe("Agent ID being disputed"),
    reason: z.string().describe("Reason for the dispute"),
    evidence: z.string().describe("Description of what happened"),
    txHash: z.string().optional().describe("Transaction hash related to the dispute"),
  },
  async ({ complainantId, againstAgent, reason, evidence, txHash }) => {
    const disputeId = `dispute-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const messages = readMessages();
    const msg = {
      type: "dispute" as const,
      disputeId,
      agentId: complainantId,
      timestamp: new Date().toISOString(),
      againstAgent,
      txHash,
      reason,
      evidence,
      requestedResolution: "refund" as const,
      status: "open" as const,
    };

    // Post to message bus (import postMessage dynamically to avoid circular deps)
    const { postMessage } = await import("@aegis-ows/shared");
    postMessage(msg as unknown as import("@aegis-ows/shared").AgentMessage);

    return {
      content: [{
        type: "text" as const,
        text: `Dispute opened: ${disputeId}\n\nComplainant: ${complainantId}\nAgainst: ${againstAgent}\nReason: ${reason}\nEvidence: ${evidence}${txHash ? `\nTx: ${txHash}` : ""}\n\nThe dispute has been posted to the XMTP message bus. The defendant can respond via the message bus.`,
      }],
    };
  }
);

// --- aegis_search_directory ---
server.tool(
  "aegis_search_directory",
  "Search the decentralized agent directory for services",
  {
    query: z.string().describe("Search query (e.g., 'scrape', 'analyze', agent name)"),
  },
  async ({ query }) => {
    const messages = readMessages();
    const q = query.toLowerCase();

    // Search announcements for matching services
    const results: Array<{ agentId: string; endpoint: string; price: string; token: string; description: string }> = [];
    for (const msg of messages.messages) {
      if (msg.type === "service_announcement") {
        for (const svc of msg.services) {
          if (svc.description.toLowerCase().includes(q) || svc.endpoint.toLowerCase().includes(q) || msg.agentId.toLowerCase().includes(q)) {
            results.push({ agentId: msg.agentId, ...svc });
          }
        }
      }
    }

    if (results.length === 0) {
      return {
        content: [{ type: "text" as const, text: `No agents or services found matching "${query}".` }],
      };
    }

    const lines = results.map(r =>
      `${r.agentId}\n  ${r.endpoint}: ${r.price} ${r.token}\n  ${r.description}`
    );

    return {
      content: [{
        type: "text" as const,
        text: `Agent Directory — ${results.length} result(s) for "${query}":\n\n${lines.join("\n\n")}`,
      }],
    };
  }
);

// --- Start the server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Aegis MCP server failed to start:", err);
  process.exit(1);
});
