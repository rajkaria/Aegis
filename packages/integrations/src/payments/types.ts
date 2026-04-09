import type { ChainBalance, TxVerification } from "../types.js";

export interface PaymentParams {
  chain: string;              // CAIP-2 chain ID (e.g., "eip155:8453")
  to: string;                 // Recipient address
  amount: string;             // Human-readable amount (e.g., "5.00")
  token?: string;             // Token symbol or contract address; default: native
  memo?: string;              // Optional memo/reference
  budgetCheck?: boolean;      // Check OWS budget limits; default: true
}

export interface PaymentResult {
  txHash: string;
  chain: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  fee: string;
  feeUsd?: string;
  blockNumber?: number;
  explorerUrl: string;
  status: "pending" | "confirmed" | "failed";
}

export interface FeeEstimate {
  chain: string;
  fee: string;
  feeUsd?: string;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedTime: number;
}

export interface ReceiptData {
  paymentTxHash: string;
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  token: string;
  chain: string;
  timestamp: number;
  metadata?: Record<string, string>;
}

export interface ChainConfig {
  chainId: string;
  numericChainId: number;
  name: string;
  nativeToken: { symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorer: string;
  gasModel: "legacy" | "eip1559" | "arbitrum" | "optimism";
  avgBlockTime: number;
}

export interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
}

export interface ChainAdapter {
  chainType: "evm" | "solana" | "stellar" | "xrpl";
  supportedChains: string[];

  sendPayment(params: PaymentParams): Promise<PaymentResult>;
  estimateFees(params: PaymentParams): Promise<FeeEstimate>;
  verifyTransaction(txHash: string, chainId: string): Promise<TxVerification>;
  getBalance(address: string, token?: string): Promise<ChainBalance[]>;
  anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string>;
  resolveAddress(nameOrAddress: string, chainId?: string): Promise<string>;
}
