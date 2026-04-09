export * from "./types.js";
export * from "./solana.js";
export * from "./ripple.js";
export * from "./zerion.js";
export * from "./uniblock.js";
export * from "./allium.js";
export * from "./moonpay.js";
export * from "./stellar.js";

// Convenience: aggregate balances from all available sources
import { getSolanaBalances } from "./solana.js";
import { getXrpBalances } from "./ripple.js";
import { getZerionPortfolio } from "./zerion.js";
import { getEvmBalances } from "./uniblock.js";
import { getAlliumBalances } from "./allium.js";
import { getStellarBalances } from "./stellar.js";
import type { ChainBalance } from "./types.js";

export async function getAllBalances(addresses: {
  solana?: string;
  xrp?: string;
  evm?: string;
  stellar?: string;
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
  if (addresses.stellar) queries.push(getStellarBalances(addresses.stellar));

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

// Multi-chain payment gateway
export { PaymentRouter, getPaymentRouter } from "./payments/router.js";
export { EVMAdapter } from "./payments/evm/adapter.js";
export { StellarAdapter } from "./payments/stellar/adapter.js";
export { SolanaAdapter } from "./payments/solana/adapter.js";
export type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData, ChainConfig, TokenInfo } from "./payments/types.js";
export { EVM_CHAINS, getChainConfig, isEvmChain, getExplorerTxUrl } from "./payments/evm/chains.js";
export { TOKEN_REGISTRY, resolveToken } from "./payments/evm/tokens.js";
export { estimatePaymentFees, compareFeesAcrossChains } from "./payments/evm/gas.js";
export { resolveENS, reverseResolveENS } from "./payments/evm/ens.js";
export { contractRead, encodeContractWrite } from "./payments/evm/contracts.js";
