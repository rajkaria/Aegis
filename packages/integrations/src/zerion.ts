import type { ChainBalance } from "./types.js";

const ZERION_API_BASE = "https://api.zerion.io/v1";

export async function getZerionPortfolio(walletAddress: string): Promise<ChainBalance[]> {
  const apiKey = process.env.ZERION_API_KEY;
  if (!apiKey) {
    console.error("ZERION_API_KEY not set — skipping Zerion portfolio query");
    return [];
  }

  const balances: ChainBalance[] = [];

  try {
    const response = await fetch(
      `${ZERION_API_BASE}/wallets/${walletAddress}/positions/?filter[positions]=only_simple&currency=usd`,
      {
        headers: {
          accept: "application/json",
          authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Zerion API error: ${response.status}`);
      return [];
    }

    const data = await response.json() as {
      data: Array<{
        attributes: {
          quantity: { float: number };
          value: number;
          fungible_info: { symbol: string; name: string };
          position_type: string;
        };
        relationships: {
          chain: { data: { id: string } };
        };
      }>;
    };

    for (const position of data.data) {
      const attrs = position.attributes;
      if (attrs.value < 0.01) continue; // Skip dust

      const chainId = position.relationships.chain.data.id;
      const chainName = chainId === "ethereum" ? "Ethereum"
        : chainId === "base" ? "Base"
        : chainId === "solana" ? "Solana"
        : chainId;

      balances.push({
        chain: chainName,
        chainId: `eip155:${chainId}`, // Simplified
        token: attrs.fungible_info.symbol,
        balance: attrs.quantity.float.toFixed(6),
        usdValue: attrs.value.toFixed(2),
        source: "zerion",
      });
    }
  } catch (err) {
    console.error("Zerion query failed:", (err as Error).message);
  }

  return balances;
}
