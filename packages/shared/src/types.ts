// === OWS Types (from OWS spec v1.2.0) ===
export interface SerializedTransaction {
  to?: string;
  value?: string;
  data?: string;
  [key: string]: unknown;
}

export interface WalletDescriptor {
  id: string;
  name: string;
  addresses: Record<string, string>;
}

export interface SimulationResult {
  success: boolean;
  gasUsed?: string;
  value?: string;
  logs?: unknown[];
}

export interface PolicyContext {
  transaction: SerializedTransaction;
  chainId: string;
  wallet: WalletDescriptor;
  simulation?: SimulationResult;
  timestamp: string;
  apiKeyId: string;
}

export interface PolicyResult {
  allow: boolean;
  reason?: string;
}

// === Aegis Budget Types ===
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

// === Aegis Guard Types ===
export interface GuardConfig {
  mode: "allowlist" | "blocklist";
  addresses: Record<string, string[]>;
  blockAddresses?: string[];
}

// === Aegis Approve Types ===
export interface ApproveConfig {
  thresholds: {
    auto_approve_below: string;
    require_approval_above: string;
    hard_block_above: string;
  };
  approval_ttl_minutes: number;
  queue_path?: string;
}

export interface PendingApproval {
  id: string;
  apiKeyId: string;
  chainId: string;
  transaction: SerializedTransaction;
  estimatedValue: string;
  token: string;
  reason?: string;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "approved" | "rejected" | "expired";
  resolvedAt?: string;
}

export interface ApprovalQueue {
  pending: PendingApproval[];
}

// === Service Registry Types ===
export interface ServiceEntry {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  price: string;
  token: string;
  protocol: "x402" | "mpp";
  chains: string[];
  registeredBy: string;
  registeredAt: string;
}

export interface ServiceRegistry {
  services: ServiceEntry[];
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
