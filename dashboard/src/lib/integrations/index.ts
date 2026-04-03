export * from "./types";
export * from "./solana";
export * from "./ripple";
export * from "./zerion";
export * from "./uniblock";
export * from "./allium";
export * from "./moonpay";

// Convenience: aggregate balances from all available sources
import { getSolanaBalances } from "./solana";
import { getXrpBalances } from "./ripple";
import { getZerionPortfolio } from "./zerion";
import { getEvmBalances } from "./uniblock";
import { getAlliumBalances } from "./allium";
import type { ChainBalance } from "./types";

export async function getAllBalances(addresses: {
  solana?: string;
  xrp?: string;
  evm?: string;
}): Promise<ChainBalance[]> {
  const results: ChainBalance[] = [];

  const queries: Promise<ChainBalance[]>[] = [];

  if (addresses.solana) queries.push(getSolanaBalances(addresses.solana));
  if (addresses.xrp) queries.push(getXrpBalances(addresses.xrp));
  if (addresses.evm) {
    // Try multiple sources — Zerion, Uniblock, Allium — keep richest data
    queries.push(getZerionPortfolio(addresses.evm));
    queries.push(getEvmBalances(addresses.evm));
    queries.push(getAlliumBalances(addresses.evm, "eip155:1"));
  }

  const allResults = await Promise.allSettled(queries);

  for (const result of allResults) {
    if (result.status === "fulfilled") {
      results.push(...result.value);
    }
  }

  // Deduplicate: if same chain+token appears from multiple sources, keep the one with higher value
  const seen = new Map<string, ChainBalance>();
  for (const b of results) {
    const key = `${b.chain}:${b.token}`;
    const existing = seen.get(key);
    if (!existing || parseFloat(b.usdValue) > parseFloat(existing.usdValue)) {
      seen.set(key, b);
    }
  }

  return Array.from(seen.values());
}
