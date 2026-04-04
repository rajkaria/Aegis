import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { signTransaction } from "@open-wallet-standard/core";

const DEVNET_RPC = "https://api.devnet.solana.com";
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const WALLET_ADDRESSES: Record<string, string> = {
  "data-miner": "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
  "analyst": "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
  "research-buyer": "9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A",
};

/**
 * Anchor a receipt hash on Solana devnet using the Memo program.
 * The memo contains: "AEGIS_RECEIPT:<receiptHash>"
 * Returns the Solana tx hash or null on failure.
 */
export async function anchorReceiptOnChain(
  signerWalletName: string,
  receiptHash: string
): Promise<string | null> {
  const signerAddr = WALLET_ADDRESSES[signerWalletName];
  if (!signerAddr) return null;

  try {
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const signer = new PublicKey(signerAddr);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

    // Create memo instruction with receipt hash
    const memoData = `AEGIS_RECEIPT:${receiptHash}`;
    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData, "utf-8"),
    });

    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: signer,
    }).add(memoInstruction);

    // Sign using OWS SDK (in-process, no race condition)
    const messageBytes = tx.serializeMessage();
    const messageHex = Buffer.from(messageBytes).toString("hex");
    const signResult = signTransaction(signerWalletName, "solana", messageHex);
    const signatureBytes = Buffer.from(signResult.signature, "hex");
    tx.addSignature(signer, signatureBytes);

    // Broadcast
    const txHash = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await connection.confirmTransaction({
      signature: txHash,
      blockhash,
      lastValidBlockHeight,
    }, "confirmed");

    return txHash;
  } catch (err) {
    console.error("Receipt anchoring failed:", (err as Error).message?.slice(0, 100));
    return null;
  }
}
