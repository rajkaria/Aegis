import type { ChainBalance } from "./types";

const UNIBLOCK_API_BASE = "https://api.uniblock.dev/v1";

export async function getEvmBalances(
  walletAddress: string,
  chains?: string[]
): Promise<ChainBalance[]> {
  const apiKey = process.env.UNIBLOCK_API_KEY;
  if (!apiKey) {
    console.error("UNIBLOCK_API_KEY not set — skipping Uniblock balance query");
    return [];
  }

  const balances: ChainBalance[] = [];
  const targetChains = chains ?? ["ethereum", "base", "polygon", "arbitrum"];

  for (const chain of targetChains) {
    try {
      const response = await fetch(
        `${UNIBLOCK_API_BASE}/token/balances?address=${walletAddress}&chain=${chain}`,
        {
          headers: {
            "x-api-key": apiKey,
            accept: "application/json",
          },
        }
      );

      if (!response.ok) continue;

      const data = (await response.json()) as {
        data?: Array<{
          symbol: string;
          balance: string;
          usdValue?: number;
          chain: string;
        }>;
      };

      for (const token of data.data ?? []) {
        const bal = parseFloat(token.balance);
        if (bal < 0.0001) continue;

        const chainMap: Record<string, string> = {
          ethereum: "Ethereum",
          base: "Base",
          polygon: "Polygon",
          arbitrum: "Arbitrum",
        };

        const chainIdMap: Record<string, string> = {
          ethereum: "eip155:1",
          base: "eip155:8453",
          polygon: "eip155:137",
          arbitrum: "eip155:42161",
        };

        balances.push({
          chain: chainMap[chain] ?? chain,
          chainId: chainIdMap[chain] ?? `eip155:${chain}`,
          token: token.symbol,
          balance: bal.toFixed(6),
          usdValue: (token.usdValue ?? 0).toFixed(2),
          source: "uniblock",
        });
      }
    } catch (err) {
      console.error(`Uniblock query failed for ${chain}:`, (err as Error).message);
    }
  }

  return balances;
}
