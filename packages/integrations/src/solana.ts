import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import type { ChainBalance } from "./types.js";

const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_USD_ESTIMATE = 180; // Rough estimate, would use price feed in production

export async function getSolanaBalances(walletAddress: string): Promise<ChainBalance[]> {
  const balances: ChainBalance[] = [];

  try {
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    const pubkey = new PublicKey(walletAddress);

    // Get SOL balance
    const lamports = await connection.getBalance(pubkey);
    const solBalance = lamports / LAMPORTS_PER_SOL;

    if (solBalance > 0) {
      balances.push({
        chain: "Solana",
        chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        token: "SOL",
        balance: solBalance.toFixed(6),
        usdValue: (solBalance * SOL_USD_ESTIMATE).toFixed(2),
        source: "solana-rpc",
      });
    }

    // Get USDC token account balance
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      mint: new PublicKey(SOLANA_USDC_MINT),
    });

    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed;
      if (parsed?.info?.tokenAmount) {
        const amount = parsed.info.tokenAmount.uiAmountString ?? "0";
        if (parseFloat(amount) > 0) {
          balances.push({
            chain: "Solana",
            chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
            token: "USDC",
            balance: amount,
            usdValue: amount, // USDC is pegged 1:1
            source: "solana-rpc",
          });
        }
      }
    }
  } catch (err) {
    // Return empty on error — balance query is best-effort
    console.error("Solana balance query failed:", (err as Error).message);
  }

  return balances;
}
