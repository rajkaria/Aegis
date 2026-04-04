import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { PATHS, ensureAegisDir } from "./paths.js";
import { withFileLock } from "./file-lock.js";

export interface PaymentReceipt {
  id: string;
  timestamp: string;
  from: string;         // buyer agent ID
  to: string;           // seller agent ID
  amount: string;
  token: string;
  chain: string;
  endpoint: string;     // service endpoint paid for
  paymentTxHash?: string;  // the payment transaction hash
  receiptHash: string;     // SHA-256 of the receipt data
  proofTxHash?: string;    // Solana tx that anchors this receipt on-chain
  status: "created" | "anchored" | "verified";
}

export interface ReceiptLedger {
  receipts: PaymentReceipt[];
}

const RECEIPTS_PATH = PATHS.aegisDir + "/receipts.json";

export function readReceipts(): ReceiptLedger {
  if (!existsSync(RECEIPTS_PATH)) return { receipts: [] };
  try {
    return JSON.parse(readFileSync(RECEIPTS_PATH, "utf-8")) as ReceiptLedger;
  } catch {
    return { receipts: [] };
  }
}

export function createReceipt(params: {
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: string;
  endpoint: string;
  paymentTxHash?: string;
}): PaymentReceipt {
  const timestamp = new Date().toISOString();
  const id = `rcpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Create deterministic hash of the receipt data
  const receiptData = JSON.stringify({
    id,
    timestamp,
    from: params.from,
    to: params.to,
    amount: params.amount,
    token: params.token,
    chain: params.chain,
    endpoint: params.endpoint,
    paymentTxHash: params.paymentTxHash,
  });
  const receiptHash = createHash("sha256").update(receiptData).digest("hex");

  const receipt: PaymentReceipt = {
    id,
    timestamp,
    ...params,
    receiptHash,
    status: "created",
  };

  // Save to ledger
  withFileLock(RECEIPTS_PATH, () => {
    ensureAegisDir();
    const ledger = readReceipts();
    ledger.receipts.push(receipt);
    writeFileSync(RECEIPTS_PATH, JSON.stringify(ledger, null, 2));
  });

  return receipt;
}

export function updateReceiptProof(receiptId: string, proofTxHash: string): void {
  withFileLock(RECEIPTS_PATH, () => {
    const ledger = readReceipts();
    const receipt = ledger.receipts.find(r => r.id === receiptId);
    if (receipt) {
      receipt.proofTxHash = proofTxHash;
      receipt.status = "anchored";
      writeFileSync(RECEIPTS_PATH, JSON.stringify(ledger, null, 2));
    }
  });
}

export function getReceiptsByAgent(agentId: string): PaymentReceipt[] {
  const ledger = readReceipts();
  return ledger.receipts.filter(r => r.from === agentId || r.to === agentId);
}
