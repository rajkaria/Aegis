import type { ReceiptData } from "../types";

// ---------------------------------------------------------------------------
// anchorReceiptStellar — STUBBED (OWS signing not available in dashboard)
// ---------------------------------------------------------------------------

export interface AnchorReceiptStellarParams {
  receipt: ReceiptData;
  from: string;       // Source Stellar account public key
  chainId: string;    // "stellar:pubnet" | "stellar:testnet"
  walletName?: string; // OWS wallet name for signing
}

/**
 * Anchor a receipt hash permanently on Stellar via MEMO_HASH.
 *
 * NOTE: OWS signing is not available in the dashboard.
 * This function always throws — use the /api/payments/anchor API route instead.
 *
 * @returns The Stellar transaction hash (hex string) of the anchor transaction.
 */
export async function anchorReceiptStellar(
  _params: AnchorReceiptStellarParams
): Promise<string> {
  throw new Error(
    "OWS signing not available in dashboard. " +
    "Use the /api/payments/anchor API route to anchor Stellar receipts on-chain."
  );
}
