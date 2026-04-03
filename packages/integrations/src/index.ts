export * from "./types.js";
export * from "./solana.js";
export * from "./ripple.js";
export * from "./zerion.js";
export * from "./uniblock.js";
export * from "./allium.js";
export * from "./moonpay.js";

// Convenience: aggregate balances from all available sources
import { getSolanaBalances } from "./solana.js";
import { getXrpBalances } from "./ripple.js";
import { getZerionPortfolio } from "./zerion.js";
import { getEvmBalances } from "./uniblock.js";
import type { ChainBalance } from "./types.js";

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
    // Try Zerion first (richer data), fall back to Uniblock
    queries.push(getZerionPortfolio(addresses.evm));
    queries.push(getEvmBalances(addresses.evm));
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
