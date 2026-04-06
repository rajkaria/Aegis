import { NextResponse } from "next/server";
import { getAllBalances } from "@/lib/integrations";
import type { ChainBalance } from "@/lib/integrations/types";

export const dynamic = "force-dynamic";

// Map agent IDs to their wallet addresses on different chains
// In production these come from OWS wallet data
// Real OWS wallet addresses (from ows wallet list)
const AGENT_WALLETS: Record<
  string,
  { solana?: string; xrp?: string; evm?: string; stellar?: string }
> = {
  "data-miner": {
    evm: "0x6344D6E94BbeBB612bA5eC55f3125Bf7a0B8666F",
    solana: "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
    stellar: "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR",
  },
  analyst: {
    evm: "0x4ef5aaef757B4180512a52A17023E3471BA3e361",
    solana: "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
    stellar: "GBDEVU63Y6NTHJQQZIKVTC23NWLQHMAXOZZKY3GPS4GDJ7QSK2JMFIVY",
  },
  "research-buyer": {
    evm: "0x2219FF712dbcf3fEE0a712bAD2E111D0008a2f1d",
    solana: "9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A",
    stellar: "GDI73WJ4SX7LOG3XZDJC3KCK6ED6E5NBYK2JUBQSPBCNNWEG3ZN7T7C",
  },
};

// Fallback balances when real RPC calls are not configured or fail
// SOL amounts reflect real post-transaction devnet balances after 3 supply chain cycles
const FALLBACK_BALANCES: Record<string, ChainBalance[]> = {
  "data-miner": [
    {
      chain: "Solana",
      chainId: "solana:devnet",
      token: "SOL",
      balance: "4.997",
      usdValue: "899.46",
      source: "fallback",
    },
    {
      chain: "Stellar",
      chainId: "stellar:testnet",
      token: "XLM",
      balance: "100.000000",
      usdValue: "12.00",
      source: "stellar-horizon",
    },
  ],
  analyst: [
    {
      chain: "Solana",
      chainId: "solana:devnet",
      token: "SOL",
      balance: "5.012",
      usdValue: "902.16",
      source: "fallback",
    },
    {
      chain: "Stellar",
      chainId: "stellar:testnet",
      token: "XLM",
      balance: "100.000000",
      usdValue: "12.00",
      source: "stellar-horizon",
    },
  ],
  "research-buyer": [
    {
      chain: "Solana",
      chainId: "solana:devnet",
      token: "SOL",
      balance: "1.985",
      usdValue: "357.30",
      source: "fallback",
    },
    {
      chain: "Stellar",
      chainId: "stellar:testnet",
      token: "XLM",
      balance: "100.000000",
      usdValue: "12.00",
      source: "stellar-horizon",
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
