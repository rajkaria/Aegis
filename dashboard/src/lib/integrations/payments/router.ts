import type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData } from "./types";
import type { ChainBalance, TxVerification } from "../types";
import { EVMAdapter } from "./evm/adapter";
import { StellarAdapter } from "./stellar/adapter";
import { SolanaAdapter } from "./solana/adapter";

// ---------------------------------------------------------------------------
// PaymentRouter
// ---------------------------------------------------------------------------

/**
 * Multi-chain payment router.
 *
 * Routes payment operations to the correct ChainAdapter based on the CAIP-2
 * chain ID prefix:
 *   - "eip155:*"  → EVMAdapter  (Ethereum, Base, Polygon, Arbitrum, Optimism)
 *   - "stellar:*" → StellarAdapter
 *   - "solana:*"  → SolanaAdapter
 *
 * Usage:
 *   const router = getPaymentRouter();
 *   await router.estimateFees({ chain: "eip155:8453", to, amount });
 */
export class PaymentRouter {
  private readonly adapters: Map<string, ChainAdapter> = new Map();

  constructor(walletName: string = "default") {
    // Register adapters by CAIP-2 prefix
    this.adapters.set("eip155", new EVMAdapter(walletName));
    this.adapters.set("stellar", new StellarAdapter(walletName));
    this.adapters.set("solana", new SolanaAdapter());
  }

  // -------------------------------------------------------------------------
  // Adapter resolution
  // -------------------------------------------------------------------------

  /**
   * Look up the adapter for a given CAIP-2 chain ID.
   * Throws a descriptive error if no adapter is registered for the chain prefix.
   */
  getAdapter(chainId: string): ChainAdapter {
    const prefix = chainId.split(":")[0];
    if (!prefix) {
      throw new Error(
        `Invalid chain ID "${chainId}". Expected CAIP-2 format, e.g. "eip155:8453".`
      );
    }

    const adapter = this.adapters.get(prefix);
    if (!adapter) {
      const supported = [...this.adapters.keys()].join(", ");
      throw new Error(
        `No adapter registered for chain prefix "${prefix}" (chain: "${chainId}"). ` +
        `Supported prefixes: ${supported}.`
      );
    }

    return adapter;
  }

  // -------------------------------------------------------------------------
  // Core operations — delegate to adapter
  // -------------------------------------------------------------------------

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    return this.getAdapter(params.chain).sendPayment(params);
  }

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    return this.getAdapter(params.chain).estimateFees(params);
  }

  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    return this.getAdapter(chainId).verifyTransaction(txHash, chainId);
  }

  async getBalance(
    address: string,
    chainId: string,
    token?: string
  ): Promise<ChainBalance[]> {
    return this.getAdapter(chainId).getBalance(address, token);
  }

  async anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string> {
    return this.getAdapter(chainId).anchorReceipt(receipt, chainId);
  }

  async resolveAddress(
    nameOrAddress: string,
    chainId: string
  ): Promise<string> {
    return this.getAdapter(chainId).resolveAddress(nameOrAddress, chainId);
  }

  // -------------------------------------------------------------------------
  // sendPaymentAuto — cheapest-chain selection
  // -------------------------------------------------------------------------

  /**
   * Estimate fees on all provided chains and send the payment on the
   * cheapest one (lowest `feeUsd`).
   *
   * @param params - Payment params **without** a `chain` field.
   * @param chains - CAIP-2 chain IDs to consider (must all support the adapter).
   * @returns The PaymentResult from the chosen chain.
   */
  async sendPaymentAuto(
    params: Omit<PaymentParams, "chain">,
    chains: string[]
  ): Promise<PaymentResult> {
    if (chains.length === 0) {
      throw new Error("sendPaymentAuto requires at least one chain to evaluate.");
    }

    // Estimate fees in parallel on all chains
    const estimates = await Promise.allSettled(
      chains.map(async (chain) => {
        const fee = await this.estimateFees({ ...params, chain });
        return { chain, fee };
      })
    );

    // Collect successful estimates
    const successful = estimates
      .filter(
        (r): r is PromiseFulfilledResult<{ chain: string; fee: FeeEstimate }> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value);

    if (successful.length === 0) {
      const errors = estimates
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map((r) => (r.reason as Error).message)
        .join("; ");
      throw new Error(`Could not estimate fees on any chain. Errors: ${errors}`);
    }

    // Pick the chain with the lowest USD fee
    const cheapest = successful.reduce((best, current) => {
      const bestFee = parseFloat(best.fee.feeUsd ?? best.fee.fee);
      const currentFee = parseFloat(current.fee.feeUsd ?? current.fee.fee);
      return currentFee < bestFee ? current : best;
    });

    // Send on the cheapest chain
    return this.sendPayment({ ...params, chain: cheapest.chain });
  }

  // -------------------------------------------------------------------------
  // getSupportedChains
  // -------------------------------------------------------------------------

  /**
   * Return all CAIP-2 chain IDs supported across all registered adapters.
   */
  getSupportedChains(): string[] {
    const chains: string[] = [];
    for (const adapter of this.adapters.values()) {
      chains.push(...adapter.supportedChains);
    }
    return chains;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _routerInstance: PaymentRouter | null = null;

/**
 * Get (or create) the singleton PaymentRouter instance.
 *
 * @param walletName - OWS wallet name for signing. Defaults to "default".
 *   Pass a value to create a new instance with a different wallet.
 */
export function getPaymentRouter(walletName?: string): PaymentRouter {
  if (!_routerInstance || walletName) {
    _routerInstance = new PaymentRouter(walletName);
  }
  return _routerInstance;
}
