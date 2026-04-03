import type { TxVerification } from "./types.js";

const ALLIUM_API_BASE = "https://api.allium.so/api/v1";

export async function verifyTransaction(txHash: string, chain: string): Promise<TxVerification> {
  const apiKey = process.env.ALLIUM_API_KEY;
  if (!apiKey) {
    return { txHash, chain, status: "error", source: "allium" };
  }

  try {
    // Allium uses SQL queries via API — query for the specific transaction
    const chainTable = getChainTable(chain);
    if (!chainTable) {
      return { txHash, chain, status: "error", source: "allium" };
    }

    const query = `SELECT block_number, block_timestamp, status FROM ${chainTable}.transactions WHERE hash = '${txHash}' LIMIT 1`;

    const response = await fetch(`${ALLIUM_API_BASE}/explorer/queries/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return { txHash, chain, status: "error", source: "allium" };
    }

    const data = await response.json() as {
      data?: Array<{
        block_number: number;
        block_timestamp: string;
        status: number;
      }>;
    };

    if (!data.data || data.data.length === 0) {
      return { txHash, chain, status: "not_found", source: "allium" };
    }

    const tx = data.data[0];
    return {
      txHash,
      chain,
      status: tx.status === 1 ? "confirmed" : "pending",
      blockNumber: tx.block_number,
      timestamp: tx.block_timestamp,
      source: "allium",
    };
  } catch (err) {
    console.error("Allium verification failed:", (err as Error).message);
    return { txHash, chain, status: "error", source: "allium" };
  }
}

function getChainTable(chain: string): string | null {
  const map: Record<string, string> = {
    "eip155:1": "ethereum",
    "eip155:8453": "base",
    "eip155:137": "polygon",
    "eip155:42161": "arbitrum",
    "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": "solana",
  };
  return map[chain] ?? null;
}

export async function verifyTransactions(transactions: { txHash: string; chain: string }[]): Promise<TxVerification[]> {
  return Promise.all(transactions.map((tx) => verifyTransaction(tx.txHash, tx.chain)));
}
