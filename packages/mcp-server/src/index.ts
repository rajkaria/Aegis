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
} from "@aegis-ows/shared";

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
  "Send a SOL payment between agents on Solana devnet via OWS signing",
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

// --- Start the server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Aegis MCP server failed to start:", err);
  process.exit(1);
});
