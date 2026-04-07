import { getAnnouncements } from "@aegis-ows/shared";
import { buildAgentIdentity, type AgentIdentity } from "./agent-identity.js";

// In-memory directory of known agents
const agentDirectory = new Map<string, AgentIdentity>();

export function registerInDirectory(agentId: string, walletAddresses?: Record<string, string>): void {
  const identity = buildAgentIdentity(agentId, walletAddresses);
  agentDirectory.set(agentId, identity);
}

export function searchDirectory(query: string): AgentIdentity[] {
  const q = query.toLowerCase();
  const results: AgentIdentity[] = [];

  for (const [_, identity] of agentDirectory) {
    const matches = identity.services.some(
      s => s.description.toLowerCase().includes(q) || s.endpoint.toLowerCase().includes(q)
    ) || identity.agentId.toLowerCase().includes(q);

    if (matches) results.push(identity);
  }

  // Also check file-based announcements
  const announcements = getAnnouncements();
  for (const ann of announcements) {
    if (!agentDirectory.has(ann.agentId)) {
      const identity = buildAgentIdentity(ann.agentId);
      if (identity.services.length > 0 || ann.services.some(s => s.description.toLowerCase().includes(q))) {
        results.push(identity);
      }
    }
  }

  // Sort by reputation score (highest first)
  return results.sort((a, b) => b.reputation.score - a.reputation.score);
}

export function getDirectorySize(): number {
  return agentDirectory.size;
}

export function listDirectory(): AgentIdentity[] {
  return Array.from(agentDirectory.values()).sort((a, b) => b.reputation.score - a.reputation.score);
}
