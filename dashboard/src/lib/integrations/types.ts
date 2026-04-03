export interface ChainBalance {
  chain: string; // Human-readable: "Solana", "XRP Ledger", "Ethereum", "Base"
  chainId: string; // CAIP-2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", "ripple:0", "eip155:1"
  token: string; // "SOL", "XRP", "ETH", "USDC"
  balance: string; // Raw amount as string
  usdValue: string; // USD equivalent
  source: string; // "solana-rpc", "xrpl-rpc", "zerion", "uniblock"
}

export interface TxVerification {
  txHash: string;
  chain: string;
  status: "confirmed" | "pending" | "not_found" | "error";
  blockNumber?: number;
  timestamp?: string;
  source: string; // "allium"
}

export interface FundingOption {
  provider: string; // "moonpay"
  command: string; // CLI command to run
  url?: string; // Web URL for browser-based funding
  supportedTokens: string[];
  supportedChains: string[];
}
