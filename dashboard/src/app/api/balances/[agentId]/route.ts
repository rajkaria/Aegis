import { NextResponse } from "next/server";
import { getAllBalances } from "@/lib/integrations";
import type { ChainBalance } from "@/lib/integrations/types";

export const dynamic = "force-dynamic";

// Map agent IDs to their wallet addresses on different chains
// In production these come from OWS wallet data
const AGENT_WALLETS: Record<
  string,
  { solana?: string; xrp?: string; evm?: string }
> = {
  "data-miner": {
    evm: "0x0000000000000000000000000000000000000000", // placeholder
  },
  analyst: {
    evm: "0x0000000000000000000000000000000000000000",
  },
  "research-buyer": {
    evm: "0x0000000000000000000000000000000000000000",
  },
};

// Fallback balances when real RPC calls are not configured or fail
const FALLBACK_BALANCES: Record<string, ChainBalance[]> = {
  "data-miner": [
    {
      chain: "Base",
      chainId: "eip155:8453",
      token: "USDC",
      balance: "12.45",
      usdValue: "12.45",
      source: "fallback",
    },
    {
      chain: "Base",
      chainId: "eip155:8453",
      token: "ETH",
      balance: "0.008",
      usdValue: "24.00",
      source: "fallback",
    },
    {
      chain: "Solana",
      chainId: "solana:mainnet",
      token: "SOL",
      balance: "0.52",
      usdValue: "93.60",
      source: "fallback",
    },
  ],
  analyst: [
    {
      chain: "Base",
      chainId: "eip155:8453",
      token: "USDC",
      balance: "34.20",
      usdValue: "34.20",
      source: "fallback",
    },
    {
      chain: "Ethereum",
      chainId: "eip155:1",
      token: "USDC",
      balance: "5.00",
      usdValue: "5.00",
      source: "fallback",
    },
    {
      chain: "XRP Ledger",
      chainId: "ripple:0",
      token: "XRP",
      balance: "15.00",
      usdValue: "37.50",
      source: "fallback",
    },
  ],
  "research-buyer": [
    {
      chain: "Base",
      chainId: "eip155:8453",
      token: "USDC",
      balance: "0.15",
      usdValue: "0.15",
      source: "fallback",
    },
    {
      chain: "Solana",
      chainId: "solana:mainnet",
      token: "SOL",
      balance: "0.10",
      usdValue: "18.00",
      source: "fallback",
    },
  ],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const addresses = AGENT_WALLETS[agentId];

  if (!addresses) {
    // Return fallback for unknown agents
    return NextResponse.json({
      balances: FALLBACK_BALANCES[agentId] ?? [],
      sources: ["fallback"],
    });
  }

  try {
    const balances = await getAllBalances(addresses);

    // If no real balances returned (no keys configured, or all queries failed), use fallback
    if (balances.length === 0) {
      return NextResponse.json({
        balances: FALLBACK_BALANCES[agentId] ?? [],
        sources: ["fallback"],
      });
    }

    const sources = [...new Set(balances.map((b) => b.source))];
    return NextResponse.json({ balances, sources });
  } catch {
    return NextResponse.json({
      balances: FALLBACK_BALANCES[agentId] ?? [],
      sources: ["fallback"],
    });
  }
}
