import {
  createPublicClient,
  http,
  type PublicClient,
  type TransactionReceipt,
  type ReadContractParameters,
} from "viem";
import {
  mainnet,
  base,
  polygon,
  arbitrum,
  optimism,
  sepolia,
  type Chain,
} from "viem/chains";
import { getWorkingRpcUrl } from "./chains.js";

// ---------------------------------------------------------------------------
// CAIP-2 → viem Chain mapping
// ---------------------------------------------------------------------------

const VIEM_CHAIN_MAP: Record<string, Chain> = {
  "eip155:1": mainnet,
  "eip155:8453": base,
  "eip155:137": polygon,
  "eip155:42161": arbitrum,
  "eip155:10": optimism,
  "eip155:11155111": sepolia,
};

/**
 * Map a CAIP-2 chain ID to a viem Chain object.
 * Throws if the chain is unknown.
 */
export function getViemChain(chainId: string): Chain {
  const chain = VIEM_CHAIN_MAP[chainId];
  if (!chain) {
    throw new Error(`Unsupported EVM chain: ${chainId}`);
  }
  return chain;
}

// ---------------------------------------------------------------------------
// PublicClient cache (one client per chain, reused across calls)
// ---------------------------------------------------------------------------

const clientCache = new Map<string, PublicClient>();

/**
 * Return a cached viem PublicClient for the given CAIP-2 chain ID.
 * Creates a new client on first call, then reuses it.
 */
export function getPublicClient(chainId: string): PublicClient {
  const cached = clientCache.get(chainId);
  if (cached) return cached;

  const chain = getViemChain(chainId);
  const rpcUrl = getWorkingRpcUrl(chainId);

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  clientCache.set(chainId, client);
  return client;
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/**
 * Get the native token balance (in wei) for an address.
 */
export async function getBalance(chainId: string, address: `0x${string}`): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getBalance({ address });
}

/**
 * Fetch a transaction receipt. Returns null if the tx is not yet mined.
 */
export async function getTransactionReceipt(
  chainId: string,
  txHash: `0x${string}`
): Promise<TransactionReceipt | null> {
  const client = getPublicClient(chainId);
  try {
    return await client.getTransactionReceipt({ hash: txHash });
  } catch {
    return null;
  }
}

/**
 * Get the latest block number.
 */
export async function getBlockNumber(chainId: string): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getBlockNumber();
}

/**
 * Get the current gas price (in wei).
 */
export async function getGasPrice(chainId: string): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getGasPrice();
}

/**
 * Broadcast a signed raw transaction. Returns the transaction hash.
 */
export async function sendRawTransaction(
  chainId: string,
  serializedTx: `0x${string}`
): Promise<string> {
  const client = getPublicClient(chainId);
  return client.sendRawTransaction({ serializedTransaction: serializedTx });
}

/**
 * Call a read-only contract function.
 */
export async function readContract(
  chainId: string,
  params: ReadContractParameters
): Promise<unknown> {
  const client = getPublicClient(chainId);
  return client.readContract(params);
}

/**
 * Estimate gas for a transaction.
 */
export async function estimateGas(
  chainId: string,
  params: Parameters<PublicClient["estimateGas"]>[0]
): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.estimateGas(params);
}

/**
 * Get EIP-1559 fee data (maxFeePerGas, maxPriorityFeePerGas) plus legacy gasPrice.
 */
export async function getFeeData(chainId: string): Promise<{
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  gasPrice: bigint;
}> {
  const client = getPublicClient(chainId);

  const [gasPrice, feeHistory] = await Promise.all([
    client.getGasPrice(),
    client.getFeeHistory({ blockCount: 1, rewardPercentiles: [50] }).catch(() => null),
  ]);

  if (feeHistory && feeHistory.baseFeePerGas.length > 0) {
    const baseFee = feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 1] ?? 0n;
    const priorityFee =
      feeHistory.reward && feeHistory.reward.length > 0 && feeHistory.reward[0].length > 0
        ? (feeHistory.reward[feeHistory.reward.length - 1][0] ?? 0n)
        : 1_500_000_000n; // 1.5 gwei default
    const maxFeePerGas = baseFee * 2n + priorityFee;
    return { maxFeePerGas, maxPriorityFeePerGas: priorityFee, gasPrice };
  }

  return { maxFeePerGas: null, maxPriorityFeePerGas: null, gasPrice };
}
