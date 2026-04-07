/**
 * Local copy of types from @aegis-ows/shared.
 * The dashboard bundles these directly so it can deploy standalone on Vercel
 * without the monorepo workspace link.
 */

// === Budget Types ===
export interface BudgetLimit {
  chainId: string;
  token: string;
  daily?: string;
  weekly?: string;
  monthly?: string;
}

export interface BudgetConfig {
  limits: BudgetLimit[];
}

export interface LedgerEntry {
  timestamp: string;
  apiKeyId: string;
  chainId: string;
  token: string;
  amount: string;
  txHash?: string;
  tool?: string;
  description?: string;
}

export interface BudgetLedger {
  entries: LedgerEntry[];
}

// === Guard Types ===
export interface GuardConfig {
  mode: "allowlist" | "blocklist";
  addresses: Record<string, string[]>;
  blockAddresses?: string[];
}

// === Policy Log Types ===
export interface PolicyLogEntry {
  timestamp: string;
  policyName: string;
  apiKeyId: string;
  chainId: string;
  allowed: boolean;
  reason?: string;
  transactionPreview?: string;
}

export interface PolicyLog {
  entries: PolicyLogEntry[];
}

// === Deadswitch Types ===
export interface DeadswitchConfig {
  maxInactiveMinutes: number;
  onTrigger: "revoke_key";
  recoveryWallet?: string;
  sweepFunds: boolean;
  lastHeartbeat?: string;
  enabled: boolean;
}

// === Earnings Types ===
export interface EarningsEntry {
  timestamp: string;
  agentId: string;
  endpoint: string;
  fromAgent: string;
  token: string;
  amount: string;
  txHash?: string;
}

export interface EarningsLedger {
  entries: EarningsEntry[];
}

// === Agent Profile ===
export interface AgentProfile {
  agentId: string;
  totalRevenue: number;
  totalSpending: number;
  profitLoss: number;
  endpoints: { endpoint: string; revenue: number; calls: number }[];
  vendors: { vendor: string; spending: number; calls: number }[];
}

// === Sankey Data ===
export interface SankeyData {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
}

// === Message Bus Types ===
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

export interface NegotiationOffer {
  type: "negotiation_offer";
  agentId: string;
  timestamp: string;
  toAgent: string;
  service: string;
  offeredPrice: string;
  originalPrice: string;
  reason?: string;
}

export interface NegotiationResponse {
  type: "negotiation_response";
  agentId: string;
  timestamp: string;
  toAgent: string;
  accepted: boolean;
  counterPrice?: string;
  reason?: string;
}

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

export interface PaymentReceiptMessage {
  type: "payment_receipt";
  agentId: string;
  timestamp: string;
  toAgent: string;
  amount: string;
  token: string;
  txHash?: string;
  receiptHash: string;
  service: string;
}

export interface ReputationGossip {
  type: "reputation_gossip";
  agentId: string;
  timestamp: string;
  aboutAgent: string;
  rating: "positive" | "negative" | "neutral";
  reason: string;
  txHash?: string;
}

export interface SLAAgreement {
  type: "sla_agreement";
  agentId: string;
  timestamp: string;
  toAgent: string;
  service: string;
  terms: {
    maxResponseTimeMs: number;
    minUptime: number;
    refundOnViolation: boolean;
    validUntil: string;
  };
  accepted?: boolean;
  signature?: string;
}

export interface SupplyChainInvite {
  type: "supply_chain_invite";
  agentId: string;
  timestamp: string;
  chainId: string;
  participants: string[];
  roles: Record<string, string>;
  description: string;
}

// === New XMTP-Enabled Message Types ===

export interface DirectMessage {
  type: "direct_message";
  agentId: string;
  timestamp: string;
  toAgent: string;
  content: string;
  threadId?: string;
  contentType?: "text" | "json" | "binary-ref";
  encrypted?: boolean;
}

export interface PresenceUpdate {
  type: "presence_update";
  agentId: string;
  timestamp: string;
  address: string;
  status: "online" | "offline" | "busy" | "away";
  statusMessage?: string;
}

export interface DeliveryReceipt {
  type: "delivery_receipt";
  agentId: string;
  timestamp: string;
  toAgent: string;
  originalMessageId: string;
  originalType: string;
  deliveredAt: string;
  readAt?: string;
}

export interface GroupInvite {
  type: "group_invite";
  agentId: string;
  timestamp: string;
  toAgent: string;
  groupId: string;
  groupName: string;
  groupType: "supply_chain" | "broadcast" | "negotiation" | "coalition" | "custom";
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
  | SupplyChainInvite
  | DirectMessage
  | PresenceUpdate
  | DeliveryReceipt
  | GroupInvite;

export interface MessageBus {
  messages: AgentMessage[];
}

// === Utility: getSpentInPeriod ===
export function getSpentInPeriod(
  ledger: BudgetLedger,
  apiKeyId: string,
  chainId: string,
  token: string,
  period: "daily" | "weekly" | "monthly"
): number {
  const now = new Date();
  let cutoff: Date;

  if (period === "daily") {
    cutoff = new Date(now);
    cutoff.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    cutoff = new Date(now);
    cutoff.setDate(now.getDate() - now.getDay());
    cutoff.setHours(0, 0, 0, 0);
  } else {
    cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return ledger.entries
    .filter(
      (e) =>
        e.apiKeyId === apiKeyId &&
        e.chainId === chainId &&
        e.token === token &&
        new Date(e.timestamp) >= cutoff
    )
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
}
