import { Client } from "xrpl";
import type { ChainBalance } from "./types.js";

const XRP_USD_ESTIMATE = 2.5; // Rough estimate

export async function getXrpBalances(walletAddress: string): Promise<ChainBalance[]> {
  const balances: ChainBalance[] = [];
  const client = new Client("wss://xrplcluster.com/");

  try {
    await client.connect();

    const response = await client.request({
      command: "account_info",
      account: walletAddress,
      ledger_index: "validated",
    });

    // XRP balance is in drops (1 XRP = 1,000,000 drops)
    const drops = parseInt(response.result.account_data.Balance, 10);
    const xrpBalance = drops / 1_000_000;

    if (xrpBalance > 0) {
      balances.push({
        chain: "XRP Ledger",
        chainId: "ripple:0",
        token: "XRP",
        balance: xrpBalance.toFixed(6),
        usdValue: (xrpBalance * XRP_USD_ESTIMATE).toFixed(2),
        source: "xrpl-rpc",
      });
    }

    // Check for trust line balances (USDC, etc.)
    const lines = await client.request({
      command: "account_lines",
      account: walletAddress,
      ledger_index: "validated",
    });

    for (const line of lines.result.lines) {
      const balance = parseFloat(line.balance);
      if (balance > 0) {
        balances.push({
          chain: "XRP Ledger",
          chainId: "ripple:0",
          token: line.currency,
          balance: balance.toFixed(6),
          usdValue: balance.toFixed(2), // Simplified
          source: "xrpl-rpc",
        });
      }
    }
  } catch (err) {
    console.error("XRP balance query failed:", (err as Error).message);
  } finally {
    await client.disconnect().catch(() => {});
  }

  return balances;
}
