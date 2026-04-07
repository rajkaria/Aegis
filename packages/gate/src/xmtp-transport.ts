/**
 * XMTP Network Transport
 *
 * Implements the MessageTransport interface using the XMTP network.
 * Messages are sent as JSON payloads in XMTP conversations.
 *
 * Architecture:
 * - One "broadcast" group conversation for public messages (announcements, queries)
 * - Direct 1:1 conversations for private messages (negotiations, receipts, DMs)
 * - Local cache synced with file-based bus for dashboard compatibility
 * - Real-time streaming via XMTP's native message streaming
 *
 * When XMTP is active, messages flow to both the XMTP network AND the local
 * file bus — ensuring the dashboard and CLI always have visibility.
 */

import type { MessageTransport, TransportStatus } from "@aegis-ows/shared";
import type { AgentMessage, MessageBus } from "@aegis-ows/shared";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { initXmtpClient, type XmtpClientHandle } from "./xmtp-client.js";

// === Constants ===

const AEGIS_BROADCAST_TOPIC = "aegis-agent-bus-v1";
const XMTP_CACHE_DIR = join(homedir(), ".ows", "aegis", "xmtp", "cache");
const XMTP_CACHE_FILE = join(XMTP_CACHE_DIR, "messages-cache.json");

// Message types that should be broadcast (public)
const BROADCAST_TYPES = new Set([
  "service_announcement",
  "service_query",
  "service_response",
  "health_ping",
  "health_pong",
  "reputation_gossip",
  "supply_chain_invite",
  "presence_update",
]);

// Message types that should be direct (private, addressed)
const DIRECT_TYPES = new Set([
  "negotiation_offer",
  "negotiation_response",
  "payment_receipt",
  "sla_agreement",
  "direct_message",
  "delivery_receipt",
  "group_invite",
]);

// === Transport Stats ===

interface XmtpTransportStats {
  messagesSent: number;
  messagesReceived: number;
  broadcastsSent: number;
  directsSent: number;
  connectedSince: string;
  lastMessageAt: string | null;
  peersDiscovered: Set<string>;
}

// === XMTP Transport Implementation ===

export class XmtpTransport implements MessageTransport {
  readonly name = "xmtp";
  readonly supportsStreaming = true;
  readonly encrypted = true;

  private clientHandle: XmtpClientHandle | null = null;
  private agentId: string;
  private broadcastConversation: unknown = null;
  private directConversations = new Map<string, unknown>();
  private subscribers = new Set<(msg: AgentMessage) => void>();
  private streamAbort: AbortController | null = null;
  private messageCache: AgentMessage[] = [];
  private stats: XmtpTransportStats;

  constructor(agentId: string) {
    this.agentId = agentId;
    this.stats = {
      messagesSent: 0,
      messagesReceived: 0,
      broadcastsSent: 0,
      directsSent: 0,
      connectedSince: new Date().toISOString(),
      lastMessageAt: null,
      peersDiscovered: new Set(),
    };

    // Load cached messages
    this.loadCache();
  }

  /**
   * Initialize the XMTP connection.
   * Must be called before post/read/subscribe.
   */
  async connect(): Promise<boolean> {
    this.clientHandle = await initXmtpClient(this.agentId);
    if (!this.clientHandle) return false;

    try {
      // Join or create the broadcast group conversation
      await this.joinBroadcastGroup();
      // Start streaming messages in the background
      this.startStreaming();
      return true;
    } catch (err) {
      console.warn(`[aegis-xmtp] Failed to connect: ${err}`);
      return false;
    }
  }

  async post(msg: AgentMessage): Promise<void> {
    // Always write to local cache for dashboard visibility
    this.messageCache.push(msg);
    this.saveCache();
    this.stats.messagesSent++;
    this.stats.lastMessageAt = new Date().toISOString();

    // If XMTP is connected, also send over the network
    if (this.clientHandle?.connected) {
      try {
        const payload = JSON.stringify({
          aegisVersion: 1,
          message: msg,
          sender: this.agentId,
          sentAt: new Date().toISOString(),
        });

        if (BROADCAST_TYPES.has(msg.type)) {
          await this.sendBroadcast(payload);
          this.stats.broadcastsSent++;
        } else if (DIRECT_TYPES.has(msg.type) && "toAgent" in msg) {
          const toAgent = (msg as any).toAgent as string;
          await this.sendDirect(toAgent, payload);
          this.stats.directsSent++;
        } else {
          // Default to broadcast for unknown types
          await this.sendBroadcast(payload);
          this.stats.broadcastsSent++;
        }
      } catch (err) {
        // Network send failed — message is still in local cache
        console.warn(`[aegis-xmtp] Network send failed, cached locally: ${err}`);
      }
    }

    // Notify local subscribers
    for (const sub of this.subscribers) {
      try { sub(msg); } catch { /* subscriber error */ }
    }
  }

  async read(): Promise<MessageBus> {
    // Sync from XMTP network if connected
    if (this.clientHandle?.connected) {
      await this.syncFromNetwork();
    }

    return { messages: [...this.messageCache] };
  }

  async subscribe(callback: (msg: AgentMessage) => void): Promise<() => void> {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  async close(): Promise<void> {
    // Stop streaming
    if (this.streamAbort) {
      this.streamAbort.abort();
      this.streamAbort = null;
    }

    // Save final cache state
    this.saveCache();

    // Clear subscribers
    this.subscribers.clear();

    // Close XMTP client
    if (this.clientHandle) {
      try {
        const client = this.clientHandle.client as any;
        if (typeof client?.close === "function") {
          await client.close();
        }
      } catch { /* ignore */ }
      this.clientHandle = null;
    }
  }

  /**
   * Get transport status for dashboard.
   */
  getStatus(): TransportStatus {
    return {
      name: this.name,
      connected: this.clientHandle?.connected ?? false,
      encrypted: this.encrypted,
      supportsStreaming: this.supportsStreaming,
      agentAddress: this.clientHandle?.address,
      networkEnv: this.clientHandle?.config.env,
      connectedPeers: this.stats.peersDiscovered.size,
      messagesRelayed: this.stats.messagesSent + this.stats.messagesReceived,
    };
  }

  /**
   * Get raw stats for diagnostics.
   */
  getStats(): Omit<XmtpTransportStats, "peersDiscovered"> & { peersDiscovered: string[] } {
    return {
      ...this.stats,
      peersDiscovered: [...this.stats.peersDiscovered],
    };
  }

  // === Private Methods ===

  private async joinBroadcastGroup(): Promise<void> {
    if (!this.clientHandle?.client) return;

    const client = this.clientHandle.client as any;

    try {
      // Sync conversations from network
      if (typeof client.conversations?.sync === "function") {
        await client.conversations.sync();
      }

      // Look for existing broadcast group by metadata
      if (typeof client.conversations?.list === "function") {
        const conversations = await client.conversations.list();
        for (const conv of conversations) {
          const meta = typeof conv.metadata === "function" ? await conv.metadata() : conv.metadata;
          if (meta?.topic === AEGIS_BROADCAST_TOPIC) {
            this.broadcastConversation = conv;
            return;
          }
        }
      }

      // Create new broadcast group if none found
      if (typeof client.conversations?.newGroup === "function") {
        this.broadcastConversation = await client.conversations.newGroup(
          [], // Start with just ourselves; others join via discovery
          {
            name: "Aegis Agent Bus",
            description: "Public broadcast channel for agent service discovery and coordination",
            metadata: { topic: AEGIS_BROADCAST_TOPIC },
          }
        );
      }
    } catch (err) {
      console.warn(`[aegis-xmtp] Could not join broadcast group: ${err}`);
    }
  }

  private async sendBroadcast(payload: string): Promise<void> {
    if (!this.broadcastConversation) return;

    const conv = this.broadcastConversation as any;
    if (typeof conv.send === "function") {
      await conv.send(payload);
    }
  }

  private async sendDirect(toAgentId: string, payload: string): Promise<void> {
    if (!this.clientHandle?.client) return;

    const client = this.clientHandle.client as any;

    // Check cache for existing conversation
    let conv = this.directConversations.get(toAgentId);

    if (!conv) {
      try {
        // Resolve the target agent's XMTP address
        const { resolveAgentAddress } = await import("./xmtp-identity.js");
        const targetAddress = resolveAgentAddress(toAgentId);

        if (!targetAddress) {
          console.warn(`[aegis-xmtp] Cannot resolve address for agent: ${toAgentId}`);
          return;
        }

        // Check if they can receive XMTP messages
        if (typeof client.canMessage === "function") {
          const canMessage = await client.canMessage([targetAddress]);
          if (!canMessage?.[0]) {
            console.warn(`[aegis-xmtp] Agent ${toAgentId} (${targetAddress}) is not on XMTP network`);
            return;
          }
        }

        // Create a new DM conversation
        if (typeof client.conversations?.newDm === "function") {
          conv = await client.conversations.newDm(targetAddress);
        } else if (typeof client.conversations?.newGroup === "function") {
          conv = await client.conversations.newGroup([targetAddress], {
            name: `DM: ${this.agentId} <-> ${toAgentId}`,
            metadata: { type: "dm", participants: JSON.stringify([this.agentId, toAgentId]) },
          });
        }

        if (conv) {
          this.directConversations.set(toAgentId, conv);
        }
      } catch (err) {
        console.warn(`[aegis-xmtp] Failed to create DM with ${toAgentId}: ${err}`);
        return;
      }
    }

    if (conv && typeof (conv as any).send === "function") {
      await (conv as any).send(payload);
    }
  }

  private async syncFromNetwork(): Promise<void> {
    if (!this.clientHandle?.client) return;

    const client = this.clientHandle.client as any;

    try {
      if (typeof client.conversations?.sync === "function") {
        await client.conversations.sync();
      }

      if (typeof client.conversations?.list === "function") {
        const conversations = await client.conversations.list();
        for (const conv of conversations) {
          if (typeof conv.sync === "function") {
            await conv.sync();
          }

          const messages = typeof conv.messages === "function"
            ? await conv.messages({ limit: 100 })
            : [];

          for (const xmtpMsg of messages) {
            try {
              const content = typeof xmtpMsg.content === "string"
                ? xmtpMsg.content
                : JSON.stringify(xmtpMsg.content);

              const envelope = JSON.parse(content);
              if (envelope?.aegisVersion === 1 && envelope.message) {
                const agentMsg = envelope.message as AgentMessage;

                // Deduplicate by timestamp + agentId + type
                const isDuplicate = this.messageCache.some(
                  (m) =>
                    m.timestamp === agentMsg.timestamp &&
                    m.agentId === agentMsg.agentId &&
                    m.type === agentMsg.type
                );

                if (!isDuplicate) {
                  this.messageCache.push(agentMsg);
                  this.stats.messagesReceived++;

                  // Track discovered peers
                  if (envelope.sender) {
                    this.stats.peersDiscovered.add(envelope.sender);
                  }
                }
              }
            } catch {
              // Not an Aegis message, skip
            }
          }
        }
      }

      this.saveCache();
    } catch (err) {
      console.warn(`[aegis-xmtp] Sync failed: ${err}`);
    }
  }

  private startStreaming(): void {
    if (!this.clientHandle?.client) return;

    this.streamAbort = new AbortController();
    const client = this.clientHandle.client as any;

    // Stream all conversations for incoming messages
    (async () => {
      try {
        if (typeof client.conversations?.streamAllMessages !== "function") return;

        const stream = client.conversations.streamAllMessages();

        for await (const xmtpMsg of stream) {
          if (this.streamAbort?.signal.aborted) break;

          try {
            const content = typeof xmtpMsg.content === "string"
              ? xmtpMsg.content
              : JSON.stringify(xmtpMsg.content);

            const envelope = JSON.parse(content);
            if (envelope?.aegisVersion !== 1 || !envelope.message) continue;

            // Skip our own messages
            if (envelope.sender === this.agentId) continue;

            const agentMsg = envelope.message as AgentMessage;

            // Deduplicate
            const isDuplicate = this.messageCache.some(
              (m) =>
                m.timestamp === agentMsg.timestamp &&
                m.agentId === agentMsg.agentId &&
                m.type === agentMsg.type
            );

            if (!isDuplicate) {
              this.messageCache.push(agentMsg);
              this.stats.messagesReceived++;
              this.stats.lastMessageAt = new Date().toISOString();

              if (envelope.sender) {
                this.stats.peersDiscovered.add(envelope.sender);
              }

              // Notify subscribers in real-time
              for (const sub of this.subscribers) {
                try { sub(agentMsg); } catch { /* subscriber error */ }
              }

              this.saveCache();
            }
          } catch {
            // Not an Aegis message
          }
        }
      } catch (err) {
        if (!this.streamAbort?.signal.aborted) {
          console.warn(`[aegis-xmtp] Stream error: ${err}`);
        }
      }
    })();
  }

  // === Cache Persistence ===

  private loadCache(): void {
    try {
      if (existsSync(XMTP_CACHE_FILE)) {
        const data = JSON.parse(readFileSync(XMTP_CACHE_FILE, "utf-8"));
        this.messageCache = data.messages ?? [];
      }
    } catch {
      this.messageCache = [];
    }
  }

  private saveCache(): void {
    try {
      if (!existsSync(XMTP_CACHE_DIR)) {
        mkdirSync(XMTP_CACHE_DIR, { recursive: true });
      }
      writeFileSync(
        XMTP_CACHE_FILE,
        JSON.stringify({ messages: this.messageCache }, null, 2)
      );
    } catch {
      // Cache write failure is non-fatal
    }
  }
}

// === Factory ===

/**
 * Create and connect an XMTP transport for the given agent.
 * Returns null if XMTP is not configured.
 */
export async function createXmtpTransport(agentId: string): Promise<XmtpTransport | null> {
  if (!process.env.XMTP_WALLET_KEY) return null;

  const transport = new XmtpTransport(agentId);
  const connected = await transport.connect();

  if (!connected) {
    console.warn(`[aegis-xmtp] Transport created but XMTP connection failed. Using cache-only mode.`);
  }

  return transport;
}
