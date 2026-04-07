import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { PATHS, ensureAegisDir } from "./paths.js";
import { withFileLock } from "./file-lock.js";

// === Message Types ===

export interface ServiceAnnouncement {
  type: "service_announcement";
  agentId: string;
  timestamp: string;
  services: {
    endpoint: string;
    price: string;
    token: string;
    description: string;
    baseUrl: string;
  }[];
}

export interface ServiceQuery {
  type: "service_query";
  agentId: string;
  timestamp: string;
  query: string;
}

export interface ServiceResponse {
  type: "service_response";
  agentId: string;
  timestamp: string;
  inResponseTo: string;
  matches: {
    endpoint: string;
    price: string;
    description: string;
    fullUrl: string;
  }[];
}

// Negotiation
export interface NegotiationOffer {
  type: "negotiation_offer";
  agentId: string;        // buyer
  timestamp: string;
  toAgent: string;        // seller
  service: string;        // endpoint
  offeredPrice: string;   // buyer's proposed price
  originalPrice: string;  // seller's listed price
  reason?: string;        // "budget constraint", "bulk discount", etc.
}

export interface NegotiationResponse {
  type: "negotiation_response";
  agentId: string;        // seller
  timestamp: string;
  toAgent: string;        // buyer
  accepted: boolean;
  counterPrice?: string;  // if not accepted, counter-offer
  reason?: string;
}

// Health Ping
export interface HealthPing {
  type: "health_ping";
  agentId: string;
  timestamp: string;
  targetAgent: string;
}

export interface HealthPong {
  type: "health_pong";
  agentId: string;
  timestamp: string;
  targetAgent: string;
  status: "online" | "busy" | "degraded";
  queueDepth?: number;
  uptime?: string;
}

// Payment Receipt (over messaging)
export interface PaymentReceiptMessage {
  type: "payment_receipt";
  agentId: string;        // seller
  timestamp: string;
  toAgent: string;        // buyer
  amount: string;
  token: string;
  txHash?: string;
  receiptHash: string;
  service: string;
}

// Reputation Gossip
export interface ReputationGossip {
  type: "reputation_gossip";
  agentId: string;        // reporter
  timestamp: string;
  aboutAgent: string;     // agent being rated
  rating: "positive" | "negative" | "neutral";
  reason: string;         // "fast response", "timeout after payment", etc.
  txHash?: string;        // proof of interaction
}

// SLA Agreement
export interface SLAAgreement {
  type: "sla_agreement";
  agentId: string;        // proposer
  timestamp: string;
  toAgent: string;        // other party
  service: string;
  terms: {
    maxResponseTimeMs: number;
    minUptime: number;     // 0-100 percentage
    refundOnViolation: boolean;
    validUntil: string;    // ISO timestamp
  };
  accepted?: boolean;
  signature?: string;      // OWS signature of the terms
}

// Group Supply Chain
export interface SupplyChainInvite {
  type: "supply_chain_invite";
  agentId: string;        // coordinator
  timestamp: string;
  chainId: string;        // unique ID for this supply chain
  participants: string[]; // agent IDs
  roles: Record<string, string>; // agentId -> role description
  description: string;
}

export type AgentMessage =
  | ServiceAnnouncement
  | ServiceQuery
  | ServiceResponse
  | NegotiationOffer
  | NegotiationResponse
  | HealthPing
  | HealthPong
  | PaymentReceiptMessage
  | ReputationGossip
  | SLAAgreement
  | SupplyChainInvite;

export interface MessageBus {
  messages: AgentMessage[];
}

// === File-based transport (default) ===

export function readMessages(): MessageBus {
  if (!existsSync(PATHS.messageBus)) return { messages: [] };
  try {
    return JSON.parse(readFileSync(PATHS.messageBus, "utf-8")) as MessageBus;
  } catch {
    return { messages: [] };
  }
}

export function postMessage(msg: AgentMessage): void {
  withFileLock(PATHS.messageBus, () => {
    ensureAegisDir();
    const bus = readMessages();
    bus.messages.push(msg);
    writeFileSync(PATHS.messageBus, JSON.stringify(bus, null, 2));
  });
}

// === Query helpers ===

export function getAnnouncements(): ServiceAnnouncement[] {
  return readMessages().messages.filter(
    (m): m is ServiceAnnouncement => m.type === "service_announcement"
  );
}

export function discoverServices(query: string): ServiceAnnouncement["services"][number][] {
  const announcements = getAnnouncements();
  const q = query.toLowerCase();
  const matches: ServiceAnnouncement["services"][number][] = [];
  for (const ann of announcements) {
    for (const svc of ann.services) {
      if (svc.description.toLowerCase().includes(q) || svc.endpoint.toLowerCase().includes(q)) {
        matches.push(svc);
      }
    }
  }
  return matches;
}

export function getMessagesForAgent(agentId: string): AgentMessage[] {
  return readMessages().messages.filter(
    (m) => {
      if ("toAgent" in m && (m as unknown as Record<string, unknown>).toAgent === agentId) return true;
      if (m.agentId === agentId) return true;
      return false;
    }
  );
}

export function getReputationGossip(aboutAgent: string): ReputationGossip[] {
  return readMessages().messages.filter(
    (m): m is ReputationGossip => m.type === "reputation_gossip" && m.aboutAgent === aboutAgent
  );
}

export function getHealthStatus(targetAgent: string): HealthPong | null {
  const pongs = readMessages().messages.filter(
    (m): m is HealthPong => m.type === "health_pong" && m.agentId === targetAgent
  );
  return pongs.length > 0 ? pongs[pongs.length - 1] : null;
}

export function getSLAForService(agentId: string, service: string): SLAAgreement | null {
  const slas = readMessages().messages.filter(
    (m): m is SLAAgreement =>
      m.type === "sla_agreement" &&
      (m.agentId === agentId || m.toAgent === agentId) &&
      m.service === service &&
      m.accepted === true
  );
  return slas.length > 0 ? slas[slas.length - 1] : null;
}
