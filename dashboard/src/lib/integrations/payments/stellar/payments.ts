import { createHash } from "node:crypto";
import type { PaymentParams, PaymentResult } from "../types";

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
  return `https://stellar.expert/explorer/${chainId === "stellar:pubnet" ? "public" : "testnet"}/tx/${txHash}`;
}

// ---------------------------------------------------------------------------
// sendStellarPayment — STUBBED (OWS signing not available in dashboard)
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
 * Send a Stellar payment (XLM or issued asset).
 *
 * NOTE: OWS signing is not available in the dashboard.
 * This function always throws — use the /api/payments/send API route instead.
 */
export async function sendStellarPayment(
  _params: StellarPaymentParams
): Promise<PaymentResult> {
  throw new Error(
    "OWS signing not available in dashboard. " +
    "Use the /api/payments/send API route to send Stellar payments."
  );
}

// Keep these exports for type-checking and external imports
export { getHorizonUrl, getExplorerTxUrl };
