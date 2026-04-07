/**
 * XMTP Group Conversations
 *
 * Manages named agent groups (channels) for:
 * - Supply chain coordination
 * - Topic-specific broadcast channels
 * - Private group negotiations
 * - Agent coalitions
 *
 * Groups are stored locally and synced to the XMTP network.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { postMessage } from "@aegis-ows/shared";
import { getXmtpClient } from "./xmtp-client.js";
import { resolveAgentAddress } from "./xmtp-identity.js";

// === Types ===

export interface AgentGroup {
  /** Unique group identifier */
  groupId: string;
  /** Human-readable name */
  name: string;
  /** Purpose / description */
  description: string;
  /** Agent who created the group */
  createdBy: string;
  /** ISO timestamp */
  createdAt: string;
  /** Member agent IDs */
  members: string[];
  /** Group type */
  type: "supply_chain" | "broadcast" | "negotiation" | "coalition" | "custom";
  /** XMTP conversation ID (set when synced to network) */
  xmtpConversationId?: string;
  /** Whether the group is currently active */
  active: boolean;
  /** Optional metadata */
  metadata?: Record<string, string>;
}

export interface GroupMessage {
  groupId: string;
  agentId: string;
  timestamp: string;
  content: string;
  /** Message sub-type within the group */
  kind: "text" | "task" | "vote" | "status" | "alert";
}

// === Storage ===

const GROUPS_DIR = join(homedir(), ".ows", "aegis", "xmtp");
const GROUPS_FILE = join(GROUPS_DIR, "groups.json");

function ensureGroupsDir(): void {
  if (!existsSync(GROUPS_DIR)) {
    mkdirSync(GROUPS_DIR, { recursive: true });
  }
}

function loadGroups(): Record<string, AgentGroup> {
  ensureGroupsDir();
  if (!existsSync(GROUPS_FILE)) return {};
  try {
    return JSON.parse(readFileSync(GROUPS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveGroups(groups: Record<string, AgentGroup>): void {
  ensureGroupsDir();
  writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
}

// === Group Management ===

/**
 * Create a new agent group.
 * Optionally syncs to XMTP network if the creator has an active client.
 */
export async function createGroup(params: {
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  type: AgentGroup["type"];
  metadata?: Record<string, string>;
}): Promise<AgentGroup> {
  const groupId = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const group: AgentGroup = {
    groupId,
    name: params.name,
    description: params.description,
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
    members: [params.createdBy, ...params.members.filter((m) => m !== params.createdBy)],
    type: params.type,
    active: true,
    metadata: params.metadata,
  };

  // Save locally
  const groups = loadGroups();
  groups[groupId] = group;
  saveGroups(groups);

  // Try to create on XMTP network
  const clientHandle = getXmtpClient(params.createdBy);
  if (clientHandle?.connected) {
    try {
      const client = clientHandle.client as any;

      // Resolve member addresses
      const memberAddresses: string[] = [];
      for (const memberId of params.members) {
        if (memberId === params.createdBy) continue;
        const addr = resolveAgentAddress(memberId);
        if (addr) memberAddresses.push(addr);
      }

      if (typeof client.conversations?.newGroup === "function") {
        const xmtpConv = await client.conversations.newGroup(memberAddresses, {
          name: group.name,
          description: group.description,
          metadata: {
            aegisGroupId: groupId,
            type: group.type,
            ...(params.metadata ?? {}),
          },
        });

        group.xmtpConversationId = xmtpConv.id ?? xmtpConv.topic;

        // Update stored group with conversation ID
        groups[groupId] = group;
        saveGroups(groups);
      }
    } catch (err) {
      console.warn(`[aegis-xmtp] Failed to create XMTP group: ${err}`);
    }
  }

  // Post a supply chain invite to the message bus for visibility
  postMessage({
    type: "supply_chain_invite",
    agentId: params.createdBy,
    timestamp: new Date().toISOString(),
    chainId: groupId,
    participants: group.members,
    roles: Object.fromEntries(group.members.map((m) => [m, "member"])),
    description: `${params.name}: ${params.description}`,
  });

  return group;
}

/**
 * Add a member to an existing group.
 */
export async function addGroupMember(groupId: string, agentId: string, addedBy: string): Promise<boolean> {
  const groups = loadGroups();
  const group = groups[groupId];
  if (!group || !group.active) return false;

  if (group.members.includes(agentId)) return true; // Already a member

  group.members.push(agentId);
  groups[groupId] = group;
  saveGroups(groups);

  // Try to add on XMTP network
  if (group.xmtpConversationId) {
    const clientHandle = getXmtpClient(addedBy);
    if (clientHandle?.connected) {
      try {
        const addr = resolveAgentAddress(agentId);
        if (addr) {
          const client = clientHandle.client as any;
          const conversations = await client.conversations?.list();
          const conv = conversations?.find(
            (c: any) => (c.id ?? c.topic) === group.xmtpConversationId
          );
          if (conv && typeof conv.addMembers === "function") {
            await conv.addMembers([addr]);
          }
        }
      } catch (err) {
        console.warn(`[aegis-xmtp] Failed to add member to XMTP group: ${err}`);
      }
    }
  }

  return true;
}

/**
 * Remove a member from a group.
 */
export async function removeGroupMember(groupId: string, agentId: string, removedBy: string): Promise<boolean> {
  const groups = loadGroups();
  const group = groups[groupId];
  if (!group || !group.active) return false;

  group.members = group.members.filter((m) => m !== agentId);
  groups[groupId] = group;
  saveGroups(groups);

  // Try to remove on XMTP network
  if (group.xmtpConversationId) {
    const clientHandle = getXmtpClient(removedBy);
    if (clientHandle?.connected) {
      try {
        const addr = resolveAgentAddress(agentId);
        if (addr) {
          const client = clientHandle.client as any;
          const conversations = await client.conversations?.list();
          const conv = conversations?.find(
            (c: any) => (c.id ?? c.topic) === group.xmtpConversationId
          );
          if (conv && typeof conv.removeMembers === "function") {
            await conv.removeMembers([addr]);
          }
        }
      } catch (err) {
        console.warn(`[aegis-xmtp] Failed to remove member from XMTP group: ${err}`);
      }
    }
  }

  return true;
}

/**
 * Send a message to a group.
 */
export async function sendGroupMessage(params: {
  groupId: string;
  agentId: string;
  content: string;
  kind?: GroupMessage["kind"];
}): Promise<GroupMessage | null> {
  const groups = loadGroups();
  const group = groups[params.groupId];
  if (!group || !group.active) return null;
  if (!group.members.includes(params.agentId)) return null;

  const msg: GroupMessage = {
    groupId: params.groupId,
    agentId: params.agentId,
    timestamp: new Date().toISOString(),
    content: params.content,
    kind: params.kind ?? "text",
  };

  // Send via XMTP if connected
  if (group.xmtpConversationId) {
    const clientHandle = getXmtpClient(params.agentId);
    if (clientHandle?.connected) {
      try {
        const client = clientHandle.client as any;
        const conversations = await client.conversations?.list();
        const conv = conversations?.find(
          (c: any) => (c.id ?? c.topic) === group.xmtpConversationId
        );
        if (conv && typeof conv.send === "function") {
          await conv.send(JSON.stringify({
            aegisVersion: 1,
            groupMessage: msg,
            sender: params.agentId,
          }));
        }
      } catch (err) {
        console.warn(`[aegis-xmtp] Failed to send group message: ${err}`);
      }
    }
  }

  return msg;
}

/**
 * List all groups an agent belongs to.
 */
export function listGroups(agentId?: string): AgentGroup[] {
  const groups = Object.values(loadGroups());
  if (!agentId) return groups;
  return groups.filter((g) => g.members.includes(agentId));
}

/**
 * Get a specific group by ID.
 */
export function getGroup(groupId: string): AgentGroup | null {
  return loadGroups()[groupId] ?? null;
}

/**
 * Deactivate a group (soft delete).
 */
export function deactivateGroup(groupId: string): boolean {
  const groups = loadGroups();
  const group = groups[groupId];
  if (!group) return false;
  group.active = false;
  groups[groupId] = group;
  saveGroups(groups);
  return true;
}
