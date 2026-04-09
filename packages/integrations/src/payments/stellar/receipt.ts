import * as StellarSdk from "@stellar/stellar-sdk";
import { createHash } from "node:crypto";
import type { ReceiptData } from "../types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";

/** Minimum self-payment amount (1 stroop = 0.0000001 XLM). */
const MIN_XLM_AMOUNT = "0.0000001";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHorizonUrl(chainId: string): string {
  return chainId === "stellar:pubnet" ? HORIZON_MAINNET : HORIZON_TESTNET;
}

function isTestnet(chainId: string): boolean {
  return chainId !== "stellar:pubnet";
}

/**
 * Compute a canonical SHA-256 hash of a ReceiptData object.
 * Fields are sorted for determinism.
 */
function hashReceipt(receipt: ReceiptData): Buffer {
  const canonical = JSON.stringify(receipt, Object.keys(receipt).sort());
  return createHash("sha256").update(canonical).digest();
}

// ---------------------------------------------------------------------------
// anchorReceiptStellar
// ---------------------------------------------------------------------------

export interface AnchorReceiptStellarParams {
  receipt: ReceiptData;
  from: string;       // Source Stellar account public key
  chainId: string;    // "stellar:pubnet" | "stellar:testnet"
  walletName?: string; // OWS wallet name for signing
}

/**
 * Anchor a receipt hash permanently on Stellar.
 *
 * Uses a MEMO_HASH (32-byte SHA-256) attached to a minimal self-payment
 * (1 stroop XLM) so the record is permanent and discoverable on-chain.
 *
 * Signing uses OWS when available, falls back gracefully with a descriptive
 * error if OWS signing is not configured for Stellar keys.
 *
 * @returns The Stellar transaction hash (hex string) of the anchor transaction.
 */
export async function anchorReceiptStellar(
  params: AnchorReceiptStellarParams
): Promise<string> {
  const { receipt, from, chainId, walletName = "default" } = params;

  const horizonUrl = getHorizonUrl(chainId);
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  const testnet = isTestnet(chainId);

  // Hash the receipt to 32 bytes for MEMO_HASH
  const receiptHashBytes = hashReceipt(receipt);

  // Load source account
  const sourceAccount = await server.loadAccount(from);

  const networkPassphrase = testnet
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC;

  // Build the minimal self-payment with MEMO_HASH
  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: from, // self-payment to minimize cost
        asset: StellarSdk.Asset.native(),
        amount: MIN_XLM_AMOUNT,
      })
    )
    .addMemo(StellarSdk.Memo.hash(receiptHashBytes.toString("hex")))
    .setTimeout(180)
    .build();

  // ---------------------------------------------------------------------------
  // OWS signing — same pattern as payments.ts
  // TODO: Upgrade to live Stellar OWS key once SDK supports ed25519 key export.
  // ---------------------------------------------------------------------------
  try {
    const hashBytes: Buffer = tx.hash();
    const hashHex = hashBytes.toString("hex");

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { signTransaction } = await import("@open-wallet-standard/core");
    const signResult = signTransaction(walletName, "stellar", hashHex);
    const sigHex: string = signResult.signature;
    const sigBytes = Buffer.from(sigHex, "hex");

    const keypairHint = StellarSdk.Keypair.fromPublicKey(from);
    tx.addSignature(keypairHint.publicKey(), sigBytes.toString("base64"));

    const submitResult = await server.submitTransaction(tx);
    return submitResult.hash;
  } catch (err) {
    throw new Error(
      `Stellar receipt anchoring failed (OWS signing or submission error): ${
        (err as Error).message?.slice(0, 200)
      }`
    );
  }
}
