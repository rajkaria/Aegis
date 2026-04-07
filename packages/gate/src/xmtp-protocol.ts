import {
  postMessage,
  getHealthStatus,
  getReputationGossip,
  type SLAAgreement,
} from "@aegis-ows/shared";

// --- Negotiation ---
export function sendNegotiationOffer(params: {
  buyerId: string;
  sellerId: string;
  service: string;
  offeredPrice: string;
  originalPrice: string;
  reason?: string;
}): void {
  postMessage({
    type: "negotiation_offer",
    agentId: params.buyerId,
    timestamp: new Date().toISOString(),
    toAgent: params.sellerId,
    service: params.service,
    offeredPrice: params.offeredPrice,
    originalPrice: params.originalPrice,
    reason: params.reason,
  });
}

export function respondToNegotiation(params: {
  sellerId: string;
  buyerId: string;
  accepted: boolean;
  counterPrice?: string;
  reason?: string;
}): void {
  postMessage({
    type: "negotiation_response",
    agentId: params.sellerId,
    timestamp: new Date().toISOString(),
    toAgent: params.buyerId,
    accepted: params.accepted,
    counterPrice: params.counterPrice,
    reason: params.reason,
  });
}

// --- Health Checks ---
export function pingAgent(fromId: string, targetId: string): void {
  postMessage({
    type: "health_ping",
    agentId: fromId,
    timestamp: new Date().toISOString(),
    targetAgent: targetId,
  });
}

export function respondToPing(
  agentId: string,
  targetId: string,
  status: "online" | "busy" | "degraded",
  queueDepth?: number
): void {
  postMessage({
    type: "health_pong",
    agentId,
    timestamp: new Date().toISOString(),
    targetAgent: targetId,
    status,
    queueDepth,
    uptime: typeof process !== "undefined" && process.uptime
      ? `${Math.floor(process.uptime())}s`
      : undefined,
  });
}

export function isAgentHealthy(targetId: string): boolean {
  const status = getHealthStatus(targetId);
  if (!status) return false;
  const age = Date.now() - new Date(status.timestamp).getTime();
  return age < 5 * 60 * 1000 && status.status !== "degraded"; // healthy if pinged within 5 min
}

// --- Payment Receipts over messaging ---
export function sendPaymentReceipt(params: {
  sellerId: string;
  buyerId: string;
  amount: string;
  token: string;
  txHash?: string;
  receiptHash: string;
  service: string;
}): void {
  postMessage({
    type: "payment_receipt",
    agentId: params.sellerId,
    timestamp: new Date().toISOString(),
    toAgent: params.buyerId,
    amount: params.amount,
    token: params.token,
    txHash: params.txHash,
    receiptHash: params.receiptHash,
    service: params.service,
  });
}

// --- Reputation Gossip ---
export function reportReputation(params: {
  reporterId: string;
  aboutAgent: string;
  rating: "positive" | "negative" | "neutral";
  reason: string;
  txHash?: string;
}): void {
  postMessage({
    type: "reputation_gossip",
    agentId: params.reporterId,
    timestamp: new Date().toISOString(),
    aboutAgent: params.aboutAgent,
    rating: params.rating,
    reason: params.reason,
    txHash: params.txHash,
  });
}

export function getAgentGossipScore(agentId: string): {
  positive: number;
  negative: number;
  neutral: number;
  net: number;
} {
  const gossip = getReputationGossip(agentId);
  const positive = gossip.filter((g) => g.rating === "positive").length;
  const negative = gossip.filter((g) => g.rating === "negative").length;
  const neutral = gossip.filter((g) => g.rating === "neutral").length;
  return { positive, negative, neutral, net: positive - negative };
}

// --- SLA Agreements ---
export function proposeSLA(params: {
  proposerId: string;
  toAgent: string;
  service: string;
  maxResponseTimeMs: number;
  minUptime: number;
  refundOnViolation: boolean;
  validDays: number;
}): void {
  postMessage({
    type: "sla_agreement",
    agentId: params.proposerId,
    timestamp: new Date().toISOString(),
    toAgent: params.toAgent,
    service: params.service,
    terms: {
      maxResponseTimeMs: params.maxResponseTimeMs,
      minUptime: params.minUptime,
      refundOnViolation: params.refundOnViolation,
      validUntil: new Date(
        Date.now() + params.validDays * 86400000
      ).toISOString(),
    },
  });
}

export function acceptSLA(sla: SLAAgreement, _acceptorId: string): void {
  postMessage({
    ...sla,
    timestamp: new Date().toISOString(),
    accepted: true,
  });
}

// --- Supply Chain Groups ---
export function createSupplyChain(params: {
  coordinatorId: string;
  participants: string[];
  roles: Record<string, string>;
  description: string;
}): string {
  const chainId = `chain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  postMessage({
    type: "supply_chain_invite",
    agentId: params.coordinatorId,
    timestamp: new Date().toISOString(),
    chainId,
    participants: params.participants,
    roles: params.roles,
    description: params.description,
  });
  return chainId;
}
