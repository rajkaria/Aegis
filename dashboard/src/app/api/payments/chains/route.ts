import { NextResponse } from "next/server";

interface ChainInfo {
  chainId: string;
  name: string;
  nativeToken: string;
  gasModel: string;
  avgBlockTime: number;
  blockExplorer: string;
  tier: "cheap" | "moderate" | "expensive";
  recommended?: boolean;
}

const CHAINS: ChainInfo[] = [
  // EVM chains
  {
    chainId: "eip155:1",
    name: "Ethereum",
    nativeToken: "ETH",
    gasModel: "eip1559",
    avgBlockTime: 12,
    blockExplorer: "https://etherscan.io",
    tier: "expensive",
  },
  {
    chainId: "eip155:8453",
    name: "Base",
    nativeToken: "ETH",
    gasModel: "optimism",
    avgBlockTime: 2,
    blockExplorer: "https://basescan.org",
    tier: "cheap",
    recommended: true,
  },
  {
    chainId: "eip155:137",
    name: "Polygon",
    nativeToken: "POL",
    gasModel: "eip1559",
    avgBlockTime: 2,
    blockExplorer: "https://polygonscan.com",
    tier: "cheap",
  },
  {
    chainId: "eip155:42161",
    name: "Arbitrum",
    nativeToken: "ETH",
    gasModel: "arbitrum",
    avgBlockTime: 1,
    blockExplorer: "https://arbiscan.io",
    tier: "cheap",
  },
  {
    chainId: "eip155:10",
    name: "Optimism",
    nativeToken: "ETH",
    gasModel: "optimism",
    avgBlockTime: 2,
    blockExplorer: "https://optimistic.etherscan.io",
    tier: "moderate",
  },
  // Stellar
  {
    chainId: "stellar:pubnet",
    name: "Stellar",
    nativeToken: "XLM",
    gasModel: "fee-bump",
    avgBlockTime: 5,
    blockExplorer: "https://stellar.expert/explorer/public",
    tier: "cheap",
  },
  // Solana
  {
    chainId: "solana:mainnet",
    name: "Solana",
    nativeToken: "SOL",
    gasModel: "priority-fee",
    avgBlockTime: 1,
    blockExplorer: "https://solscan.io",
    tier: "cheap",
  },
];

export async function GET() {
  return NextResponse.json({ chains: CHAINS });
}
