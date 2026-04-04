import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { signTransaction } from "@open-wallet-standard/core";

const DEVNET_RPC = "https://api.devnet.solana.com";

const WALLET_ADDRESSES: Record<string, string> = {
  "data-miner": "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
  "analyst": "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
  "research-buyer": "9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A",
};

export async function sendSolPayment(
  fromWalletName: string,
  toAddress: string,
  amountSol: number
): Promise<string | null> {
  const fromAddr = WALLET_ADDRESSES[fromWalletName];
  if (!fromAddr) return null;

  try {
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const from = new PublicKey(fromAddr);
    const to = new PublicKey(toAddress);

    // Build transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: from,
    }).add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
      })
    );

    // Serialize the transaction message for signing
    const messageBytes = tx.serializeMessage();
    const messageHex = Buffer.from(messageBytes).toString("hex");

    // Sign using OWS SDK directly (no CLI shell-out, no race condition)
    const signResult = signTransaction(fromWalletName, "solana", messageHex);
    const signatureBytes = Buffer.from(signResult.signature, "hex");

    // Add signature to transaction
    tx.addSignature(from, signatureBytes);

    // Broadcast the fully-signed transaction
    const rawTx = tx.serialize();
    const txHash = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    // Confirm
    await connection.confirmTransaction({
      signature: txHash,
      blockhash,
      lastValidBlockHeight,
    }, "confirmed");

    return txHash;
  } catch (err) {
    console.error("Solana payment failed:", (err as Error).message?.slice(0, 100));
    return null;
  }
}
