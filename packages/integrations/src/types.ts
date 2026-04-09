export interface ChainBalance {
  chain: string;        // Human-readable: "Solana", "XRP Ledger", "Ethereum", "Base"
  chainId: string;      // CAIP-2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", "ripple:0", "eip155:1"
  token: string;        // "SOL", "XRP", "ETH", "USDC"
  balance: string;      // Raw amount as string
  usdValue: string;     // USD equivalent
  source: string;       // "solana-rpc", "xrpl-rpc", "zerion", "uniblock"
}

export interface TxVerification {
  txHash: string;
  chain: string;
  status: "confirmed" | "pending" | "not_found" | "error";
  blockNumber?: number;
  timestamp?: string;
  source: string;       // "allium"
}

export interface FundingOption {
  provider: string;     // "moonpay"
  command: string;      // CLI command to run
  url?: string;         // Web URL for browser-based funding
  supportedTokens: string[];
  supportedChains: string[];
}

export interface MoonPayTransaction {
  id: string;
  externalTransactionId?: string;
  status: "waitingPayment" | "pending" | "waitingAuthorization" | "completed" | "failed";
  cryptoTransactionId?: string;   // On-chain tx hash when completed
  cryptoAmount?: string;
  baseCurrencyAmount?: string;    // Fiat amount
  baseCurrency?: string;          // "usd", "eur", etc.
  currency?: string;              // "sol", "usdc", "eth"
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoonPayCurrency {
  id: string;
  code: string;               // "sol", "usdc_sol", "eth"
  name: string;               // "Solana", "USD Coin (SOL)"
  type: "crypto";
  minBuyAmount: number | null;
  maxBuyAmount: number | null;
  minSellAmount: number | null;
  maxSellAmount: number | null;
  isSellSupported: boolean;
}

export interface MoonPayAvailability {
  isAllowed: boolean;
  isBuyAllowed: boolean;
  isSellAllowed: boolean;
  alpha2: string;               // Country code: "US", "GB", etc.
  state?: string;               // US state code if applicable
}
