import type { FeeEstimate } from "../types";
import { getChainConfig, getNativeTokenUsdPrice } from "./chains";
import { getFeeData, estimateGas as estimateGasRpc } from "./provider";
import { resolveToken, encodeTransferData, parseTokenAmount } from "./tokens";
import { formatUnits } from "viem";

// ---------------------------------------------------------------------------
// Static gas limits per operation type
// ---------------------------------------------------------------------------

const GAS_LIMITS = {
  nativeTransfer: 21_000n,
  erc20Transfer: 65_000n,
  erc20Approve: 46_000n,
  contractCall: 200_000n,
  receiptAnchor: 25_000n,
} as const;

// ---------------------------------------------------------------------------
// Buffer multipliers per gas model (scaled by 100 for integer math)
// ---------------------------------------------------------------------------

const BUFFER_MULTIPLIERS: Record<string, number> = {
  legacy: 1.2,
  eip1559: 1.15,
  arbitrum: 1.3,
  optimism: 1.2,
};

// ---------------------------------------------------------------------------
// Fee estimation helpers
// ---------------------------------------------------------------------------

/**
 * Apply a chain-specific buffer to a raw gas limit.
 * Returns the buffered gas limit as a bigint.
 */
function applyBuffer(gasLimit: bigint, model: string): bigint {
  const multiplier = BUFFER_MULTIPLIERS[model] ?? 1.2;
  // Multiply using integer math: scale by 1000 to avoid floating point issues
  return (gasLimit * BigInt(Math.round(multiplier * 1000))) / 1000n;
}

// ---------------------------------------------------------------------------
// estimatePaymentFees
// ---------------------------------------------------------------------------

export interface EstimatePaymentFeesParams {
  chain: string;
  to: string;
  amount: string;
  token?: string;
  from?: string;
}

/**
 * Estimate gas fees for a payment on the given chain.
 * Returns a FeeEstimate with cost in native token and USD.
 */
export async function estimatePaymentFees(
  params: EstimatePaymentFeesParams
): Promise<FeeEstimate> {
  const { chain, to, amount, token, from } = params;

  const config = getChainConfig(chain);
  if (!config) {
    throw new Error(`Unknown chain: ${chain}`);
  }

  const feeData = await getFeeData(chain);

  // Determine if this is a native or token transfer
  const isNative = !token;
  const tokenInfo = token ? resolveToken(chain, token) : null;

  // Start with static gas limit
  let gasLimit: bigint = isNative ? GAS_LIMITS.nativeTransfer : GAS_LIMITS.erc20Transfer;

  // If token transfer and from address provided, attempt RPC gas estimation
  if (!isNative && from && tokenInfo) {
    try {
      const tokenAddress = tokenInfo.address as `0x${string}`;
      const rawAmount = parseTokenAmount(amount, tokenInfo.decimals);
      const calldata = encodeTransferData(to as `0x${string}`, rawAmount);

      const estimated = await estimateGasRpc(chain, {
        account: from as `0x${string}`,
        to: tokenAddress,
        data: calldata as `0x${string}`,
      });

      gasLimit = estimated;
    } catch {
      // Fall back to static limit — RPC estimate failed (e.g. no balance)
    }
  }

  // Apply chain-specific buffer
  const bufferedGasLimit = applyBuffer(gasLimit, config.gasModel);

  // Calculate effective gas price
  let effectiveGasPrice: bigint;
  let maxFeePerGas: bigint | undefined;
  let maxPriorityFeePerGas: bigint | undefined;

  if (feeData.maxFeePerGas !== null && feeData.maxPriorityFeePerGas !== null) {
    maxFeePerGas = feeData.maxFeePerGas;
    maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    effectiveGasPrice = feeData.maxFeePerGas;
  } else {
    effectiveGasPrice = feeData.gasPrice;
  }

  // Total fee in wei
  const feeWei = bufferedGasLimit * effectiveGasPrice;

  // Format fee in native token units
  const feeNative = formatUnits(feeWei, config.nativeToken.decimals);

  // USD conversion
  const nativeUsdPrice = getNativeTokenUsdPrice(config.nativeToken.symbol);
  const feeUsd =
    nativeUsdPrice > 0
      ? (parseFloat(feeNative) * nativeUsdPrice).toFixed(6)
      : undefined;

  // Estimated confirmation time: 2 block times
  const estimatedTime = config.avgBlockTime * 2;

  const result: FeeEstimate = {
    chain,
    fee: feeNative,
    gasLimit: bufferedGasLimit,
    gasPrice: effectiveGasPrice,
    estimatedTime,
  };

  if (maxFeePerGas !== undefined) result.maxFeePerGas = maxFeePerGas;
  if (maxPriorityFeePerGas !== undefined) result.maxPriorityFeePerGas = maxPriorityFeePerGas;
  if (feeUsd !== undefined) result.feeUsd = feeUsd;

  return result;
}

// ---------------------------------------------------------------------------
// compareFeesAcrossChains
// ---------------------------------------------------------------------------

export interface CompareFeesParams {
  chains: string[];
  to: string;
  amount: string;
  token?: string;
}

/**
 * Estimate fees across multiple chains and return results sorted cheapest first.
 * Chains that fail estimation are silently omitted.
 */
export async function compareFeesAcrossChains(
  params: CompareFeesParams
): Promise<FeeEstimate[]> {
  const { chains, to, amount, token } = params;

  const results = await Promise.allSettled(
    chains.map((chain) =>
      estimatePaymentFees({ chain, to, amount, token })
    )
  );

  const estimates: FeeEstimate[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      estimates.push(result.value);
    }
    // Silently skip rejected (chain unavailable or unknown)
  }

  // Sort by feeUsd ascending (cheapest first); fall back to fee string comparison
  estimates.sort((a, b) => {
    const aUsd = a.feeUsd ? parseFloat(a.feeUsd) : Infinity;
    const bUsd = b.feeUsd ? parseFloat(b.feeUsd) : Infinity;
    if (aUsd !== bUsd) return aUsd - bUsd;
    return parseFloat(a.fee) - parseFloat(b.fee);
  });

  return estimates;
}
