import * as StellarSdk from "@stellar/stellar-sdk";
import { createHash } from "node:crypto";
import type { PaymentParams, PaymentResult } from "../types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";

/** Known Stellar issued assets (CAIP-style lookup). */
export const STELLAR_ASSETS: Record<string, { code: string; issuer: string }> = {
  USDC: {
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHorizonUrl(chainId: string): string {
  return chainId === "stellar:pubnet" ? HORIZON_MAINNET : HORIZON_TESTNET;
}

function getExplorerTxUrl(chainId: string, txHash: string): string {
  const network = chainId === "stellar:pubnet" ? "" : "?network=testnet";
  return `https://stellar.expert/explorer/${chainId === "stellar:pubnet" ? "public" : "testnet"}/tx/${txHash}${network}`;
}

function isTestnet(chainId: string): boolean {
  return chainId !== "stellar:pubnet";
}

// ---------------------------------------------------------------------------
// sendStellarPayment
// ---------------------------------------------------------------------------

export interface StellarPaymentParams {
  chainId: string;
  from: string;     // Source Stellar account (public key)
  to: string;       // Destination Stellar account (public key)
  amount: string;   // Human-readable amount (e.g. "10.5")
  asset?: string;   // Asset symbol (e.g. "USDC"); omit for native XLM
  memo?: string;    // Optional text memo (max 28 chars)
  walletName?: string; // OWS wallet name for signing
}

/**
 * Send a Stellar payment (XLM or issued asset) signed via OWS.
 *
 * Signing flow:
 * 1. Build the transaction
 * 2. Compute its hash via tx.hash()
 * 3. Attempt OWS signTransaction(walletName, "stellar", hashHex)
 * 4. Add the signature to the transaction envelope
 * 5. Submit to Horizon
 *
 * If OWS signing is unavailable, falls back to returning a structured mock
 * result so the caller can inspect the transaction structure without a live wallet.
 */
export async function sendStellarPayment(
  params: StellarPaymentParams
): Promise<PaymentResult> {
  const { chainId, from, to, amount, asset, memo, walletName = "default" } = params;

  const horizonUrl = getHorizonUrl(chainId);
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  const testnet = isTestnet(chainId);

  // Load source account sequence number
  const sourceAccount = await server.loadAccount(from);

  // Determine the payment asset
  let paymentAsset: StellarSdk.Asset;
  let tokenSymbol: string;

  if (!asset || asset === "XLM") {
    paymentAsset = StellarSdk.Asset.native();
    tokenSymbol = "XLM";
  } else {
    const known = STELLAR_ASSETS[asset.toUpperCase()];
    if (!known) {
      throw new Error(
        `Unknown Stellar asset: "${asset}". Known assets: ${Object.keys(STELLAR_ASSETS).join(", ")}`
      );
    }
    paymentAsset = new StellarSdk.Asset(known.code, known.issuer);
    tokenSymbol = known.code;
  }

  // Build the transaction
  const networkPassphrase = testnet
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC;

  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: to,
        asset: paymentAsset,
        amount,
      })
    )
    .setTimeout(180);

  // Add text memo (truncated to 28 bytes — Stellar's limit)
  if (memo) {
    const truncated = memo.slice(0, 28);
    builder.addMemo(StellarSdk.Memo.text(truncated));
  }

  const tx = builder.build();

  // ---------------------------------------------------------------------------
  // OWS signing
  // TODO: Replace with live OWS signTransaction once Stellar key management
  // is supported in the open-wallet-standard SDK. For now we attempt it and
  // fall back gracefully.
  // ---------------------------------------------------------------------------
  let txHash: string;
  try {
    // Compute the transaction hash (32-byte Buffer)
    const hashBytes: Buffer = tx.hash();
    const hashHex = hashBytes.toString("hex");

    // Attempt OWS signing
    // Dynamic require so that missing OWS SDK doesn't crash the import
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { signTransaction } = await import("@open-wallet-standard/core");
    const signResult = signTransaction(walletName, "stellar", hashHex);
    const sigHex: string = signResult.signature;

    // sigHex is a 64-byte ed25519 signature in hex (no recovery bit)
    const sigBytes = Buffer.from(sigHex, "hex");
    const keypairHint = StellarSdk.Keypair.fromPublicKey(from);
    tx.addSignature(keypairHint.publicKey(), sigBytes.toString("base64"));

    // Submit
    const submitResult = await server.submitTransaction(tx);
    txHash = submitResult.hash;
  } catch (owsErr) {
    // OWS signing or submission failed — return a structured mock result.
    // Callers can inspect the failure via the status field.
    console.warn(
      "[Stellar] OWS signing/submission failed, returning mock result:",
      (owsErr as Error).message?.slice(0, 120)
    );

    // Derive a deterministic placeholder hash from the transaction's own hash
    const fallbackHash = createHash("sha256")
      .update(tx.hash())
      .digest("hex");

    return {
      txHash: fallbackHash,
      chain: chainId,
      from,
      to,
      amount,
      token: tokenSymbol,
      fee: "0.00001",
      explorerUrl: getExplorerTxUrl(chainId, fallbackHash),
      status: "failed",
    };
  }

  return {
    txHash,
    chain: chainId,
    from,
    to,
    amount,
    token: tokenSymbol,
    fee: "0.00001", // Stellar fixed base fee in XLM
    explorerUrl: getExplorerTxUrl(chainId, txHash),
    status: "pending",
  };
}
