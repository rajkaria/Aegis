import type { ChainConfig } from "../types.js";

// ---------------------------------------------------------------------------
// EVM chain configuration registry
// ---------------------------------------------------------------------------

const EVM_CHAINS: ChainConfig[] = [
  {
    chainId: "eip155:1",
    numericChainId: 1,
    name: "Ethereum",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      ...(process.env.ETHEREUM_RPC_URL ? [process.env.ETHEREUM_RPC_URL] : []),
      ...(process.env.EVM_RPC_URL ? [process.env.EVM_RPC_URL] : []),
      "https://eth.llamarpc.com",
      "https://rpc.ankr.com/eth",
      "https://ethereum-rpc.publicnode.com",
    ],
    blockExplorer: "https://etherscan.io",
    gasModel: "eip1559",
    avgBlockTime: 12,
  },
  {
    chainId: "eip155:8453",
    numericChainId: 8453,
    name: "Base",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      ...(process.env.BASE_RPC_URL ? [process.env.BASE_RPC_URL] : []),
      ...(process.env.EVM_RPC_URL ? [process.env.EVM_RPC_URL] : []),
      "https://mainnet.base.org",
      "https://base-rpc.publicnode.com",
    ],
    blockExplorer: "https://basescan.org",
    gasModel: "optimism",
    avgBlockTime: 2,
  },
  {
    chainId: "eip155:137",
    numericChainId: 137,
    name: "Polygon",
    nativeToken: { symbol: "POL", decimals: 18 },
    rpcUrls: [
      ...(process.env.POLYGON_RPC_URL ? [process.env.POLYGON_RPC_URL] : []),
      ...(process.env.EVM_RPC_URL ? [process.env.EVM_RPC_URL] : []),
      "https://polygon-rpc.com",
      "https://rpc.ankr.com/polygon",
    ],
    blockExplorer: "https://polygonscan.com",
    gasModel: "eip1559",
    avgBlockTime: 2,
  },
  {
    chainId: "eip155:42161",
    numericChainId: 42161,
    name: "Arbitrum",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      ...(process.env.ARBITRUM_RPC_URL ? [process.env.ARBITRUM_RPC_URL] : []),
      ...(process.env.EVM_RPC_URL ? [process.env.EVM_RPC_URL] : []),
      "https://arb1.arbitrum.io/rpc",
      "https://rpc.ankr.com/arbitrum",
    ],
    blockExplorer: "https://arbiscan.io",
    gasModel: "arbitrum",
    avgBlockTime: 1,
  },
  {
    chainId: "eip155:10",
    numericChainId: 10,
    name: "Optimism",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      ...(process.env.OPTIMISM_RPC_URL ? [process.env.OPTIMISM_RPC_URL] : []),
      ...(process.env.EVM_RPC_URL ? [process.env.EVM_RPC_URL] : []),
      "https://mainnet.optimism.io",
      "https://rpc.ankr.com/optimism",
    ],
    blockExplorer: "https://optimistic.etherscan.io",
    gasModel: "optimism",
    avgBlockTime: 2,
  },
  {
    chainId: "eip155:11155111",
    numericChainId: 11155111,
    name: "Sepolia",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      ...(process.env.SEPOLIA_RPC_URL ? [process.env.SEPOLIA_RPC_URL] : []),
      ...(process.env.EVM_RPC_URL ? [process.env.EVM_RPC_URL] : []),
      "https://rpc.sepolia.org",
      "https://ethereum-sepolia-rpc.publicnode.com",
    ],
    blockExplorer: "https://sepolia.etherscan.io",
    gasModel: "eip1559",
    avgBlockTime: 12,
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Return the ChainConfig for a given CAIP-2 chain ID, or null if not found.
 */
export function getChainConfig(chainId: string): ChainConfig | null {
  return EVM_CHAINS.find((c) => c.chainId === chainId) ?? null;
}

/**
 * Return the first available RPC URL for a chain.
 * Prefers env-var-configured URLs over public fallbacks.
 */
export function getWorkingRpcUrl(chainId: string): string {
  const config = getChainConfig(chainId);
  if (!config || config.rpcUrls.length === 0) {
    throw new Error(`No RPC URL available for chain ${chainId}`);
  }
  return config.rpcUrls[0];
}

/**
 * Build a block-explorer transaction URL.
 */
export function getExplorerTxUrl(chainId: string, txHash: string): string {
  const config = getChainConfig(chainId);
  if (!config) return `https://etherscan.io/tx/${txHash}`;
  return `${config.blockExplorer}/tx/${txHash}`;
}

/**
 * Returns true if the given CAIP-2 chain ID is a known EVM chain.
 */
export function isEvmChain(chainId: string): boolean {
  return EVM_CHAINS.some((c) => c.chainId === chainId);
}

/**
 * Rough USD price estimate for native tokens.
 * Used for fee estimation; not for production pricing.
 */
export function getNativeTokenUsdPrice(symbol: string): number {
  const prices: Record<string, number> = {
    ETH: 3200,
    POL: 0.45,
    MATIC: 0.45,
  };
  return prices[symbol.toUpperCase()] ?? 0;
}

export { EVM_CHAINS };
