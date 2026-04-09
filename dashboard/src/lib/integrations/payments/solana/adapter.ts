import { clusterApiUrl } from "@solana/web3.js";
import type {
  ChainAdapter,
  PaymentParams,
  PaymentResult,
  FeeEstimate,
  ReceiptData,
} from "../types";
import type { ChainBalance, TxVerification } from "../../types";
import { getSolanaBalances } from "../../solana";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Solana average transaction fee (5000 lamports = 0.000005 SOL). */
const SOLANA_FEE_SOL = "0.000005";
/** Rough USD estimate at ~$180/SOL. */
const SOLANA_FEE_USD = "0.0009";
/** Solana average block (slot) time in seconds. */
const SOLANA_BLOCK_TIME = 0.4;

/** CAIP-2 chain ID for Solana mainnet-beta. */
const SOLANA_MAINNET_CHAIN = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

// ---------------------------------------------------------------------------
// RPC helpers
// ---------------------------------------------------------------------------

function getRpcUrl(chainId: string): string {
  if (chainId === SOLANA_MAINNET_CHAIN) {
    return process.env["SOLANA_RPC_URL"] ?? clusterApiUrl("mainnet-beta");
  }
  // Devnet
  return clusterApiUrl("devnet");
}

// ---------------------------------------------------------------------------
// SolanaAdapter
// ---------------------------------------------------------------------------

/**
 * Thin ChainAdapter wrapper for Solana.
 *
 * Full Solana payment signing lives in the `@aegis-ows/gate` package which
 * has access to the OWS key management and Solana transaction building logic.
 * This adapter handles read operations (balances, transaction verification)
 * and fee estimation, delegating write operations to gate with clear errors.
 */
export class SolanaAdapter implements ChainAdapter {
  readonly chainType = "solana" as const;

  readonly supportedChains: string[] = [
    SOLANA_MAINNET_CHAIN,
    "solana:devnet",
  ];

  // -------------------------------------------------------------------------
  // sendPayment — delegates to gate package
  // -------------------------------------------------------------------------

  async sendPayment(_params: PaymentParams): Promise<PaymentResult> {
    throw new Error(
      "Solana payments require @aegis-ows/gate. " +
      "Use sendSolPayment() from the gate package directly.\n" +
      "Example:\n" +
      "  import { sendSolPayment } from 'aegis-ows-gate';\n" +
      "  await sendSolPayment({ to, amount, rpcUrl });"
    );
  }

  // -------------------------------------------------------------------------
  // estimateFees
  // -------------------------------------------------------------------------

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    return {
      chain: params.chain,
      fee: SOLANA_FEE_SOL,
      feeUsd: SOLANA_FEE_USD,
      estimatedTime: SOLANA_BLOCK_TIME,
    };
  }

  // -------------------------------------------------------------------------
  // verifyTransaction
  // -------------------------------------------------------------------------

  /**
   * Verify a Solana transaction by calling getTransaction on the JSON-RPC endpoint.
   * Mirrors the pattern used in verify-settlement.ts in the gate package.
   */
  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    const rpcUrl = getRpcUrl(chainId);
    const chain = chainId === SOLANA_MAINNET_CHAIN ? "solana:mainnet" : "solana:devnet";

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [
            txHash,
            {
              encoding: "json",
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            },
          ],
        }),
      });

      if (!response.ok) {
        return { txHash, chain, status: "error", source: "solana-rpc" };
      }

      const body = (await response.json()) as {
        result?: {
          meta?: { err: unknown } | null;
          slot?: number;
          blockTime?: number | null;
        } | null;
        error?: unknown;
      };

      if (body.error || !body.result) {
        // null result = transaction not yet confirmed or not found
        return {
          txHash,
          chain,
          status: body.result === null ? "not_found" : "error",
          source: "solana-rpc",
        };
      }

      const { meta, slot, blockTime } = body.result;

      if (meta === undefined || meta === null) {
        return { txHash, chain, status: "pending", source: "solana-rpc" };
      }

      const status: TxVerification["status"] = meta.err ? "error" : "confirmed";
      const timestamp =
        blockTime != null
          ? new Date(blockTime * 1000).toISOString()
          : undefined;

      return {
        txHash,
        chain,
        status,
        blockNumber: slot,
        timestamp,
        source: "solana-rpc",
      };
    } catch (err) {
      console.error("Solana verifyTransaction failed:", (err as Error).message?.slice(0, 100));
      return { txHash, chain, status: "error", source: "solana-rpc" };
    }
  }

  // -------------------------------------------------------------------------
  // getBalance
  // -------------------------------------------------------------------------

  async getBalance(address: string, _token?: string): Promise<ChainBalance[]> {
    return getSolanaBalances(address);
  }

  // -------------------------------------------------------------------------
  // anchorReceipt — delegates to gate package
  // -------------------------------------------------------------------------

  async anchorReceipt(_receipt: ReceiptData, _chainId: string): Promise<string> {
    throw new Error(
      "Solana receipt anchoring requires @aegis-ows/gate. " +
      "Use the gate package's Solana integration for on-chain receipt anchoring.\n" +
      "Alternatively, use the Stellar adapter which supports MEMO_HASH anchoring natively."
    );
  }

  // -------------------------------------------------------------------------
  // resolveAddress — no name service
  // -------------------------------------------------------------------------

  async resolveAddress(nameOrAddress: string, _chainId?: string): Promise<string> {
    // Solana does not have a built-in name service in this adapter.
    // SNS (Solana Name Service) support can be added via @bonfida/spl-name-service.
    return nameOrAddress;
  }
}
