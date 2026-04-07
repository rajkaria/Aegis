/**
 * XMTP Agent Inbox
 *
 * Persistent inbox for each agent that:
 * - Queues incoming messages (even when agent is offline)
 * - Supports mark-as-read / delivery receipts
 * - Provides filtered views (unread, by type, by sender)
 * - Streams real-time notifications
 *
 * The inbox works with both file-based and XMTP transports.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import type { AgentMessage } from "@aegis-ows/shared";
import { postMessage } from "@aegis-ows/shared";

// === Types ===

export interface InboxMessage {
  /** Unique message ID (content hash) */
  id: string;
  /** The underlying agent message */
  message: AgentMessage;
  /** When it was received by this inbox */
  receivedAt: string;
  /** Whether the agent has read/processed it */
  read: boolean;
  /** When it was marked as read */
  readAt?: string;
  /** Whether a delivery receipt was sent */
  receiptSent: boolean;
  /** Priority: urgent (SLA violations, deadswitch), high (payments), normal, low */
  priority: "urgent" | "high" | "normal" | "low";
}

export interface InboxStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  oldestUnread: string | null;
}

export interface InboxFilter {
  type?: string | string[];
  fromAgent?: string;
  unreadOnly?: boolean;
  priority?: InboxMessage["priority"];
  since?: string;
  limit?: number;
}

// === Storage ===

const INBOX_DIR = join(homedir(), ".ows", "aegis", "xmtp", "inboxes");

function inboxPath(agentId: string): string {
  return join(INBOX_DIR, `${agentId}.json`);
}

function ensureInboxDir(): void {
  if (!existsSync(INBOX_DIR)) {
    mkdirSync(INBOX_DIR, { recursive: true });
  }
}

function loadInbox(agentId: string): InboxMessage[] {
  ensureInboxDir();
  const path = inboxPath(agentId);
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return [];
  }
}

function saveInbox(agentId: string, messages: InboxMessage[]): void {
  ensureInboxDir();
  writeFileSync(inboxPath(agentId), JSON.stringify(messages, null, 2));
}

// === Priority Classification ===

function classifyPriority(msg: AgentMessage): InboxMessage["priority"] {
  switch (msg.type) {
    case "payment_receipt":
    case "negotiation_response":
      return "high";
    case "sla_agreement":
      return "high";
    case "health_ping":
      return "normal";
    case "reputation_gossip":
      return "low";
    case "service_announcement":
    case "service_query":
      return "normal";
    case "negotiation_offer":
      return "high";
    case "supply_chain_invite":
      return "high";
    default:
      // Check for special types
      if (msg.type === "direct_message") return "high";
      if (msg.type === "presence_update") return "low";
      return "normal";
  }
}

// === Message ID ===

function generateMessageId(msg: AgentMessage): string {
  const content = `${msg.type}:${msg.agentId}:${msg.timestamp}:${JSON.stringify(msg)}`;
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

// === Inbox Operations ===

/**
 * Deliver a message to an agent's inbox.
 * Deduplicates by message ID.
 */
export function deliverToInbox(agentId: string, msg: AgentMessage): InboxMessage {
  const inbox = loadInbox(agentId);
  const id = generateMessageId(msg);

  // Check for duplicate
  const existing = inbox.find((m) => m.id === id);
  if (existing) return existing;

  const inboxMsg: InboxMessage = {
    id,
    message: msg,
    receivedAt: new Date().toISOString(),
    read: false,
    receiptSent: false,
    priority: classifyPriority(msg),
  };

  inbox.push(inboxMsg);

  // Cap inbox at 1000 messages (remove oldest read messages first)
  if (inbox.length > 1000) {
    const readMessages = inbox.filter((m) => m.read);
    const unreadMessages = inbox.filter((m) => !m.read);
    const trimmed = [
      ...unreadMessages,
      ...readMessages.slice(Math.max(0, readMessages.length - (1000 - unreadMessages.length))),
    ];
    saveInbox(agentId, trimmed);
    return inboxMsg;
  }

  saveInbox(agentId, inbox);
  return inboxMsg;
}

/**
 * Mark a message as read.
 * Optionally sends a delivery receipt back to the sender.
 */
export function markAsRead(
  agentId: string,
  messageId: string,
  sendReceipt = false
): boolean {
  const inbox = loadInbox(agentId);
  const msg = inbox.find((m) => m.id === messageId);
  if (!msg) return false;

  msg.read = true;
  msg.readAt = new Date().toISOString();

  // Send delivery receipt if requested
  if (sendReceipt && !msg.receiptSent && "toAgent" in msg.message) {
    const senderAgentId = msg.message.agentId;
    postMessage({
      type: "delivery_receipt" as any,
      agentId,
      timestamp: new Date().toISOString(),
      toAgent: senderAgentId,
      originalMessageId: messageId,
      originalType: msg.message.type,
      deliveredAt: msg.receivedAt,
      readAt: msg.readAt,
    } as any);
    msg.receiptSent = true;
  }

  saveInbox(agentId, inbox);
  return true;
}

/**
 * Mark all messages as read.
 */
export function markAllAsRead(agentId: string): number {
  const inbox = loadInbox(agentId);
  let count = 0;
  const now = new Date().toISOString();

  for (const msg of inbox) {
    if (!msg.read) {
      msg.read = true;
      msg.readAt = now;
      count++;
    }
  }

  saveInbox(agentId, inbox);
  return count;
}

/**
 * Query the inbox with filters.
 */
export function queryInbox(agentId: string, filter?: InboxFilter): InboxMessage[] {
  let inbox = loadInbox(agentId);

  if (filter) {
    if (filter.unreadOnly) {
      inbox = inbox.filter((m) => !m.read);
    }

    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      inbox = inbox.filter((m) => types.includes(m.message.type));
    }

    if (filter.fromAgent) {
      inbox = inbox.filter((m) => m.message.agentId === filter.fromAgent);
    }

    if (filter.priority) {
      inbox = inbox.filter((m) => m.priority === filter.priority);
    }

    if (filter.since) {
      const sinceTime = new Date(filter.since).getTime();
      inbox = inbox.filter((m) => new Date(m.receivedAt).getTime() >= sinceTime);
    }

    if (filter.limit) {
      inbox = inbox.slice(-filter.limit);
    }
  }

  // Sort by receivedAt descending (newest first)
  inbox.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  return inbox;
}

/**
 * Get inbox statistics.
 */
export function getInboxStats(agentId: string): InboxStats {
  const inbox = loadInbox(agentId);
  const unreadMessages = inbox.filter((m) => !m.read);

  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  for (const msg of inbox) {
    byType[msg.message.type] = (byType[msg.message.type] ?? 0) + 1;
    byPriority[msg.priority] = (byPriority[msg.priority] ?? 0) + 1;
  }

  return {
    total: inbox.length,
    unread: unreadMessages.length,
    byType,
    byPriority,
    oldestUnread: unreadMessages.length > 0
      ? unreadMessages.sort((a, b) =>
          new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
        )[0].receivedAt
      : null,
  };
}

/**
 * Delete a message from the inbox.
 */
export function deleteFromInbox(agentId: string, messageId: string): boolean {
  const inbox = loadInbox(agentId);
  const idx = inbox.findIndex((m) => m.id === messageId);
  if (idx === -1) return false;
  inbox.splice(idx, 1);
  saveInbox(agentId, inbox);
  return true;
}

/**
 * Clear the entire inbox (or just read messages).
 */
export function clearInbox(agentId: string, readOnly = false): number {
  const inbox = loadInbox(agentId);

  if (readOnly) {
    const remaining = inbox.filter((m) => !m.read);
    const cleared = inbox.length - remaining.length;
    saveInbox(agentId, remaining);
    return cleared;
  }

  const count = inbox.length;
  saveInbox(agentId, []);
  return count;
}

// === Real-time Notification Helpers ===

/** Callback registry for real-time inbox notifications */
const inboxListeners = new Map<string, Set<(msg: InboxMessage) => void>>();

/**
 * Register a listener for new inbox messages.
 * Returns an unsubscribe function.
 */
export function onInboxMessage(
  agentId: string,
  callback: (msg: InboxMessage) => void
): () => void {
  if (!inboxListeners.has(agentId)) {
    inboxListeners.set(agentId, new Set());
  }
  inboxListeners.get(agentId)!.add(callback);

  return () => {
    inboxListeners.get(agentId)?.delete(callback);
  };
}

/**
 * Notify inbox listeners (called by the transport layer when a message arrives).
 */
export function notifyInboxListeners(agentId: string, inboxMsg: InboxMessage): void {
  const listeners = inboxListeners.get(agentId);
  if (!listeners) return;
  for (const listener of listeners) {
    try { listener(inboxMsg); } catch { /* listener error */ }
  }
}
