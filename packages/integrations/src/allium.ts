import type { TxVerification, ChainBalance } from "./types.js";

const ALLIUM_API_BASE = "https://api.allium.so/api/v1/developer";

// CAIP-2 chain ID → Allium chain name
function getAlliumChain(chainId: string): string | null {
  const map: Record<string, string> = {
    "eip155:1": "ethereum",
    "eip155:8453": "base",
    "eip155:137": "polygon",
    "eip155:42161": "arbitrum",
    "eip155:10": "optimism",
    "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": "solana",
  };
  return map[chainId] ?? null;
}

/**
 * Verify a transaction on-chain using Allium Realtime API.
 * Uses POST /wallet/transactions with transaction_hash filter.
 */
export async function verifyTransaction(
  txHash: string,
  chain: string
): Promise<TxVerification> {
  const apiKey = process.env.ALLIUM_API_KEY;
  if (!apiKey) {
    return { txHash, chain, status: "error", source: "allium-realtime" };
  }

  const alliumChain = getAlliumChain(chain);
  if (!alliumChain) {
    return { txHash, chain, status: "error", source: "allium-realtime" };
  }

  try {
    const url = new URL(`${ALLIUM_API_BASE}/wallet/transactions`);
    url.searchParams.set("transaction_hash", txHash);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify([
        { chain: alliumChain, address: "0x0000000000000000000000000000000000000000" },
      ]),
    });

    if (!response.ok) {
      return { txHash, chain, status: "error", source: "allium-realtime" };
    }

    const data = await response.json() as {
      items?: Array<{
        transaction_hash: string;
        block_number: number;
        block_timestamp: string;
        success: boolean;
      }>;
    };

    if (!data.items || data.items.length === 0) {
      return { txHash, chain, status: "not_found", source: "allium-realtime" };
    }

    const tx = data.items[0];
    return {
      txHash,
      chain,
      status: tx.success ? "confirmed" : "pending",
      blockNumber: tx.block_number,
      timestamp: tx.block_timestamp,
      source: "allium-realtime",
    };
  } catch (err) {
    console.error("Allium realtime verification failed:", (err as Error).message);
    return { txHash, chain, status: "error", source: "allium-realtime" };
  }
}

/**
 * Get token balances for a wallet using Allium Realtime API.
 * Uses POST /wallet/balances endpoint.
 */
export async function getAlliumBalances(
  walletAddress: string,
  chain: string
): Promise<ChainBalance[]> {
  const apiKey = process.env.ALLIUM_API_KEY;
  if (!apiKey) return [];

  const alliumChain = getAlliumChain(chain);
  if (!alliumChain) return [];

  try {
    const response = await fetch(`${ALLIUM_API_BASE}/wallet/balances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify([{ chain: alliumChain, address: walletAddress }]),
    });

    if (!response.ok) return [];

    const data = await response.json() as {
      items?: Array<{
        symbol: string;
        balance_raw: string;
        decimals: number;
        chain: string;
        price_usd?: number;
      }>;
    };

    const balances: ChainBalance[] = [];
    for (const item of data.items ?? []) {
      const rawBalance = parseFloat(item.balance_raw) / Math.pow(10, item.decimals);
      if (rawBalance < 0.0001) continue;

      const chainNames: Record<string, string> = {
        ethereum: "Ethereum",
        base: "Base",
        polygon: "Polygon",
        arbitrum: "Arbitrum",
        solana: "Solana",
      };

      balances.push({
        chain: chainNames[item.chain] ?? item.chain,
        chainId: chain,
        token: item.symbol,
        balance: rawBalance.toFixed(6),
        usdValue: ((item.price_usd ?? 0) * rawBalance).toFixed(2),
        source: "allium-realtime",
      });
    }

    return balances;
  } catch (err) {
    console.error("Allium balance query failed:", (err as Error).message);
    return [];
  }
}

export async function verifyTransactions(
  transactions: { txHash: string; chain: string }[]
): Promise<TxVerification[]> {
  return Promise.all(
    transactions.map((tx) => verifyTransaction(tx.txHash, tx.chain))
  );
}
