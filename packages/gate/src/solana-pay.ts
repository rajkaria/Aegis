import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { execSync } from "node:child_process";

const DEVNET_RPC = "https://api.devnet.solana.com";

export async function sendSolPayment(
  fromWalletName: string,
  toAddress: string,
  amountSol: number
): Promise<string | null> {
  try {
    const conn = new Connection(DEVNET_RPC, "finalized");
    const fromAddr = getWalletSolanaAddress(fromWalletName);
    if (!fromAddr) return null;

    const from = new PublicKey(fromAddr);
    const to = new PublicKey(toAddress);

    const { blockhash } = await conn.getLatestBlockhash("finalized");
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: from })
      .add(SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports: Math.floor(amountSol * LAMPORTS_PER_SOL) }));

    const hex = Buffer.from(tx.serialize({ verifySignatures: false, requireAllSignatures: false })).toString("hex");

    const result = execSync(
      `ows sign send-tx --chain solana --wallet ${fromWalletName} --rpc-url ${DEVNET_RPC} --json --tx ${hex}`,
      { encoding: "utf-8", timeout: 30000, env: { ...process.env, PATH: (process.env.HOME ?? "") + "/.ows/bin:" + process.env.PATH } }
    );

    const parsed = JSON.parse(result.trim()) as { tx_hash?: string };
    return parsed.tx_hash ?? null;
  } catch (err) {
    console.error("Solana payment failed:", (err as Error).message?.slice(0, 100));
    return null;
  }
}

function getWalletSolanaAddress(name: string): string | null {
  const addresses: Record<string, string> = {
    "data-miner": "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
    "analyst": "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
    "research-buyer": "9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A",
  };
  return addresses[name] ?? null;
}
