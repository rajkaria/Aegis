import * as StellarSdk from "@stellar/stellar-sdk";
import type { ChainBalance, TxVerification } from "./types.js";

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";
const XLM_USD_ESTIMATE = 0.12; // Rough estimate

export async function getStellarBalances(
  accountId: string,
  testnet: boolean = true
): Promise<ChainBalance[]> {
  const balances: ChainBalance[] = [];
  const horizonUrl = testnet ? HORIZON_TESTNET : HORIZON_MAINNET;
  const chainId = testnet ? "stellar:testnet" : "stellar:pubnet";

  try {
    const server = new StellarSdk.Horizon.Server(horizonUrl);
    const account = await server.loadAccount(accountId);

    for (const balance of account.balances) {
      if (balance.asset_type === "native") {
        const xlmBalance = parseFloat(balance.balance);
        if (xlmBalance > 0) {
          balances.push({
            chain: "Stellar",
            chainId,
            token: "XLM",
            balance: xlmBalance.toFixed(6),
            usdValue: (xlmBalance * XLM_USD_ESTIMATE).toFixed(2),
            source: "stellar-horizon",
          });
        }
      } else {
        // Token balances (USDC, etc.)
        const tokenBalance = parseFloat(balance.balance);
        if (tokenBalance > 0) {
          const tokenCode = (balance as any).asset_code ?? "UNKNOWN";
          balances.push({
            chain: "Stellar",
            chainId,
            token: tokenCode,
            balance: tokenBalance.toFixed(6),
            usdValue: tokenCode === "USDC" ? tokenBalance.toFixed(2) : (tokenBalance * 0.01).toFixed(2),
            source: "stellar-horizon",
          });
        }
      }
    }
  } catch (err) {
    console.error("Stellar balance query failed:", (err as Error).message?.slice(0, 100));
  }

  return balances;
}

export async function verifyStellarTransaction(
  txHash: string,
  testnet: boolean = true
): Promise<TxVerification> {
  const horizonUrl = testnet ? HORIZON_TESTNET : HORIZON_MAINNET;
  const chain = testnet ? "stellar:testnet" : "stellar:pubnet";

  try {
    const server = new StellarSdk.Horizon.Server(horizonUrl);
    const tx = await server.transactions().transaction(txHash).call();

    return {
      txHash,
      chain,
      status: tx.successful ? "confirmed" : "pending",
      blockNumber: typeof tx.ledger === "number" ? tx.ledger : Number(tx.ledger_attr),
      timestamp: tx.created_at,
      source: "stellar-horizon",
    };
  } catch (err) {
    if ((err as any)?.response?.status === 404) {
      return { txHash, chain, status: "not_found", source: "stellar-horizon" };
    }
    return { txHash, chain, status: "error", source: "stellar-horizon" };
  }
}

export async function fundStellarTestnet(accountId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(accountId)}`
    );
    return response.ok;
  } catch {
    return false;
  }
}
