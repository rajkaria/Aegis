import { createHash } from "node:crypto";
import type { ReceiptData } from "../types";
import { getExplorerTxUrl } from "./chains";

// ---------------------------------------------------------------------------
// Receipt anchoring via EVM calldata
// ---------------------------------------------------------------------------

/**
 * Compute a deterministic SHA-256 hash of a ReceiptData object.
 * Fields are sorted alphabetically before hashing for consistency.
 */
export function hashReceipt(receipt: ReceiptData): string {
  const canonical = JSON.stringify(receipt, Object.keys(receipt).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Encode a receipt as hex calldata for on-chain anchoring.
 * The calldata format is: "AEGIS_RECEIPT:<sha256-hex>" encoded as UTF-8 hex.
 */
export function encodeReceiptCalldata(receipt: ReceiptData): `0x${string}` {
  const hash = hashReceipt(receipt);
  const prefix = `AEGIS_RECEIPT:${hash}`;
  const hex = Buffer.from(prefix, "utf8").toString("hex");
  return `0x${hex}`;
}

// ---------------------------------------------------------------------------
// Transaction builder
// ---------------------------------------------------------------------------

export interface ReceiptAnchorTxParams {
  from: string;
  receipt: ReceiptData;
  chainId: string;
}

export interface ReceiptAnchorTx {
  to: string;
  value: bigint;
  data: `0x${string}`;
}

/**
 * Build a 0-value self-transfer transaction that embeds the receipt hash
 * in its calldata. The transaction is sent from `from` to `from` (self-transfer),
 * which creates a permanent on-chain record of the receipt hash.
 *
 * Returns the unsigned transaction fields { to, value, data }.
 * The caller is responsible for signing and broadcasting the transaction.
 */
export function buildReceiptAnchorTx(params: ReceiptAnchorTxParams): ReceiptAnchorTx {
  const { from, receipt, chainId } = params;

  // Unused but kept for API discoverability (callers may want the URL after broadcast)
  void getExplorerTxUrl(chainId, "0x0000000000000000000000000000000000000000000000000000000000000000");

  return {
    to: from, // self-transfer
    value: 0n,
    data: encodeReceiptCalldata(receipt),
  };
}

// ---------------------------------------------------------------------------
// Calldata decoder
// ---------------------------------------------------------------------------

/**
 * Decode hex calldata back to the receipt hash string.
 * Returns null if the calldata is not a valid AEGIS_RECEIPT anchor.
 */
export function decodeReceiptCalldata(data: string): string | null {
  try {
    const hex = data.startsWith("0x") ? data.slice(2) : data;
    const decoded = Buffer.from(hex, "hex").toString("utf8");
    if (!decoded.startsWith("AEGIS_RECEIPT:")) return null;
    return decoded.slice("AEGIS_RECEIPT:".length);
  } catch {
    return null;
  }
}
