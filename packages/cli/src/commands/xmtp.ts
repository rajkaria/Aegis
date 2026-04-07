import { Command } from "commander";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const XMTP_DIR = join(homedir(), ".ows", "aegis", "xmtp");
const KEYS_FILE = join(XMTP_DIR, "agent-keys.json");
const DIRECTORY_FILE = join(XMTP_DIR, "agent-directory.json");
const GROUPS_FILE = join(XMTP_DIR, "groups.json");
const INBOXES_DIR = join(XMTP_DIR, "inboxes");

function readJson(path: string): any {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return null; }
}

export const xmtpCommand = new Command("xmtp")
  .description("XMTP agent messaging — encrypted agent-to-agent communication");

// === aegis xmtp status ===
xmtpCommand
  .command("status")
  .description("Show XMTP messaging status")
  .action(() => {
    const hasWalletKey = !!process.env.XMTP_WALLET_KEY;
    const env = process.env.XMTP_ENV ?? "production";

    console.log("\nXMTP Agent Messaging Status\n");
    console.log(`  Transport:    ${hasWalletKey ? "XMTP Network" : "File Bus (local)"}`);
    console.log(`  Environment:  ${env}`);
    console.log(`  Encryption:   ${hasWalletKey ? "E2E (MLS protocol)" : "None (local files)"}`);
    console.log(`  Configured:   ${hasWalletKey ? "Yes (XMTP_WALLET_KEY set)" : "No — set XMTP_WALLET_KEY to enable"}`);

    // Agent keys
    const keys = readJson(KEYS_FILE);
    const keyCount = keys ? Object.keys(keys).length : 0;
    console.log(`\n  Registered Agents: ${keyCount}`);

    if (keys) {
      for (const [agentId, entry] of Object.entries(keys) as [string, any][]) {
        console.log(`    ${agentId.padEnd(20)} ${entry.address}`);
      }
    }

    // Directory
    const dir = readJson(DIRECTORY_FILE);
    const dirCount = dir ? Object.keys(dir).length : 0;
    console.log(`\n  Known Agents (Directory): ${dirCount}`);

    if (dir) {
      for (const [agentId, identity] of Object.entries(dir) as [string, any][]) {
        const status = identity.status ?? "unknown";
        const statusIcon = status === "online" ? "[+]" : status === "busy" ? "[~]" : "[-]";
        console.log(`    ${statusIcon} ${agentId.padEnd(20)} ${identity.address?.slice(0, 20) ?? "unresolved"}...  ${status}`);
      }
    }

    // Groups
    const groups = readJson(GROUPS_FILE);
    const groupCount = groups ? Object.keys(groups).length : 0;
    console.log(`\n  Agent Groups: ${groupCount}`);

    if (groups) {
      for (const [_id, group] of Object.entries(groups) as [string, any][]) {
        if (!group.active) continue;
        console.log(`    ${group.name.padEnd(25)} ${group.type.padEnd(15)} ${group.members.length} members`);
      }
    }

    // Message bus
    const msgPath = join(homedir(), ".ows", "aegis", "messages.json");
    const msgBus = readJson(msgPath);
    const msgCount = msgBus?.messages?.length ?? 0;
    console.log(`\n  Message Bus: ${msgCount} messages`);

    if (msgCount > 0) {
      const types: Record<string, number> = {};
      for (const msg of msgBus.messages) {
        types[msg.type] = (types[msg.type] ?? 0) + 1;
      }
      for (const [type, count] of Object.entries(types).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${type.padEnd(25)} ${count}`);
      }
    }

    console.log("");
  });

// === aegis xmtp init ===
xmtpCommand
  .command("init")
  .description("Initialize XMTP identity for an agent")
  .argument("<agentId>", "Agent ID to initialize")
  .option("-k, --key <key>", "Hex private key (generates random if not provided)")
  .action(async (agentId: string, opts: { key?: string }) => {
    // Dynamic import to avoid requiring @aegis-ows/gate at parse time
    try {
      const { registerAgentKey, generateAgentKey, getAgentKeyEntry } = await import("@aegis-ows/gate");

      const existing = getAgentKeyEntry(agentId);
      if (existing) {
        console.log(`\nAgent "${agentId}" already has an XMTP identity:`);
        console.log(`  Address: ${existing.address}`);
        console.log(`  Created: ${existing.createdAt}`);
        console.log(`\nTo reinitialize, delete ${KEYS_FILE} and retry.`);
        return;
      }

      const key = opts.key?.replace(/^0x/, "") ?? generateAgentKey();
      const entry = registerAgentKey(agentId, key);

      console.log(`\nXMTP identity created for "${agentId}":`);
      console.log(`  Address:  ${entry.address}`);
      console.log(`  Created:  ${entry.createdAt}`);
      console.log(`\nTo connect to XMTP network, set:`);
      console.log(`  export XMTP_WALLET_KEY=${key}`);
      console.log(`  export XMTP_ENV=production  # or "dev" for testnet`);
    } catch (err) {
      console.error(`Failed to initialize: ${(err as Error).message}`);
      console.error("Make sure @aegis-ows/gate is installed.");
    }
  });

// === aegis xmtp inbox ===
xmtpCommand
  .command("inbox")
  .description("View agent inbox")
  .argument("<agentId>", "Agent ID")
  .option("-u, --unread", "Show unread messages only")
  .option("-t, --type <type>", "Filter by message type")
  .option("-n, --limit <n>", "Limit results", "20")
  .action(async (agentId: string, opts: { unread?: boolean; type?: string; limit: string }) => {
    try {
      const { queryInbox, getInboxStats } = await import("@aegis-ows/gate");

      const stats = getInboxStats(agentId);
      console.log(`\nInbox for "${agentId}": ${stats.total} total, ${stats.unread} unread\n`);

      if (stats.total === 0) {
        console.log("  No messages yet. Messages arrive when agents communicate via the bus.");
        return;
      }

      const messages = queryInbox(agentId, {
        unreadOnly: opts.unread,
        type: opts.type,
        limit: parseInt(opts.limit),
      });

      for (const msg of messages) {
        const readIcon = msg.read ? " " : "*";
        const prioIcon = msg.priority === "urgent" ? "!!" : msg.priority === "high" ? "!" : " ";
        const time = new Date(msg.receivedAt).toLocaleTimeString();
        const from = msg.message.agentId;
        const type = msg.message.type;

        console.log(`  ${readIcon}${prioIcon} [${time}] ${type.padEnd(22)} from ${from}`);

        // Show a one-liner preview
        const preview = getMessagePreview(msg.message);
        if (preview) {
          console.log(`      ${preview}`);
        }
      }

      console.log("");
    } catch (err) {
      console.error(`Failed to read inbox: ${(err as Error).message}`);
    }
  });

// === aegis xmtp send ===
xmtpCommand
  .command("send")
  .description("Send a direct message to another agent")
  .argument("<from>", "Sender agent ID")
  .argument("<to>", "Recipient agent ID")
  .argument("<message>", "Message content")
  .action(async (from: string, to: string, message: string) => {
    try {
      const { postMessage } = await import("@aegis-ows/shared");

      postMessage({
        type: "direct_message",
        agentId: from,
        timestamp: new Date().toISOString(),
        toAgent: to,
        content: message,
        contentType: "text",
        encrypted: !!process.env.XMTP_WALLET_KEY,
      });

      console.log(`\nMessage sent from "${from}" to "${to}"`);
      console.log(`  Content: ${message}`);
      console.log(`  Encrypted: ${process.env.XMTP_WALLET_KEY ? "Yes (XMTP E2E)" : "No (local file bus)"}`);
    } catch (err) {
      console.error(`Failed to send: ${(err as Error).message}`);
    }
  });

// === aegis xmtp agents ===
xmtpCommand
  .command("agents")
  .description("List known agents in the directory")
  .option("-s, --status <status>", "Filter by status (online, offline, busy, away)")
  .action(async (opts: { status?: string }) => {
    try {
      const { listAgents, syncDirectoryFromAnnouncements } = await import("@aegis-ows/gate");

      // Sync from message bus first
      const newAgents = syncDirectoryFromAnnouncements();
      if (newAgents > 0) {
        console.log(`  Discovered ${newAgents} new agent(s) from announcements.`);
      }

      const agents = listAgents(opts.status ? { status: opts.status as any } : undefined);

      console.log(`\nAgent Directory (${agents.length} agents)\n`);
      console.log(`  ${"Agent".padEnd(20)} ${"Address".padEnd(14)} ${"Status".padEnd(10)} ${"Services".padEnd(8)} Last Seen`);
      console.log(`  ${"-".repeat(75)}`);

      for (const agent of agents) {
        const addr = agent.address.startsWith("0x") ? agent.address.slice(0, 12) + "..." : agent.address;
        const svcCount = agent.services?.length ?? 0;
        const lastSeen = new Date(agent.lastSeen).toLocaleString();
        const statusIcon = agent.status === "online" ? "+" : agent.status === "busy" ? "~" : "-";
        console.log(`  ${agent.agentId.padEnd(20)} ${addr.padEnd(14)} [${statusIcon}] ${agent.status.padEnd(6)} ${String(svcCount).padEnd(8)} ${lastSeen}`);
      }
      console.log("");
    } catch (err) {
      console.error(`Failed to list agents: ${(err as Error).message}`);
    }
  });

// === aegis xmtp groups ===
xmtpCommand
  .command("groups")
  .description("List agent groups")
  .option("-a, --agent <agentId>", "Filter by agent membership")
  .action(async (opts: { agent?: string }) => {
    try {
      const { listGroups } = await import("@aegis-ows/gate");
      const groups = listGroups(opts.agent);

      console.log(`\nAgent Groups (${groups.length})\n`);

      for (const group of groups) {
        if (!group.active) continue;
        console.log(`  ${group.name}`);
        console.log(`    Type:    ${group.type}`);
        console.log(`    Members: ${group.members.join(", ")}`);
        console.log(`    Created: ${new Date(group.createdAt).toLocaleString()} by ${group.createdBy}`);
        if (group.xmtpConversationId) {
          console.log(`    XMTP:    Connected (${group.xmtpConversationId.slice(0, 16)}...)`);
        }
        console.log("");
      }

      if (groups.length === 0) {
        console.log("  No groups yet. Create one with your agent code or the API.\n");
      }
    } catch (err) {
      console.error(`Failed to list groups: ${(err as Error).message}`);
    }
  });

// === Helpers ===

function getMessagePreview(msg: any): string {
  switch (msg.type) {
    case "service_announcement":
      return `Services: ${msg.services?.map((s: any) => s.endpoint).join(", ") ?? "none"}`;
    case "service_query":
      return `Query: "${msg.query}"`;
    case "negotiation_offer":
      return `Offered ${msg.offeredPrice} for ${msg.service} (listed at ${msg.originalPrice})`;
    case "negotiation_response":
      return `${msg.accepted ? "Accepted" : "Countered"}${msg.counterPrice ? ` at ${msg.counterPrice}` : ""}`;
    case "payment_receipt":
      return `Receipt: ${msg.amount} ${msg.token} for ${msg.service}`;
    case "reputation_gossip":
      return `Rated ${msg.aboutAgent} as ${msg.rating}: ${msg.reason}`;
    case "health_ping":
      return `Ping -> ${msg.targetAgent}`;
    case "health_pong":
      return `Pong: ${msg.status}${msg.queueDepth !== undefined ? `, queue: ${msg.queueDepth}` : ""}`;
    case "direct_message":
      return `DM: ${(msg.content ?? "").slice(0, 60)}${(msg.content ?? "").length > 60 ? "..." : ""}`;
    case "presence_update":
      return `Status: ${msg.status}${msg.statusMessage ? ` — ${msg.statusMessage}` : ""}`;
    case "sla_agreement":
      return `SLA for ${msg.service}: ${msg.terms?.maxResponseTimeMs}ms, ${msg.terms?.minUptime}% uptime`;
    case "supply_chain_invite":
      return `Chain: "${msg.description}" with ${msg.participants?.join(", ")}`;
    default:
      return "";
  }
}
