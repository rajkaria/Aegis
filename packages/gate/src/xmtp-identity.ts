/**
 * XMTP Agent Identity & Address Book
 *
 * Manages the mapping between agent IDs and their XMTP/wallet addresses.
 * Provides:
 * - Agent address resolution (name -> XMTP address)
 * - Reverse lookup (address -> agent name)
 * - Agent directory (discover other agents on the network)
 * - Presence tracking (online/offline status)
 * - Verified identity claims
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { postMessage, getAnnouncements } from "@aegis-ows/shared";
import { getAgentKeyEntry, listAgentKeys } from "./xmtp-client.js";

// === Types ===

export interface AgentIdentity {
  /** Human-readable agent ID */
  agentId: string;
  /** XMTP / wallet address (0x...) */
  address: string;
  /** When this identity was first seen */
  firstSeen: string;
  /** When this identity was last active */
  lastSeen: string;
  /** Presence status */
  status: "online" | "offline" | "busy" | "away";
  /** Last presence update timestamp */
  statusUpdatedAt: string;
  /** Services this agent offers (from announcements) */
  services?: string[];
  /** Optional display name */
  displayName?: string;
  /** Optional description / bio */
  description?: string;
  /** Whether this identity is verified (signed claim) */
  verified: boolean;
  /** Trust score (from reputation gossip, -100 to 100) */
  trustScore?: number;
}

export interface PresenceUpdate {
  agentId: string;
  address: string;
  status: "online" | "offline" | "busy" | "away";
  timestamp: string;
  /** Optional status message */
  statusMessage?: string;
}

// === Storage ===

const IDENTITY_DIR = join(homedir(), ".ows", "aegis", "xmtp");
const DIRECTORY_FILE = join(IDENTITY_DIR, "agent-directory.json");

function ensureIdentityDir(): void {
  if (!existsSync(IDENTITY_DIR)) {
    mkdirSync(IDENTITY_DIR, { recursive: true });
  }
}

function loadDirectory(): Record<string, AgentIdentity> {
  ensureIdentityDir();
  if (!existsSync(DIRECTORY_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DIRECTORY_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveDirectory(dir: Record<string, AgentIdentity>): void {
  ensureIdentityDir();
  writeFileSync(DIRECTORY_FILE, JSON.stringify(dir, null, 2));
}

// === Address Resolution ===

/**
 * Resolve an agent ID to its XMTP/wallet address.
 * Checks:
 * 1. Local key store (agents on this machine)
 * 2. Agent directory (discovered agents from network)
 * 3. Direct address (if the input looks like an address already)
 */
export function resolveAgentAddress(agentId: string): string | null {
  // If it's already an address, return as-is
  if (agentId.startsWith("0x") && agentId.length === 42) {
    return agentId;
  }

  // Check local key store first
  const keyEntry = getAgentKeyEntry(agentId);
  if (keyEntry) return keyEntry.address;

  // Check the directory
  const dir = loadDirectory();
  const identity = dir[agentId];
  if (identity) return identity.address;

  return null;
}

/**
 * Reverse lookup: find agent ID from an address.
 */
export function resolveAgentName(address: string): string | null {
  const normalizedAddr = address.toLowerCase();

  // Check local keys
  for (const entry of listAgentKeys()) {
    if (entry.address.toLowerCase() === normalizedAddr) {
      return entry.agentId;
    }
  }

  // Check directory
  const dir = loadDirectory();
  for (const [agentId, identity] of Object.entries(dir)) {
    if (identity.address.toLowerCase() === normalizedAddr) {
      return agentId;
    }
  }

  return null;
}

// === Directory Management ===

/**
 * Register or update an agent in the directory.
 */
export function upsertAgent(params: {
  agentId: string;
  address: string;
  status?: AgentIdentity["status"];
  services?: string[];
  displayName?: string;
  description?: string;
}): AgentIdentity {
  const dir = loadDirectory();
  const now = new Date().toISOString();

  const existing = dir[params.agentId];
  const identity: AgentIdentity = {
    agentId: params.agentId,
    address: params.address,
    firstSeen: existing?.firstSeen ?? now,
    lastSeen: now,
    status: params.status ?? existing?.status ?? "online",
    statusUpdatedAt: now,
    services: params.services ?? existing?.services,
    displayName: params.displayName ?? existing?.displayName,
    description: params.description ?? existing?.description,
    verified: existing?.verified ?? false,
    trustScore: existing?.trustScore,
  };

  dir[params.agentId] = identity;
  saveDirectory(dir);
  return identity;
}

/**
 * Update an agent's presence status.
 */
export function updatePresence(agentId: string, status: AgentIdentity["status"]): void {
  const dir = loadDirectory();
  const identity = dir[agentId];
  if (!identity) return;

  identity.status = status;
  identity.statusUpdatedAt = new Date().toISOString();
  identity.lastSeen = new Date().toISOString();

  dir[agentId] = identity;
  saveDirectory(dir);
}

/**
 * Broadcast a presence update to the network.
 */
export function broadcastPresence(
  agentId: string,
  status: AgentIdentity["status"],
  statusMessage?: string
): void {
  const address = resolveAgentAddress(agentId);
  if (!address) return;

  // Update local directory
  updatePresence(agentId, status);

  // Post to message bus
  postMessage({
    type: "presence_update" as any,
    agentId,
    timestamp: new Date().toISOString(),
    address,
    status,
    statusMessage,
  } as any);
}

/**
 * Get an agent's identity from the directory.
 */
export function getAgentIdentity(agentId: string): AgentIdentity | null {
  const dir = loadDirectory();
  return dir[agentId] ?? null;
}

/**
 * List all known agents in the directory.
 */
export function listAgents(filter?: {
  status?: AgentIdentity["status"];
  verified?: boolean;
  hasServices?: boolean;
}): AgentIdentity[] {
  let agents = Object.values(loadDirectory());

  if (filter?.status) {
    agents = agents.filter((a) => a.status === filter.status);
  }
  if (filter?.verified !== undefined) {
    agents = agents.filter((a) => a.verified === filter.verified);
  }
  if (filter?.hasServices) {
    agents = agents.filter((a) => a.services && a.services.length > 0);
  }

  return agents.sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );
}

/**
 * Sync the directory with announcements from the message bus.
 * Discovers agents that have published service announcements.
 */
export function syncDirectoryFromAnnouncements(): number {
  const announcements = getAnnouncements();
  const dir = loadDirectory();
  const now = new Date().toISOString();
  let newAgents = 0;

  for (const ann of announcements) {
    if (!dir[ann.agentId]) {
      newAgents++;
    }

    // Try to resolve address from key store
    const address = resolveAgentAddress(ann.agentId) ?? `unresolved:${ann.agentId}`;

    const existing = dir[ann.agentId];
    dir[ann.agentId] = {
      agentId: ann.agentId,
      address,
      firstSeen: existing?.firstSeen ?? ann.timestamp,
      lastSeen: ann.timestamp > (existing?.lastSeen ?? "") ? ann.timestamp : (existing?.lastSeen ?? now),
      status: existing?.status ?? "online",
      statusUpdatedAt: existing?.statusUpdatedAt ?? now,
      services: ann.services.map((s) => `${s.endpoint} ($${s.price} ${s.token})`),
      displayName: existing?.displayName,
      description: existing?.description,
      verified: existing?.verified ?? false,
      trustScore: existing?.trustScore,
    };
  }

  saveDirectory(dir);
  return newAgents;
}

/**
 * Mark stale agents as offline (no activity within timeout).
 */
export function pruneStaleAgents(timeoutMs = 10 * 60 * 1000): string[] {
  const dir = loadDirectory();
  const now = Date.now();
  const pruned: string[] = [];

  for (const [agentId, identity] of Object.entries(dir)) {
    if (identity.status === "offline") continue;

    const lastSeen = new Date(identity.lastSeen).getTime();
    if (now - lastSeen > timeoutMs) {
      identity.status = "offline";
      identity.statusUpdatedAt = new Date().toISOString();
      pruned.push(agentId);
    }
  }

  if (pruned.length > 0) {
    saveDirectory(dir);
  }

  return pruned;
}

/**
 * Search agents by name, description, or services.
 */
export function searchAgents(query: string): AgentIdentity[] {
  const q = query.toLowerCase();
  return Object.values(loadDirectory()).filter((a) => {
    if (a.agentId.toLowerCase().includes(q)) return true;
    if (a.displayName?.toLowerCase().includes(q)) return true;
    if (a.description?.toLowerCase().includes(q)) return true;
    if (a.services?.some((s: string) => s.toLowerCase().includes(q))) return true;
    return false;
  });
}
