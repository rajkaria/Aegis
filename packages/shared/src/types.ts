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

// === Aegis Deadswitch Types ===
export interface DeadswitchConfig {
  maxInactiveMinutes: number;
  onTrigger: "revoke_key";
  recoveryWallet?: string;
  sweepFunds: boolean;
  lastHeartbeat?: string;
  enabled: boolean;
}

// === Earnings Ledger Types ===
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

// === Agent Profile (P&L) ===
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
