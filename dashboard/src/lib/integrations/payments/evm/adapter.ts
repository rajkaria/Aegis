import {
  formatUnits,
} from "viem";
// TODO: OWS signing (getWallet, signTransaction) not available in dashboard.
// sendPayment and anchorReceipt are stubbed — use API routes instead.
import type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData } from "../types";
import type { ChainBalance, TxVerification } from "../../types";
import { EVM_CHAINS, getChainConfig, getExplorerTxUrl } from "./chains";
import { getPublicClient, getBalance as getEthBalance, getTransactionReceipt } from "./provider";
import { resolveToken, getTokenBalance, formatTokenAmount } from "./tokens";
import { estimatePaymentFees } from "./gas";
import { resolveAddressOrENS } from "./ens";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** CAIP-2 chain IDs considered mainnet (excluded: Sepolia testnet). */
const MAINNET_CHAIN_IDS = new Set([
  "eip155:1",   // Ethereum
  "eip155:8453",  // Base
  "eip155:137",   // Polygon
  "eip155:42161", // Arbitrum
  "eip155:10",    // Optimism
]);

/** Default wallet name when none is configured. */
const DEFAULT_WALLET_NAME = "default";

// ---------------------------------------------------------------------------
// EVMAdapter
// ---------------------------------------------------------------------------

export class EVMAdapter implements ChainAdapter {
  readonly chainType = "evm" as const;

  readonly supportedChains: string[] = EVM_CHAINS.map((c) => c.chainId);

  /** Wallet name to use for signing. Defaults to "default". */
  private readonly walletName: string;

  constructor(walletName: string = DEFAULT_WALLET_NAME) {
    this.walletName = walletName;
  }

  // -------------------------------------------------------------------------
  // sendPayment — STUBBED (OWS signing not available in dashboard)
  // -------------------------------------------------------------------------

  async sendPayment(_params: PaymentParams): Promise<PaymentResult> {
    throw new Error(
      "OWS signing not available in dashboard. " +
      "Use the /api/payments/send API route to send EVM payments."
    );
  }

  // -------------------------------------------------------------------------
  // estimateFees
  // -------------------------------------------------------------------------

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    // No wallet resolution needed for read-only fee estimation
    return estimatePaymentFees({
      chain: params.chain,
      to: params.to,
      amount: params.amount,
      token: params.token,
    });
  }

  // -------------------------------------------------------------------------
  // verifyTransaction
  // -------------------------------------------------------------------------

  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    const config = getChainConfig(chainId);
    const chainName = config?.name ?? chainId;

    const receipt = await getTransactionReceipt(chainId, txHash as `0x${string}`);

    if (!receipt) {
      // Not yet mined — check if pending
      try {
        const client = getPublicClient(chainId);
        const tx = await client.getTransaction({ hash: txHash as `0x${string}` });
        return {
          txHash,
          chain: chainName,
          status: tx ? "pending" : "not_found",
          source: "evm-rpc",
        };
      } catch {
        return {
          txHash,
          chain: chainName,
          status: "not_found",
          source: "evm-rpc",
        };
      }
    }

    // Map receipt status
    const status: TxVerification["status"] =
      receipt.status === "success"
        ? "confirmed"
        : receipt.status === "reverted"
        ? "error"
        : "pending";

    return {
      txHash,
      chain: chainName,
      status,
      blockNumber: Number(receipt.blockNumber),
      source: "evm-rpc",
    };
  }

  // -------------------------------------------------------------------------
  // getBalance
  // -------------------------------------------------------------------------

  async getBalance(address: string, token?: string): Promise<ChainBalance[]> {
    const balances: ChainBalance[] = [];
    const addr = address as `0x${string}`;

    // Iterate mainnet chains only (skip testnets)
    const mainnetChains = EVM_CHAINS.filter((c) => MAINNET_CHAIN_IDS.has(c.chainId));

    await Promise.allSettled(
      mainnetChains.map(async (chainConfig) => {
        const { chainId, name, nativeToken } = chainConfig;

        try {
          if (!token) {
            // Native balance
            const rawBalance = await getEthBalance(chainId, addr);
            const balance = formatUnits(rawBalance, nativeToken.decimals);

            balances.push({
              chain: name,
              chainId,
              token: nativeToken.symbol,
              balance,
              usdValue: "0", // USD pricing is out of scope for this adapter
              source: "evm-rpc",
            });
          } else {
            // ERC-20 balance
            const tokenInfo = resolveToken(chainId, token);
            if (!tokenInfo) return; // Token not supported on this chain

            const rawBalance = await getTokenBalance(
              chainId,
              tokenInfo.address as `0x${string}`,
              addr
            );
            const balance = formatTokenAmount(rawBalance, tokenInfo.decimals);

            balances.push({
              chain: name,
              chainId,
              token: tokenInfo.symbol,
              balance,
              usdValue: "0",
              source: "evm-rpc",
            });
          }
        } catch {
          // Best-effort: silently skip chains that fail (RPC unavailable, etc.)
        }
      })
    );

    return balances;
  }

  // -------------------------------------------------------------------------
  // anchorReceipt — STUBBED (OWS signing not available in dashboard)
  // -------------------------------------------------------------------------

  async anchorReceipt(_receipt: ReceiptData, _chainId: string): Promise<string> {
    throw new Error(
      "OWS signing not available in dashboard. " +
      "Use the /api/payments/anchor API route to anchor receipts on-chain."
    );
  }

  // -------------------------------------------------------------------------
  // resolveAddress
  // -------------------------------------------------------------------------

  async resolveAddress(nameOrAddress: string, _chainId?: string): Promise<string> {
    // ENS resolution always uses Ethereum mainnet regardless of chainId
    return resolveAddressOrENS(nameOrAddress);
  }
}

// Suppress unused import warning — getExplorerTxUrl is part of the module's public API
void getExplorerTxUrl;
