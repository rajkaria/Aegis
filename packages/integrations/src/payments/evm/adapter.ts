import {
  formatUnits,
  serializeTransaction,
  keccak256,
  type TransactionSerializable,
} from "viem";
import { getWallet, signTransaction } from "@open-wallet-standard/core";
import type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData } from "../types.js";
import type { ChainBalance, TxVerification } from "../../types.js";
import { EVM_CHAINS, getChainConfig, getExplorerTxUrl } from "./chains.js";
import { getPublicClient, getBalance as getEthBalance, getTransactionReceipt, sendRawTransaction, getFeeData } from "./provider.js";
import { resolveToken, getTokenBalance, encodeTransferData, parseTokenAmount, formatTokenAmount } from "./tokens.js";
import { estimatePaymentFees } from "./gas.js";
import { resolveAddressOrENS } from "./ens.js";
import { buildReceiptAnchorTx } from "./receipt.js";

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

/** OWS chain family identifier for EVM. */
const OWS_EVM_CHAIN = "evm";

/** Default wallet name when none is configured. */
const DEFAULT_WALLET_NAME = "default";

// ---------------------------------------------------------------------------
// Helper: resolve OWS wallet address for EVM
// ---------------------------------------------------------------------------

/**
 * Look up the EVM address for a wallet by name.
 * Searches the accounts array for the "evm" chain family.
 * Falls back gracefully if the wallet is not found.
 */
function resolveWalletAddress(walletName: string): string | null {
  try {
    const wallet = getWallet(walletName);
    if (!wallet || !wallet.accounts) return null;

    // OWS wallet accounts use chainId like "evm" for the EVM family
    const evmAccount = wallet.accounts.find(
      (a) => a.chainId === "evm" || a.chainId.startsWith("eip155:")
    );
    return evmAccount?.address ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: build and sign a raw EVM transaction using OWS
// ---------------------------------------------------------------------------

interface RawTxParams {
  walletName: string;
  chainId: string;
  to: `0x${string}`;
  value: bigint;
  data?: `0x${string}`;
  nonce: number;
  gas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

/**
 * Build an EIP-1559 transaction, sign it via OWS, and return the
 * hex-encoded signed serialized transaction ready for broadcast.
 */
async function buildAndSignTx(params: RawTxParams): Promise<`0x${string}`> {
  const {
    walletName,
    chainId,
    to,
    value,
    data,
    nonce,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = params;

  const config = getChainConfig(chainId);
  if (!config) throw new Error(`Unknown chain: ${chainId}`);

  // Build unsigned EIP-1559 transaction
  const unsignedTx: TransactionSerializable = {
    type: "eip1559",
    chainId: config.numericChainId,
    to,
    value,
    data,
    nonce,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  // Serialize the unsigned transaction to get the signing hash
  const serializedUnsigned = serializeTransaction(unsignedTx);

  // OWS signs keccak256(serializedUnsigned) — pass the raw serialized bytes as hex
  // signTransaction expects the tx bytes as hex (without 0x prefix is also fine)
  const signResult = signTransaction(walletName, OWS_EVM_CHAIN, serializedUnsigned.slice(2));

  // The OWS signature is 65 bytes: r (32) + s (32) + v (1)
  const sigHex = signResult.signature;
  const sigBytes = Buffer.from(sigHex, "hex");

  if (sigBytes.length !== 65) {
    throw new Error(`Unexpected OWS signature length: ${sigBytes.length} (expected 65)`);
  }

  const r = `0x${sigBytes.subarray(0, 32).toString("hex")}` as `0x${string}`;
  const s = `0x${sigBytes.subarray(32, 64).toString("hex")}` as `0x${string}`;
  // For EIP-1559, v is 0 or 1 (parity); OWS stores recovery id in the last byte
  const vByte = sigBytes[64];
  const yParity = (vByte === 0 || vByte === 27) ? 0 : 1;

  // Serialize the signed transaction
  const signedTx = serializeTransaction(unsignedTx, { r, s, yParity });
  return signedTx;
}

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
  // sendPayment
  // -------------------------------------------------------------------------

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    const { chain, to, amount, token } = params;

    const config = getChainConfig(chain);
    if (!config) throw new Error(`Unsupported EVM chain: ${chain}`);

    // Resolve ENS name if needed
    const resolvedTo = (await resolveAddressOrENS(to)) as `0x${string}`;

    // Resolve sender address from OWS wallet
    const fromAddress = resolveWalletAddress(this.walletName);
    if (!fromAddress) {
      throw new Error(
        `No EVM address found for wallet "${this.walletName}". ` +
        `Create one with: ows wallet create ${this.walletName}`
      );
    }
    const from = fromAddress as `0x${string}`;

    // Determine native vs ERC-20 transfer
    const isNative = !token;
    let txTo: `0x${string}`;
    let txValue: bigint;
    let txData: `0x${string}` | undefined;
    let tokenSymbol: string;
    let tokenDecimals: number;

    if (isNative) {
      // Native transfer
      txTo = resolvedTo;
      txValue = parseTokenAmount(amount, config.nativeToken.decimals);
      txData = undefined;
      tokenSymbol = config.nativeToken.symbol;
      tokenDecimals = config.nativeToken.decimals;
    } else {
      // ERC-20 transfer
      const tokenInfo = resolveToken(chain, token);
      if (!tokenInfo) {
        throw new Error(`Unknown token "${token}" on chain ${chain}`);
      }

      const rawAmount = parseTokenAmount(amount, tokenInfo.decimals);
      const calldata = encodeTransferData(resolvedTo, rawAmount);

      txTo = tokenInfo.address as `0x${string}`;
      txValue = 0n;
      txData = calldata as `0x${string}`;
      tokenSymbol = tokenInfo.symbol;
      tokenDecimals = tokenInfo.decimals;
    }

    // Get fee data and nonce in parallel
    const client = getPublicClient(chain);
    const [feeData, nonce] = await Promise.all([
      getFeeData(chain),
      client.getTransactionCount({ address: from }),
    ]);

    // Gas estimation — use static fallback for native, try RPC for tokens
    let gas: bigint;
    try {
      gas = await client.estimateGas({
        account: from,
        to: txTo,
        value: txValue,
        data: txData,
      });
      // Apply 20% buffer
      gas = (gas * 120n) / 100n;
    } catch {
      gas = isNative ? 21_000n : 65_000n;
    }

    // Determine EIP-1559 fee params
    const maxFeePerGas: bigint =
      feeData.maxFeePerGas !== null ? feeData.maxFeePerGas : feeData.gasPrice * 2n;
    const maxPriorityFeePerGas: bigint =
      feeData.maxPriorityFeePerGas !== null
        ? feeData.maxPriorityFeePerGas
        : 1_500_000_000n; // 1.5 gwei default

    // Build, sign, and broadcast
    const signedTx = await buildAndSignTx({
      walletName: this.walletName,
      chainId: chain,
      to: txTo,
      value: txValue,
      data: txData,
      nonce,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    const txHash = await sendRawTransaction(chain, signedTx);

    // Calculate fee in native token
    const feeWei = gas * maxFeePerGas;
    const fee = formatUnits(feeWei, config.nativeToken.decimals);

    return {
      txHash,
      chain,
      from,
      to: resolvedTo,
      amount: formatTokenAmount(txValue, tokenDecimals),
      token: tokenSymbol,
      fee,
      blockNumber: undefined,
      explorerUrl: getExplorerTxUrl(chain, txHash),
      status: "pending",
    };
  }

  // -------------------------------------------------------------------------
  // estimateFees
  // -------------------------------------------------------------------------

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    const fromAddress = resolveWalletAddress(this.walletName) ?? undefined;

    return estimatePaymentFees({
      chain: params.chain,
      to: params.to,
      amount: params.amount,
      token: params.token,
      from: fromAddress,
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
  // anchorReceipt
  // -------------------------------------------------------------------------

  async anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string> {
    const fromAddress = resolveWalletAddress(this.walletName);
    if (!fromAddress) {
      throw new Error(
        `No EVM address found for wallet "${this.walletName}". ` +
        `Cannot anchor receipt without a signing address.`
      );
    }
    const from = fromAddress as `0x${string}`;

    // Build the 0-value self-transfer with receipt hash in calldata
    const anchorTx = buildReceiptAnchorTx({ from, receipt, chainId });

    // Get fee data and nonce
    const client = getPublicClient(chainId);
    const [feeData, nonce] = await Promise.all([
      getFeeData(chainId),
      client.getTransactionCount({ address: from }),
    ]);

    const maxFeePerGas: bigint =
      feeData.maxFeePerGas !== null ? feeData.maxFeePerGas : feeData.gasPrice * 2n;
    const maxPriorityFeePerGas: bigint =
      feeData.maxPriorityFeePerGas !== null
        ? feeData.maxPriorityFeePerGas
        : 1_500_000_000n;

    // Receipt anchor gas: slightly above the 25_000 static estimate
    const gas = 30_000n;

    const signedTx = await buildAndSignTx({
      walletName: this.walletName,
      chainId,
      to: anchorTx.to as `0x${string}`,
      value: anchorTx.value,
      data: anchorTx.data,
      nonce,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    const txHash = await sendRawTransaction(chainId, signedTx);
    return txHash;
  }

  // -------------------------------------------------------------------------
  // resolveAddress
  // -------------------------------------------------------------------------

  async resolveAddress(nameOrAddress: string, _chainId?: string): Promise<string> {
    // ENS resolution always uses Ethereum mainnet regardless of chainId
    return resolveAddressOrENS(nameOrAddress);
  }
}
