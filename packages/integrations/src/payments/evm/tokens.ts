import {
  encodeFunctionData,
  parseUnits,
  formatUnits,
  type Abi,
} from "viem";
import { readContract } from "./provider.js";
import type { TokenInfo } from "../types.js";

// ---------------------------------------------------------------------------
// Minimal ERC-20 ABI
// ---------------------------------------------------------------------------

export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const satisfies Abi;

// ---------------------------------------------------------------------------
// Token registry — verified mainnet contract addresses
// ---------------------------------------------------------------------------

type TokenRegistry = Record<string, Record<string, TokenInfo>>;

export const TOKEN_REGISTRY: TokenRegistry = {
  // Ethereum Mainnet (eip155:1)
  "eip155:1": {
    USDC: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      symbol: "USDC",
    },
    USDT: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      symbol: "USDT",
    },
    DAI: {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
      symbol: "DAI",
    },
    WETH: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
      symbol: "WETH",
    },
  },

  // Base Mainnet (eip155:8453)
  "eip155:8453": {
    USDC: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      symbol: "USDC",
    },
    USDT: {
      address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      decimals: 6,
      symbol: "USDT",
    },
    DAI: {
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      decimals: 18,
      symbol: "DAI",
    },
    WETH: {
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      symbol: "WETH",
    },
  },

  // Polygon Mainnet (eip155:137)
  "eip155:137": {
    USDC: {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      decimals: 6,
      symbol: "USDC",
    },
    USDT: {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
      symbol: "USDT",
    },
    DAI: {
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      decimals: 18,
      symbol: "DAI",
    },
    WETH: {
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
      symbol: "WETH",
    },
  },

  // Arbitrum One (eip155:42161)
  "eip155:42161": {
    USDC: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      symbol: "USDC",
    },
    USDT: {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      symbol: "USDT",
    },
    DAI: {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      symbol: "DAI",
    },
    WETH: {
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
      symbol: "WETH",
    },
  },

  // Optimism Mainnet (eip155:10)
  "eip155:10": {
    USDC: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      symbol: "USDC",
    },
    USDT: {
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
      symbol: "USDT",
    },
    DAI: {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      symbol: "DAI",
    },
    WETH: {
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      symbol: "WETH",
    },
  },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Resolve a token symbol (e.g. "USDC") or contract address to a TokenInfo
 * for the given CAIP-2 chain. Returns null if not found.
 */
export function resolveToken(chainId: string, tokenOrAddress: string): TokenInfo | null {
  const chainTokens = TOKEN_REGISTRY[chainId];
  if (!chainTokens) return null;

  // Try by symbol first (case-insensitive)
  const upperKey = tokenOrAddress.toUpperCase();
  if (chainTokens[upperKey]) return chainTokens[upperKey];

  // Try by contract address (case-insensitive)
  const lowerAddr = tokenOrAddress.toLowerCase();
  for (const info of Object.values(chainTokens)) {
    if (info.address.toLowerCase() === lowerAddr) return info;
  }

  return null;
}

/**
 * Fetch the ERC-20 token balance for an owner address.
 * Returns the raw balance as a bigint (not scaled by decimals).
 */
export async function getTokenBalance(
  chainId: string,
  tokenAddress: `0x${string}`,
  ownerAddress: `0x${string}`
): Promise<bigint> {
  const result = await readContract(chainId, {
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [ownerAddress],
  });
  return result as bigint;
}

/**
 * ABI-encode an ERC-20 transfer(to, amount) call.
 * Returns the hex-encoded calldata string.
 */
export function encodeTransferData(
  to: `0x${string}`,
  amount: bigint
): string {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
  });
}

/**
 * Parse a human-readable token amount string into a raw bigint.
 * e.g. parseTokenAmount("5.00", 6) → 5_000_000n
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  return parseUnits(amount, decimals);
}

/**
 * Format a raw bigint token amount into a human-readable string.
 * e.g. formatTokenAmount(5_000_000n, 6) → "5"
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  return formatUnits(amount, decimals);
}
