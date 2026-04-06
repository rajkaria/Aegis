import { Connection } from "@solana/web3.js";

/**
 * Verify a payment transaction landed on-chain.
 * Supports Solana (devnet + mainnet) and EVM chains.
 * Returns true (confirmed), false (not found/failed), or null (can't verify).
 */
export async function verifySettlement(txHash: string, network: string): Promise<boolean | null> {
  if (network.includes("solana")) {
    try {
      const rpcUrl = network.includes("devnet")
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com";
      const conn = new Connection(rpcUrl, "confirmed");
      const tx = await conn.getTransaction(txHash, { maxSupportedTransactionVersion: 0 });
      if (!tx) return false;
      return !tx.meta?.err;
    } catch { return null; }
  }

  if (network.startsWith("eip155:")) {
    const rpcs: Record<string, string> = {
      "eip155:1": "https://eth.llamarpc.com",
      "eip155:8453": "https://mainnet.base.org",
      "eip155:137": "https://polygon-rpc.com",
      "eip155:42161": "https://arb1.arbitrum.io/rpc",
      "eip155:11155111": "https://rpc.sepolia.org",
    };
    const rpcUrl = rpcs[network];
    if (!rpcUrl) return null;
    try {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [txHash], id: 1 }),
      });
      const data = await res.json() as { result?: { status: string } };
      if (!data.result) return false;
      return data.result.status === "0x1";
    } catch { return null; }
  }

  // Stellar verification
  if (network.includes("stellar")) {
    try {
      const horizonUrl = network.includes("testnet")
        ? "https://horizon-testnet.stellar.org"
        : "https://horizon.stellar.org";
      const response = await fetch(`${horizonUrl}/transactions/${txHash}`);
      if (!response.ok) return response.status === 404 ? false : null;
      const data = await response.json() as { successful?: boolean };
      return data.successful === true;
    } catch { return null; }
  }

  return null;
}
