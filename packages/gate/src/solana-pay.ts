import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getSolanaKeypair, getSolanaAddress } from "./ows-wallet-provider.js";

function getSolanaRpcUrl(): string {
  const url = process.env.SOLANA_RPC_URL;
  if (!url) {
    throw new Error(
      "SOLANA_RPC_URL not set. Configure it before making Solana payments:\n" +
      "  Devnet:  export SOLANA_RPC_URL=https://api.devnet.solana.com\n" +
      "  Mainnet: export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com"
    );
  }
  return url;
}

export async function sendSolPayment(
  fromWalletName: string,
  toAddress: string,
  amountSol: number
): Promise<string | null> {
  const keypair = getSolanaKeypair(fromWalletName);
  if (!keypair) {
    console.warn(`[solana-pay] No OWS keypair for ${fromWalletName} — skipping real payment`);
    return null;
  }

  try {
    const connection = new Connection(getSolanaRpcUrl(), "confirmed");
    const to = new PublicKey(toAddress);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: keypair.publicKey,
    }).add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: to,
        lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
      })
    );

    tx.sign(keypair);

    const rawTx = tx.serialize();
    const txHash = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await connection.confirmTransaction({ signature: txHash, blockhash, lastValidBlockHeight }, "confirmed");
    return txHash;
  } catch (err) {
    console.error("Solana payment failed:", (err as Error).message?.slice(0, 100));
    return null;
  }
}

export { getSolanaAddress };
