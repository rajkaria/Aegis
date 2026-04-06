import type { ChainBalance } from "./types";

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const XLM_USD_ESTIMATE = 0.12;

export async function getStellarBalances(accountId: string): Promise<ChainBalance[]> {
  const balances: ChainBalance[] = [];
  try {
    const response = await fetch(`${HORIZON_TESTNET}/accounts/${accountId}`);
    if (!response.ok) return [];
    const account = await response.json() as { balances: Array<{ asset_type: string; balance: string; asset_code?: string }> };

    for (const bal of account.balances) {
      const amount = parseFloat(bal.balance);
      if (amount <= 0) continue;

      if (bal.asset_type === "native") {
        balances.push({
          chain: "Stellar",
          chainId: "stellar:testnet",
          token: "XLM",
          balance: amount.toFixed(6),
          usdValue: (amount * XLM_USD_ESTIMATE).toFixed(2),
          source: "stellar-horizon",
        });
      } else if (bal.asset_code) {
        balances.push({
          chain: "Stellar",
          chainId: "stellar:testnet",
          token: bal.asset_code,
          balance: amount.toFixed(6),
          usdValue: bal.asset_code === "USDC" ? amount.toFixed(2) : "0.00",
          source: "stellar-horizon",
        });
      }
    }
  } catch {}
  return balances;
}
