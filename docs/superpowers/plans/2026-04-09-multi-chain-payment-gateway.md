# Multi-Chain Payment Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add native EVM + Stellar payment capability to Aegis with a unified PaymentRouter, matching Solana's existing depth.

**Architecture:** Hybrid Chain Adapter pattern — each chain (EVM, Solana, Stellar) implements a `ChainAdapter` interface. A `PaymentRouter` dispatches by CAIP-2 prefix. viem is primary EVM engine, ethers v6 available via facade. OWS `signTransaction` used for all signing.

**Tech Stack:** viem (EVM primary), ethers v6 (EVM compat), @stellar/stellar-sdk (existing), @solana/web3.js (existing), @open-wallet-standard/core (signing)

---

## File Structure

```
packages/integrations/src/payments/
  types.ts                — ChainAdapter interface, PaymentParams, PaymentResult, FeeEstimate, ReceiptData
  router.ts               — PaymentRouter: CAIP-2 prefix → adapter dispatch + auto-chain
  evm/
    chains.ts             — EVM chain configs (RPCs, explorers, gas models, native tokens)
    provider.ts           — viem/ethers facade: createChainClient()
    tokens.ts             — ERC-20 registry per chain + transfer/approve helpers
    gas.ts                — EIP-1559 estimation, L2-aware, USD conversion
    ens.ts                — ENS forward + reverse resolution
    receipt.ts            — Calldata-based receipt anchoring
    contracts.ts          — Generic ABI read/write (EVM-only extension)
    adapter.ts            — EVMAdapter implements ChainAdapter
  solana/
    adapter.ts            — SolanaAdapter wraps existing solana-pay.ts
  stellar/
    payments.ts           — XLM + issued asset transfers
    accounts.ts           — Account existence check + creation
    receipt.ts            — Memo-field receipt anchoring
    adapter.ts            — StellarAdapter implements ChainAdapter

packages/integrations/src/index.ts  — Add payments/ re-exports

packages/gate/src/index.ts          — Multi-chain x402 support
packages/gate/src/evm-pay.ts        — Native EVM payments via viem

dashboard/src/lib/integrations/payments/  — Mirror of packages/integrations/src/payments/
dashboard/src/components/chain-selector.tsx
dashboard/src/components/multi-chain-payment.tsx
dashboard/src/components/fee-comparison-card.tsx
dashboard/src/components/unified-tx-history.tsx

dashboard/src/app/api/payments/send/route.ts
dashboard/src/app/api/payments/estimate/route.ts
dashboard/src/app/api/payments/chains/route.ts

dashboard/src/app/(landing)/docs/evm/page.tsx
dashboard/src/app/(landing)/docs/stellar/page.tsx  — Update with payments
dashboard/src/app/(landing)/docs/page.tsx           — Add multi-chain card
```

---

### Task 1: Add viem dependency + payment types

**Files:**
- Modify: `packages/integrations/package.json`
- Create: `packages/integrations/src/payments/types.ts`

- [ ] **Step 1: Add viem to integrations package**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npm install viem
```

Expected: viem added to dependencies in package.json.

- [ ] **Step 2: Create payment types**

Create `packages/integrations/src/payments/types.ts`:

```typescript
import type { ChainBalance, TxVerification } from "../types.js";

export interface PaymentParams {
  chain: string;              // CAIP-2 chain ID (e.g., "eip155:8453")
  to: string;                 // Recipient address
  amount: string;             // Human-readable amount (e.g., "5.00")
  token?: string;             // Token symbol or contract address; default: native
  memo?: string;              // Optional memo/reference
  budgetCheck?: boolean;      // Check OWS budget limits; default: true
}

export interface PaymentResult {
  txHash: string;
  chain: string;              // CAIP-2 chain ID
  from: string;
  to: string;
  amount: string;
  token: string;
  fee: string;                // Actual fee paid in native token
  feeUsd?: string;
  blockNumber?: number;
  explorerUrl: string;
  status: "pending" | "confirmed" | "failed";
}

export interface FeeEstimate {
  chain: string;
  fee: string;                // In native token
  feeUsd?: string;
  gasLimit?: bigint;          // EVM only
  gasPrice?: bigint;          // EVM legacy
  maxFeePerGas?: bigint;      // EVM EIP-1559
  maxPriorityFeePerGas?: bigint;
  estimatedTime: number;      // Seconds to confirmation
}

export interface ReceiptData {
  paymentTxHash: string;
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  token: string;
  chain: string;
  timestamp: number;
  metadata?: Record<string, string>;
}

export interface ChainConfig {
  chainId: string;            // CAIP-2
  numericChainId: number;     // e.g. 8453 for Base
  name: string;
  nativeToken: { symbol: string; decimals: number };
  rpcUrls: string[];          // Fallback array
  blockExplorer: string;
  gasModel: "legacy" | "eip1559" | "arbitrum" | "optimism";
  avgBlockTime: number;       // Seconds
}

export interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
}

export interface ChainAdapter {
  chainType: "evm" | "solana" | "stellar" | "xrpl";
  supportedChains: string[];

  sendPayment(params: PaymentParams): Promise<PaymentResult>;
  estimateFees(params: PaymentParams): Promise<FeeEstimate>;
  verifyTransaction(txHash: string, chainId: string): Promise<TxVerification>;
  getBalance(address: string, token?: string): Promise<ChainBalance[]>;
  anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string>;
  resolveAddress(nameOrAddress: string, chainId?: string): Promise<string>;
}
```

- [ ] **Step 3: Verify types compile**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/types.ts
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/integrations/package.json packages/integrations/package-lock.json packages/integrations/src/payments/types.ts
git commit -m "feat: add viem dep + payment gateway types (ChainAdapter, PaymentRouter)"
```

---

### Task 2: EVM chain configurations

**Files:**
- Create: `packages/integrations/src/payments/evm/chains.ts`

- [ ] **Step 1: Create EVM chain config registry**

Create `packages/integrations/src/payments/evm/chains.ts`:

```typescript
import type { ChainConfig } from "../types.js";

export const EVM_CHAINS: Record<string, ChainConfig> = {
  "eip155:1": {
    chainId: "eip155:1",
    numericChainId: 1,
    name: "Ethereum",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      process.env.ETHEREUM_RPC_URL ?? "",
      process.env.EVM_RPC_URL ?? "",
      "https://eth.llamarpc.com",
      "https://rpc.ankr.com/eth",
      "https://ethereum-rpc.publicnode.com",
    ].filter(Boolean),
    blockExplorer: "https://etherscan.io",
    gasModel: "eip1559",
    avgBlockTime: 12,
  },
  "eip155:8453": {
    chainId: "eip155:8453",
    numericChainId: 8453,
    name: "Base",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      process.env.BASE_RPC_URL ?? "",
      process.env.EVM_RPC_URL ?? "",
      "https://mainnet.base.org",
      "https://base-rpc.publicnode.com",
    ].filter(Boolean),
    blockExplorer: "https://basescan.org",
    gasModel: "optimism", // Base uses OP Stack
    avgBlockTime: 2,
  },
  "eip155:137": {
    chainId: "eip155:137",
    numericChainId: 137,
    name: "Polygon",
    nativeToken: { symbol: "POL", decimals: 18 },
    rpcUrls: [
      process.env.POLYGON_RPC_URL ?? "",
      process.env.EVM_RPC_URL ?? "",
      "https://polygon-rpc.com",
      "https://rpc.ankr.com/polygon",
    ].filter(Boolean),
    blockExplorer: "https://polygonscan.com",
    gasModel: "eip1559",
    avgBlockTime: 2,
  },
  "eip155:42161": {
    chainId: "eip155:42161",
    numericChainId: 42161,
    name: "Arbitrum One",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      process.env.ARBITRUM_RPC_URL ?? "",
      process.env.EVM_RPC_URL ?? "",
      "https://arb1.arbitrum.io/rpc",
      "https://rpc.ankr.com/arbitrum",
    ].filter(Boolean),
    blockExplorer: "https://arbiscan.io",
    gasModel: "arbitrum",
    avgBlockTime: 0.25,
  },
  "eip155:10": {
    chainId: "eip155:10",
    numericChainId: 10,
    name: "Optimism",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      process.env.OPTIMISM_RPC_URL ?? "",
      process.env.EVM_RPC_URL ?? "",
      "https://mainnet.optimism.io",
      "https://rpc.ankr.com/optimism",
    ].filter(Boolean),
    blockExplorer: "https://optimistic.etherscan.io",
    gasModel: "optimism",
    avgBlockTime: 2,
  },
  "eip155:11155111": {
    chainId: "eip155:11155111",
    numericChainId: 11155111,
    name: "Sepolia",
    nativeToken: { symbol: "ETH", decimals: 18 },
    rpcUrls: [
      process.env.SEPOLIA_RPC_URL ?? "",
      "https://rpc.sepolia.org",
      "https://ethereum-sepolia-rpc.publicnode.com",
    ].filter(Boolean),
    blockExplorer: "https://sepolia.etherscan.io",
    gasModel: "eip1559",
    avgBlockTime: 12,
  },
};

export function getChainConfig(chainId: string): ChainConfig | null {
  return EVM_CHAINS[chainId] ?? null;
}

export function getWorkingRpcUrl(chainId: string): string {
  const config = getChainConfig(chainId);
  if (!config) throw new Error(`Unsupported EVM chain: ${chainId}`);
  if (config.rpcUrls.length === 0) throw new Error(`No RPC URL available for ${chainId}`);
  return config.rpcUrls[0];
}

export function getExplorerTxUrl(chainId: string, txHash: string): string {
  const config = getChainConfig(chainId);
  if (!config) return `https://etherscan.io/tx/${txHash}`;
  return `${config.blockExplorer}/tx/${txHash}`;
}

export function isEvmChain(chainId: string): boolean {
  return chainId.startsWith("eip155:");
}

/** USD price estimates for native tokens — rough, for fee display only */
const NATIVE_USD_PRICES: Record<string, number> = {
  ETH: 3200,
  POL: 0.45,
};

export function getNativeTokenUsdPrice(symbol: string): number {
  return NATIVE_USD_PRICES[symbol] ?? 0;
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/chains.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/chains.ts
git commit -m "feat: add EVM chain configs (Ethereum, Base, Polygon, Arbitrum, Optimism, Sepolia)"
```

---

### Task 3: viem/ethers provider facade

**Files:**
- Create: `packages/integrations/src/payments/evm/provider.ts`

- [ ] **Step 1: Create the provider facade**

Create `packages/integrations/src/payments/evm/provider.ts`:

```typescript
import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient, type Chain, type TransactionReceipt } from "viem";
import { mainnet, base, polygon, arbitrum, optimism, sepolia } from "viem/chains";
import { getWorkingRpcUrl } from "./chains.js";

// Map CAIP-2 to viem chain objects
const VIEM_CHAINS: Record<string, Chain> = {
  "eip155:1": mainnet,
  "eip155:8453": base,
  "eip155:137": polygon,
  "eip155:42161": arbitrum,
  "eip155:10": optimism,
  "eip155:11155111": sepolia,
};

// Cache clients per chain to avoid re-creation
const clientCache = new Map<string, PublicClient>();

export function getViemChain(chainId: string): Chain {
  const chain = VIEM_CHAINS[chainId];
  if (!chain) throw new Error(`No viem chain config for ${chainId}`);
  return chain;
}

export function getPublicClient(chainId: string): PublicClient {
  const cached = clientCache.get(chainId);
  if (cached) return cached;

  const rpcUrl = getWorkingRpcUrl(chainId);
  const chain = getViemChain(chainId);

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  clientCache.set(chainId, client);
  return client;
}

export async function getBalance(chainId: string, address: string): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getBalance({ address: address as `0x${string}` });
}

export async function getTransactionReceipt(chainId: string, txHash: string): Promise<TransactionReceipt | null> {
  const client = getPublicClient(chainId);
  try {
    return await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
  } catch {
    return null;
  }
}

export async function getBlockNumber(chainId: string): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getBlockNumber();
}

export async function getGasPrice(chainId: string): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getGasPrice();
}

/**
 * Send a raw signed transaction and return the tx hash.
 */
export async function sendRawTransaction(chainId: string, serializedTx: `0x${string}`): Promise<string> {
  const client = getPublicClient(chainId);
  return client.sendRawTransaction({ serializedTransaction: serializedTx });
}

/**
 * Read a contract (view/pure function).
 */
export async function readContract(chainId: string, params: {
  address: string;
  abi: readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
}): Promise<unknown> {
  const client = getPublicClient(chainId);
  return client.readContract({
    address: params.address as `0x${string}`,
    abi: params.abi as any,
    functionName: params.functionName,
    args: params.args as any,
  });
}

/**
 * Estimate gas for a transaction.
 */
export async function estimateGas(chainId: string, params: {
  from: string;
  to: string;
  value?: bigint;
  data?: string;
}): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.estimateGas({
    account: params.from as `0x${string}`,
    to: params.to as `0x${string}`,
    value: params.value,
    data: params.data as `0x${string}` | undefined,
  });
}

/**
 * Get EIP-1559 fee data (maxFeePerGas, maxPriorityFeePerGas).
 */
export async function getFeeData(chainId: string): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice: bigint;
}> {
  const client = getPublicClient(chainId);
  const [gasPrice, block] = await Promise.all([
    client.getGasPrice(),
    client.getBlock(),
  ]);

  const baseFee = block.baseFeePerGas ?? gasPrice;
  const maxPriorityFeePerGas = gasPrice > baseFee ? gasPrice - baseFee : BigInt(1_500_000_000); // 1.5 gwei default

  return {
    maxFeePerGas: baseFee * BigInt(2) + maxPriorityFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
  };
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/provider.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/provider.ts
git commit -m "feat: add viem provider facade with caching, fee data, contract reads"
```

---

### Task 4: ERC-20 token registry + transfer helpers

**Files:**
- Create: `packages/integrations/src/payments/evm/tokens.ts`

- [ ] **Step 1: Create token registry and ERC-20 helpers**

Create `packages/integrations/src/payments/evm/tokens.ts`:

```typescript
import type { TokenInfo } from "../types.js";
import { readContract, estimateGas } from "./provider.js";

// Minimal ERC-20 ABI for transfers and approvals
export const ERC20_ABI = [
  { type: "function", name: "transfer", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
] as const;

/**
 * Known token addresses per chain.
 * Key: CAIP-2 chainId → symbol → TokenInfo
 */
export const TOKEN_REGISTRY: Record<string, Record<string, TokenInfo>> = {
  "eip155:1": {
    USDC: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, symbol: "USDC" },
    USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, symbol: "USDT" },
    DAI:  { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18, symbol: "DAI" },
    WETH: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, symbol: "WETH" },
  },
  "eip155:8453": {
    USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, symbol: "USDC" },
    DAI:  { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, symbol: "DAI" },
    WETH: { address: "0x4200000000000000000000000000000000000006", decimals: 18, symbol: "WETH" },
  },
  "eip155:137": {
    USDC: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, symbol: "USDC" },
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, symbol: "USDT" },
    DAI:  { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18, symbol: "DAI" },
    WETH: { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, symbol: "WETH" },
  },
  "eip155:42161": {
    USDC: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, symbol: "USDC" },
    USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, symbol: "USDT" },
    DAI:  { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, symbol: "DAI" },
    WETH: { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18, symbol: "WETH" },
  },
  "eip155:10": {
    USDC: { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6, symbol: "USDC" },
    USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6, symbol: "USDT" },
    DAI:  { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, symbol: "DAI" },
    WETH: { address: "0x4200000000000000000000000000000000000006", decimals: 18, symbol: "WETH" },
  },
};

/**
 * Look up a token by symbol or contract address on a given chain.
 */
export function resolveToken(chainId: string, tokenOrAddress: string): TokenInfo | null {
  const chainTokens = TOKEN_REGISTRY[chainId];
  if (!chainTokens) return null;

  // Check by symbol (case-insensitive)
  const upper = tokenOrAddress.toUpperCase();
  if (chainTokens[upper]) return chainTokens[upper];

  // Check by address
  const byAddress = Object.values(chainTokens).find(
    (t) => t.address.toLowerCase() === tokenOrAddress.toLowerCase()
  );
  return byAddress ?? null;
}

/**
 * Check ERC-20 balance of an address.
 */
export async function getTokenBalance(chainId: string, tokenAddress: string, ownerAddress: string): Promise<bigint> {
  return readContract(chainId, {
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [ownerAddress],
  }) as Promise<bigint>;
}

/**
 * Encode an ERC-20 transfer calldata.
 */
export function encodeTransferData(to: string, amount: bigint): string {
  const { encodeFunctionData } = require("viem") as typeof import("viem");
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to as `0x${string}`, amount],
  });
}

/**
 * Parse a human-readable amount (e.g. "5.00") to raw token units.
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const { parseUnits } = require("viem") as typeof import("viem");
  return parseUnits(amount, decimals);
}

/**
 * Format raw token units to human-readable string.
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const { formatUnits } = require("viem") as typeof import("viem");
  return formatUnits(amount, decimals);
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/tokens.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/tokens.ts
git commit -m "feat: add ERC-20 token registry (6 chains) + transfer/balance helpers"
```

---

### Task 5: Gas estimation

**Files:**
- Create: `packages/integrations/src/payments/evm/gas.ts`

- [ ] **Step 1: Create gas estimation module**

Create `packages/integrations/src/payments/evm/gas.ts`:

```typescript
import type { FeeEstimate } from "../types.js";
import { getChainConfig, getNativeTokenUsdPrice } from "./chains.js";
import { getFeeData, estimateGas as estimateGasRpc } from "./provider.js";
import { resolveToken, encodeTransferData, parseTokenAmount } from "./tokens.js";
import { formatUnits } from "viem";

// Gas limits by transaction type
const GAS_LIMITS = {
  nativeTransfer: BigInt(21_000),
  erc20Transfer: BigInt(65_000),
  erc20Approve: BigInt(46_000),
  contractCall: BigInt(200_000),
  receiptAnchor: BigInt(25_000), // 0-value self-transfer with calldata
};

// Gas buffer multipliers per gas model
const GAS_BUFFERS: Record<string, number> = {
  legacy: 1.2,
  eip1559: 1.15,
  arbitrum: 1.3,  // Arbitrum has L1 data posting fees
  optimism: 1.2,  // OP Stack L1 data fees
};

export async function estimatePaymentFees(params: {
  chain: string;
  to: string;
  amount: string;
  token?: string;
  from?: string;
}): Promise<FeeEstimate> {
  const config = getChainConfig(params.chain);
  if (!config) throw new Error(`Unsupported chain: ${params.chain}`);

  const feeData = await getFeeData(params.chain);
  const isTokenTransfer = params.token && params.token.toUpperCase() !== config.nativeToken.symbol;

  let gasLimit: bigint;

  if (isTokenTransfer) {
    // Try to estimate gas via RPC if we have a from address
    if (params.from) {
      const tokenInfo = resolveToken(params.chain, params.token!);
      if (tokenInfo) {
        try {
          const rawAmount = parseTokenAmount(params.amount, tokenInfo.decimals);
          const calldata = encodeTransferData(params.to, rawAmount);
          gasLimit = await estimateGasRpc(params.chain, {
            from: params.from,
            to: tokenInfo.address,
            data: calldata,
          });
        } catch {
          gasLimit = GAS_LIMITS.erc20Transfer;
        }
      } else {
        gasLimit = GAS_LIMITS.erc20Transfer;
      }
    } else {
      gasLimit = GAS_LIMITS.erc20Transfer;
    }
  } else {
    gasLimit = GAS_LIMITS.nativeTransfer;
  }

  // Apply chain-specific buffer
  const buffer = GAS_BUFFERS[config.gasModel] ?? 1.2;
  const bufferedGas = BigInt(Math.ceil(Number(gasLimit) * buffer));

  // Calculate fee in native token
  const feeWei = bufferedGas * feeData.maxFeePerGas;
  const feeNative = formatUnits(feeWei, config.nativeToken.decimals);

  // Convert to USD
  const nativePrice = getNativeTokenUsdPrice(config.nativeToken.symbol);
  const feeUsd = (parseFloat(feeNative) * nativePrice).toFixed(4);

  return {
    chain: params.chain,
    fee: feeNative,
    feeUsd,
    gasLimit: bufferedGas,
    gasPrice: feeData.gasPrice,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    estimatedTime: config.avgBlockTime * 2, // ~2 blocks for confirmation
  };
}

/**
 * Compare fees across multiple chains for the same payment.
 * Returns sorted by cost (cheapest first).
 */
export async function compareFeesAcrossChains(params: {
  chains: string[];
  to: string;
  amount: string;
  token?: string;
}): Promise<FeeEstimate[]> {
  const estimates = await Promise.allSettled(
    params.chains.map((chain) =>
      estimatePaymentFees({ chain, to: params.to, amount: params.amount, token: params.token })
    )
  );

  return estimates
    .filter((r): r is PromiseFulfilledResult<FeeEstimate> => r.status === "fulfilled")
    .map((r) => r.value)
    .sort((a, b) => parseFloat(a.feeUsd ?? "0") - parseFloat(b.feeUsd ?? "0"));
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/gas.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/gas.ts
git commit -m "feat: add EVM gas estimation with L2-aware models + cross-chain fee comparison"
```

---

### Task 6: ENS resolution

**Files:**
- Create: `packages/integrations/src/payments/evm/ens.ts`

- [ ] **Step 1: Create ENS resolver**

Create `packages/integrations/src/payments/evm/ens.ts`:

```typescript
import { getPublicClient } from "./provider.js";
import { normalize } from "viem/ens";

/**
 * Resolve an ENS name to an address.
 * Requires Ethereum mainnet RPC.
 * Returns null if resolution fails or no ENS name.
 */
export async function resolveENS(name: string): Promise<string | null> {
  if (!name.endsWith(".eth") && !name.includes(".")) return null;

  try {
    const client = getPublicClient("eip155:1");
    const address = await client.getEnsAddress({ name: normalize(name) });
    return address ?? null;
  } catch {
    return null;
  }
}

/**
 * Reverse resolve an address to an ENS name.
 * Returns null if no reverse record exists.
 */
export async function reverseResolveENS(address: string): Promise<string | null> {
  try {
    const client = getPublicClient("eip155:1");
    const name = await client.getEnsName({ address: address as `0x${string}` });
    return name ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve an address — if it's an ENS name, resolve it; otherwise return as-is.
 */
export async function resolveAddressOrENS(nameOrAddress: string): Promise<string> {
  if (nameOrAddress.startsWith("0x") && nameOrAddress.length === 42) {
    return nameOrAddress;
  }
  const resolved = await resolveENS(nameOrAddress);
  if (!resolved) throw new Error(`Could not resolve ENS name: ${nameOrAddress}`);
  return resolved;
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/ens.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/ens.ts
git commit -m "feat: add ENS forward + reverse resolution via viem"
```

---

### Task 7: EVM receipt anchoring

**Files:**
- Create: `packages/integrations/src/payments/evm/receipt.ts`

- [ ] **Step 1: Create EVM receipt anchoring**

Create `packages/integrations/src/payments/evm/receipt.ts`:

```typescript
import { createHash } from "node:crypto";
import type { ReceiptData } from "../types.js";
import { getExplorerTxUrl } from "./chains.js";

/**
 * Hash receipt data for on-chain anchoring.
 * Uses SHA-256 of the JSON-serialized receipt.
 */
export function hashReceipt(receipt: ReceiptData): string {
  return createHash("sha256").update(JSON.stringify(receipt)).digest("hex");
}

/**
 * Encode receipt hash as calldata for a 0-value self-transfer.
 * Format: "AEGIS_RECEIPT:<sha256hash>"
 * This is the cheapest way to anchor data on EVM (~25k gas on L2s).
 */
export function encodeReceiptCalldata(receipt: ReceiptData): `0x${string}` {
  const hash = hashReceipt(receipt);
  const memo = `AEGIS_RECEIPT:${hash}`;
  const hex = Buffer.from(memo, "utf-8").toString("hex");
  return `0x${hex}` as `0x${string}`;
}

/**
 * Build a 0-value self-transfer transaction with receipt calldata.
 * The caller is responsible for signing and sending.
 */
export function buildReceiptAnchorTx(params: {
  from: string;
  receipt: ReceiptData;
  chainId: string;
}): {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
} {
  return {
    to: params.from as `0x${string}`,
    value: BigInt(0),
    data: encodeReceiptCalldata(params.receipt),
  };
}

/**
 * Decode receipt hash from on-chain calldata.
 * Returns the hash if valid AEGIS_RECEIPT format, null otherwise.
 */
export function decodeReceiptCalldata(data: string): string | null {
  try {
    const hex = data.startsWith("0x") ? data.slice(2) : data;
    const decoded = Buffer.from(hex, "hex").toString("utf-8");
    if (decoded.startsWith("AEGIS_RECEIPT:")) {
      return decoded.slice("AEGIS_RECEIPT:".length);
    }
    return null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/receipt.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/receipt.ts
git commit -m "feat: add EVM receipt anchoring via calldata (0-value self-transfer)"
```

---

### Task 8: Generic contract interactions (EVM extension)

**Files:**
- Create: `packages/integrations/src/payments/evm/contracts.ts`

- [ ] **Step 1: Create contract interaction module**

Create `packages/integrations/src/payments/evm/contracts.ts`:

```typescript
import { readContract as viemReadContract } from "./provider.js";
import { encodeFunctionData } from "viem";

export interface ContractReadParams {
  chain: string;
  address: string;
  abi: readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
}

export interface ContractWriteParams extends ContractReadParams {
  value?: bigint;
}

/**
 * Read from a contract (view/pure function). No signing needed.
 */
export async function contractRead(params: ContractReadParams): Promise<unknown> {
  return viemReadContract(params.chain, {
    address: params.address,
    abi: params.abi,
    functionName: params.functionName,
    args: params.args,
  });
}

/**
 * Encode a contract write call into transaction data.
 * The caller is responsible for signing and sending.
 */
export function encodeContractWrite(params: ContractWriteParams): {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
} {
  const data = encodeFunctionData({
    abi: params.abi as any,
    functionName: params.functionName,
    args: params.args as any,
  });

  return {
    to: params.address as `0x${string}`,
    data,
    value: params.value ?? BigInt(0),
  };
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/contracts.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/contracts.ts
git commit -m "feat: add generic EVM contract read/write helpers"
```

---

### Task 9: EVM adapter (implements ChainAdapter)

**Files:**
- Create: `packages/integrations/src/payments/evm/adapter.ts`

- [ ] **Step 1: Create EVMAdapter**

Create `packages/integrations/src/payments/evm/adapter.ts`:

```typescript
import { type ChainAdapter, type PaymentParams, type PaymentResult, type FeeEstimate, type ReceiptData } from "../types.js";
import type { ChainBalance, TxVerification } from "../../types.js";
import { getChainConfig, getExplorerTxUrl, isEvmChain, EVM_CHAINS } from "./chains.js";
import { getPublicClient, getBalance as getNativeBalance, getTransactionReceipt, sendRawTransaction } from "./provider.js";
import { resolveToken, getTokenBalance, parseTokenAmount, formatTokenAmount, encodeTransferData } from "./tokens.js";
import { estimatePaymentFees } from "./gas.js";
import { resolveAddressOrENS } from "./ens.js";
import { buildReceiptAnchorTx, encodeReceiptCalldata } from "./receipt.js";
import { signTransaction } from "@open-wallet-standard/core";
import { formatUnits, serializeTransaction, type TransactionSerializable } from "viem";

export class EVMAdapter implements ChainAdapter {
  chainType = "evm" as const;
  supportedChains = Object.keys(EVM_CHAINS);

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    if (!isEvmChain(params.chain)) {
      throw new Error(`EVMAdapter does not support chain: ${params.chain}`);
    }

    const config = getChainConfig(params.chain);
    if (!config) throw new Error(`Unknown EVM chain: ${params.chain}`);

    // Resolve ENS if needed
    const to = await resolveAddressOrENS(params.to);

    const client = getPublicClient(params.chain);
    const isNative = !params.token || params.token.toUpperCase() === config.nativeToken.symbol;

    let txData: `0x${string}` | undefined;
    let value: bigint;
    let txTo: string;

    if (isNative) {
      // Native token transfer
      value = parseTokenAmount(params.amount, config.nativeToken.decimals);
      txTo = to;
    } else {
      // ERC-20 transfer
      const tokenInfo = resolveToken(params.chain, params.token!);
      if (!tokenInfo) throw new Error(`Unknown token ${params.token} on ${params.chain}`);

      const rawAmount = parseTokenAmount(params.amount, tokenInfo.decimals);
      txData = encodeTransferData(to, rawAmount) as `0x${string}`;
      value = BigInt(0);
      txTo = tokenInfo.address;
    }

    // Get fee data and nonce
    const [feeData, nonce] = await Promise.all([
      client.estimateFeesPerGas(),
      client.getTransactionCount({ address: params.to as `0x${string}` }), // placeholder — from address comes from OWS
    ]);

    // Build unsigned transaction
    const tx: TransactionSerializable = {
      to: txTo as `0x${string}`,
      value,
      data: txData,
      chainId: config.numericChainId,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      type: "eip1559",
    };

    // Serialize for signing
    const serialized = serializeTransaction(tx);
    const serializedHex = serialized.slice(2); // remove 0x prefix for OWS

    // Sign via OWS
    const signResult = signTransaction("default", "evm", serializedHex);
    const signedTx = `0x${signResult.signature}` as `0x${string}`;

    // Broadcast
    const txHash = await sendRawTransaction(params.chain, signedTx);

    // Build explorer URL
    const explorerUrl = getExplorerTxUrl(params.chain, txHash);

    return {
      txHash,
      chain: params.chain,
      from: "self", // OWS wallet
      to: params.to,
      amount: params.amount,
      token: isNative ? config.nativeToken.symbol : (params.token ?? config.nativeToken.symbol),
      fee: "0", // Will be filled after confirmation
      explorerUrl,
      status: "pending",
    };
  }

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    return estimatePaymentFees({
      chain: params.chain,
      to: params.to,
      amount: params.amount,
      token: params.token,
    });
  }

  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    const receipt = await getTransactionReceipt(chainId, txHash);
    if (!receipt) {
      return { txHash, chain: chainId, status: "not_found", source: "evm-rpc" };
    }

    return {
      txHash,
      chain: chainId,
      status: receipt.status === "success" ? "confirmed" : "error",
      blockNumber: Number(receipt.blockNumber),
      source: "evm-rpc",
    };
  }

  async getBalance(address: string, token?: string): Promise<ChainBalance[]> {
    const balances: ChainBalance[] = [];

    for (const [chainId, config] of Object.entries(EVM_CHAINS)) {
      // Skip testnet by default
      if (chainId === "eip155:11155111") continue;

      try {
        if (!token || token.toUpperCase() === config.nativeToken.symbol) {
          const raw = await getNativeBalance(chainId, address);
          const formatted = formatUnits(raw, config.nativeToken.decimals);
          if (parseFloat(formatted) > 0) {
            balances.push({
              chain: config.name,
              chainId,
              token: config.nativeToken.symbol,
              balance: formatted,
              usdValue: "0", // Would need price feed
              source: "evm-rpc",
            });
          }
        }

        if (token) {
          const tokenInfo = resolveToken(chainId, token);
          if (tokenInfo) {
            const raw = await getTokenBalance(chainId, tokenInfo.address, address);
            const formatted = formatTokenAmount(raw, tokenInfo.decimals);
            if (parseFloat(formatted) > 0) {
              balances.push({
                chain: config.name,
                chainId,
                token: tokenInfo.symbol,
                balance: formatted,
                usdValue: tokenInfo.symbol === "USDC" || tokenInfo.symbol === "USDT" ? formatted : "0",
                source: "evm-rpc",
              });
            }
          }
        }
      } catch {
        // Best-effort per chain
      }
    }

    return balances;
  }

  async anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string> {
    const tx = buildReceiptAnchorTx({ from: "self", receipt, chainId });

    // Sign and send the anchor transaction
    const config = getChainConfig(chainId);
    if (!config) throw new Error(`Unknown chain: ${chainId}`);

    const fullTx: TransactionSerializable = {
      to: tx.to,
      value: tx.value,
      data: tx.data,
      chainId: config.numericChainId,
      type: "eip1559",
    };

    const serialized = serializeTransaction(fullTx);
    const signResult = signTransaction("default", "evm", serialized.slice(2));
    const signedTx = `0x${signResult.signature}` as `0x${string}`;

    return sendRawTransaction(chainId, signedTx);
  }

  async resolveAddress(nameOrAddress: string): Promise<string> {
    return resolveAddressOrENS(nameOrAddress);
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/evm/adapter.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/evm/adapter.ts
git commit -m "feat: add EVMAdapter — full ChainAdapter for all EVM chains"
```

---

### Task 10: Stellar payments + accounts + receipt anchoring

**Files:**
- Create: `packages/integrations/src/payments/stellar/payments.ts`
- Create: `packages/integrations/src/payments/stellar/accounts.ts`
- Create: `packages/integrations/src/payments/stellar/receipt.ts`

- [ ] **Step 1: Create Stellar payment module**

Create `packages/integrations/src/payments/stellar/payments.ts`:

```typescript
import * as StellarSdk from "@stellar/stellar-sdk";
import { signTransaction } from "@open-wallet-standard/core";
import type { PaymentResult } from "../types.js";
import { ensureAccountExists } from "./accounts.js";

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";

// Known issued assets on Stellar
export const STELLAR_ASSETS: Record<string, { code: string; issuer: string }> = {
  USDC: {
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", // Circle
  },
};

function getHorizonUrl(chainId: string): string {
  return chainId.includes("testnet") ? HORIZON_TESTNET : HORIZON_MAINNET;
}

function getStellarNetwork(chainId: string): string {
  return chainId.includes("testnet")
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC;
}

export async function sendStellarPayment(params: {
  chainId: string;
  from: string;          // Stellar public key
  to: string;
  amount: string;
  asset?: string;        // "XLM" (default) or "USDC"
  memo?: string;
  walletName?: string;   // OWS wallet name for signing
}): Promise<PaymentResult> {
  const horizonUrl = getHorizonUrl(params.chainId);
  const networkPassphrase = getStellarNetwork(params.chainId);
  const server = new StellarSdk.Horizon.Server(horizonUrl);

  // Ensure destination account exists (create if needed)
  await ensureAccountExists(params.to, params.chainId);

  // Load source account
  const sourceAccount = await server.loadAccount(params.from);

  // Determine asset
  let asset: StellarSdk.Asset;
  if (!params.asset || params.asset.toUpperCase() === "XLM") {
    asset = StellarSdk.Asset.native();
  } else {
    const known = STELLAR_ASSETS[params.asset.toUpperCase()];
    if (known) {
      asset = new StellarSdk.Asset(known.code, known.issuer);
    } else {
      throw new Error(`Unknown Stellar asset: ${params.asset}`);
    }
  }

  // Build transaction
  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  });

  builder.addOperation(
    StellarSdk.Operation.payment({
      destination: params.to,
      asset,
      amount: params.amount,
    })
  );

  if (params.memo) {
    builder.addMemo(StellarSdk.Memo.text(params.memo.slice(0, 28))); // Max 28 bytes for text memo
  }

  builder.setTimeout(180); // 3 minutes
  const tx = builder.build();

  // Sign via OWS
  const txXdr = tx.toXDR();
  const signResult = signTransaction(
    params.walletName ?? "default",
    "stellar",
    Buffer.from(txXdr).toString("hex")
  );

  // Apply signature
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(txXdr, networkPassphrase) as StellarSdk.Transaction;
  signedTx.addSignature(params.from, signResult.signature);

  // Submit
  const result = await server.submitTransaction(signedTx);
  const txHash = result.hash;

  const explorerBase = params.chainId.includes("testnet")
    ? "https://stellar.expert/explorer/testnet"
    : "https://stellar.expert/explorer/public";

  return {
    txHash,
    chain: params.chainId,
    from: params.from,
    to: params.to,
    amount: params.amount,
    token: params.asset ?? "XLM",
    fee: StellarSdk.BASE_FEE,
    explorerUrl: `${explorerBase}/tx/${txHash}`,
    status: "confirmed",
  };
}
```

- [ ] **Step 2: Create Stellar accounts module**

Create `packages/integrations/src/payments/stellar/accounts.ts`:

```typescript
import * as StellarSdk from "@stellar/stellar-sdk";

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";

function getHorizonUrl(chainId: string): string {
  return chainId.includes("testnet") ? HORIZON_TESTNET : HORIZON_MAINNET;
}

/**
 * Check if a Stellar account exists.
 */
export async function accountExists(accountId: string, chainId: string): Promise<boolean> {
  const horizonUrl = getHorizonUrl(chainId);
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  try {
    await server.loadAccount(accountId);
    return true;
  } catch (err) {
    if ((err as any)?.response?.status === 404) return false;
    throw err;
  }
}

/**
 * Ensure a Stellar account exists.
 * On testnet, uses friendbot. On mainnet, throws if account doesn't exist
 * (caller must create it via a createAccount operation).
 */
export async function ensureAccountExists(accountId: string, chainId: string): Promise<void> {
  const exists = await accountExists(accountId, chainId);
  if (exists) return;

  if (chainId.includes("testnet")) {
    // Fund via friendbot
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(accountId)}`);
    if (!response.ok) {
      throw new Error(`Failed to fund testnet account: ${response.statusText}`);
    }
    return;
  }

  throw new Error(
    `Stellar account ${accountId} does not exist on mainnet. ` +
    `Send at least 1 XLM via a createAccount operation to activate it.`
  );
}

/**
 * Get the minimum balance required for a Stellar account.
 * Base reserve (1 XLM) + 0.5 XLM per subentry (trustlines, offers, etc.)
 */
export function getMinimumBalance(subentryCount: number = 0): string {
  const baseReserve = 1;
  const perSubentry = 0.5;
  return (baseReserve + subentryCount * perSubentry).toFixed(7);
}
```

- [ ] **Step 3: Create Stellar receipt anchoring**

Create `packages/integrations/src/payments/stellar/receipt.ts`:

```typescript
import * as StellarSdk from "@stellar/stellar-sdk";
import { createHash } from "node:crypto";
import { signTransaction } from "@open-wallet-standard/core";
import type { ReceiptData } from "../types.js";

/**
 * Anchor a receipt hash on Stellar using the memo field.
 * Uses MEMO_HASH (32 bytes) for the SHA-256 of the receipt.
 * This costs only the standard Stellar fee (0.00001 XLM).
 */
export async function anchorReceiptStellar(params: {
  receipt: ReceiptData;
  from: string;
  chainId: string;
  walletName?: string;
}): Promise<string> {
  const horizonUrl = params.chainId.includes("testnet")
    ? "https://horizon-testnet.stellar.org"
    : "https://horizon.stellar.org";
  const networkPassphrase = params.chainId.includes("testnet")
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC;

  const server = new StellarSdk.Horizon.Server(horizonUrl);
  const sourceAccount = await server.loadAccount(params.from);

  // Hash receipt to 32 bytes for MEMO_HASH
  const hash = createHash("sha256").update(JSON.stringify(params.receipt)).digest();

  // Build a minimum payment to self with receipt hash as memo
  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: params.from,
        asset: StellarSdk.Asset.native(),
        amount: "0.0000001", // Minimum possible amount
      })
    )
    .addMemo(StellarSdk.Memo.hash(hash))
    .setTimeout(180)
    .build();

  // Sign via OWS
  const txXdr = tx.toXDR();
  const signResult = signTransaction(
    params.walletName ?? "default",
    "stellar",
    Buffer.from(txXdr).toString("hex")
  );

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(txXdr, networkPassphrase) as StellarSdk.Transaction;
  signedTx.addSignature(params.from, signResult.signature);

  const result = await server.submitTransaction(signedTx);
  return result.hash;
}
```

- [ ] **Step 4: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/stellar/payments.ts src/payments/stellar/accounts.ts src/payments/stellar/receipt.ts
```

- [ ] **Step 5: Commit**

```bash
git add packages/integrations/src/payments/stellar/
git commit -m "feat: add Stellar payments (XLM + USDC), account creation, receipt anchoring"
```

---

### Task 11: Stellar adapter

**Files:**
- Create: `packages/integrations/src/payments/stellar/adapter.ts`

- [ ] **Step 1: Create StellarAdapter**

Create `packages/integrations/src/payments/stellar/adapter.ts`:

```typescript
import type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData } from "../types.js";
import type { ChainBalance, TxVerification } from "../../types.js";
import { sendStellarPayment } from "./payments.js";
import { anchorReceiptStellar } from "./receipt.js";
import { getStellarBalances, verifyStellarTransaction } from "../../stellar.js";
import * as StellarSdk from "@stellar/stellar-sdk";

export class StellarAdapter implements ChainAdapter {
  chainType = "stellar" as const;
  supportedChains = ["stellar:pubnet", "stellar:testnet"];

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    return sendStellarPayment({
      chainId: params.chain,
      from: "self", // Resolved from OWS wallet
      to: params.to,
      amount: params.amount,
      asset: params.token,
      memo: params.memo,
    });
  }

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    // Stellar fees are fixed and negligible
    return {
      chain: params.chain,
      fee: "0.00001",        // Base fee in XLM
      feeUsd: "0.0000012",  // ~$0.12 per XLM
      estimatedTime: 5,      // ~5 seconds for Stellar consensus
    };
  }

  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    const isTestnet = chainId.includes("testnet");
    return verifyStellarTransaction(txHash, isTestnet);
  }

  async getBalance(address: string, token?: string): Promise<ChainBalance[]> {
    // Query both testnet and pubnet, return whichever has balances
    const results: ChainBalance[] = [];
    try {
      const pubnet = await getStellarBalances(address, false);
      results.push(...pubnet);
    } catch {}
    try {
      const testnet = await getStellarBalances(address, true);
      results.push(...testnet);
    } catch {}
    return results;
  }

  async anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string> {
    return anchorReceiptStellar({
      receipt,
      from: "self",
      chainId,
    });
  }

  async resolveAddress(nameOrAddress: string): Promise<string> {
    // Stellar Federation protocol
    if (nameOrAddress.includes("*")) {
      try {
        const [, domain] = nameOrAddress.split("*");
        const response = await fetch(
          `https://${domain}/.well-known/stellar.toml`
        );
        if (response.ok) {
          const toml = await response.text();
          const federationMatch = toml.match(/FEDERATION_SERVER\s*=\s*"(.+?)"/);
          if (federationMatch) {
            const fedResponse = await fetch(
              `${federationMatch[1]}?q=${encodeURIComponent(nameOrAddress)}&type=name`
            );
            if (fedResponse.ok) {
              const data = await fedResponse.json() as { account_id?: string };
              if (data.account_id) return data.account_id;
            }
          }
        }
      } catch {}
    }
    return nameOrAddress;
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/stellar/adapter.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/stellar/adapter.ts
git commit -m "feat: add StellarAdapter with payments, balances, federation, receipt anchoring"
```

---

### Task 12: Solana adapter (wraps existing code)

**Files:**
- Create: `packages/integrations/src/payments/solana/adapter.ts`

- [ ] **Step 1: Create SolanaAdapter wrapper**

Create `packages/integrations/src/payments/solana/adapter.ts`:

```typescript
import type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData } from "../types.js";
import type { ChainBalance, TxVerification } from "../../types.js";
import { getSolanaBalances } from "../../solana.js";

/**
 * SolanaAdapter wraps existing solana-pay.ts and receipt-anchor.ts from gate package.
 * Balance queries use the integrations package directly.
 * Payment and anchoring delegate to gate (which has OWS signing).
 */
export class SolanaAdapter implements ChainAdapter {
  chainType = "solana" as const;
  supportedChains = ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", "solana:devnet"];

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    // Delegate to gate's sendSolPayment — imported dynamically to avoid circular deps
    const { sendSolPayment } = await import("@aegis-ows/gate");
    const txHash = await sendSolPayment("default", params.to, parseFloat(params.amount));

    if (!txHash) throw new Error("Solana payment failed");

    const network = params.chain.includes("devnet") ? "devnet" : "mainnet-beta";
    return {
      txHash,
      chain: params.chain,
      from: "self",
      to: params.to,
      amount: params.amount,
      token: params.token ?? "SOL",
      fee: "0.000005", // ~5000 lamports
      explorerUrl: `https://solscan.io/tx/${txHash}?cluster=${network}`,
      status: "confirmed",
    };
  }

  async estimateFees(_params: PaymentParams): Promise<FeeEstimate> {
    return {
      chain: _params.chain,
      fee: "0.000005",     // ~5000 lamports
      feeUsd: "0.0009",   // ~$180 per SOL
      estimatedTime: 0.4,  // Solana slot time
    };
  }

  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    const { verifySettlement } = await import("@aegis-ows/gate");
    const result = await verifySettlement(txHash, chainId);
    return {
      txHash,
      chain: chainId,
      status: result === true ? "confirmed" : result === false ? "not_found" : "error",
      source: "solana-rpc",
    };
  }

  async getBalance(address: string): Promise<ChainBalance[]> {
    return getSolanaBalances(address);
  }

  async anchorReceipt(receipt: ReceiptData): Promise<string> {
    const { createHash } = await import("node:crypto");
    const hash = createHash("sha256").update(JSON.stringify(receipt)).digest("hex");
    const { anchorReceiptOnChain } = await import("@aegis-ows/gate");
    const txHash = await anchorReceiptOnChain("default", hash);
    if (!txHash) throw new Error("Solana receipt anchoring failed");
    return txHash;
  }

  async resolveAddress(nameOrAddress: string): Promise<string> {
    // Solana doesn't have a standard name service in this context
    return nameOrAddress;
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/solana/adapter.ts
```

Note: This may show import errors for `@aegis-ows/gate` since it's a sibling package. The dynamic imports will resolve at runtime.

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/solana/adapter.ts
git commit -m "feat: add SolanaAdapter wrapping existing solana-pay.ts + receipt-anchor.ts"
```

---

### Task 13: Payment Router

**Files:**
- Create: `packages/integrations/src/payments/router.ts`

- [ ] **Step 1: Create PaymentRouter**

Create `packages/integrations/src/payments/router.ts`:

```typescript
import type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData } from "./types.js";
import type { ChainBalance, TxVerification } from "../types.js";
import { EVMAdapter } from "./evm/adapter.js";
import { StellarAdapter } from "./stellar/adapter.js";
import { SolanaAdapter } from "./solana/adapter.js";

export class PaymentRouter {
  private adapters = new Map<string, ChainAdapter>();

  constructor() {
    this.register("eip155", new EVMAdapter());
    this.register("stellar", new StellarAdapter());
    this.register("solana", new SolanaAdapter());
  }

  register(prefix: string, adapter: ChainAdapter): void {
    this.adapters.set(prefix, adapter);
  }

  private getAdapter(chainId: string): ChainAdapter {
    const prefix = chainId.split(":")[0];
    const adapter = this.adapters.get(prefix);
    if (!adapter) {
      throw new Error(
        `No adapter for chain ${chainId}. Supported prefixes: ${[...this.adapters.keys()].join(", ")}`
      );
    }
    return adapter;
  }

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    const adapter = this.getAdapter(params.chain);
    return adapter.sendPayment(params);
  }

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    const adapter = this.getAdapter(params.chain);
    return adapter.estimateFees(params);
  }

  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    const adapter = this.getAdapter(chainId);
    return adapter.verifyTransaction(txHash, chainId);
  }

  async getBalance(address: string, chainId: string, token?: string): Promise<ChainBalance[]> {
    const adapter = this.getAdapter(chainId);
    return adapter.getBalance(address, token);
  }

  async anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string> {
    const adapter = this.getAdapter(chainId);
    return adapter.anchorReceipt(receipt, chainId);
  }

  async resolveAddress(nameOrAddress: string, chainId: string): Promise<string> {
    const adapter = this.getAdapter(chainId);
    return adapter.resolveAddress(nameOrAddress, chainId);
  }

  /**
   * Auto-select the cheapest chain for a payment.
   * Estimates fees on all provided chains and picks the lowest.
   */
  async sendPaymentAuto(
    params: Omit<PaymentParams, "chain"> & { chains: string[] }
  ): Promise<PaymentResult> {
    if (params.chains.length === 0) throw new Error("No chains provided");
    if (params.chains.length === 1) {
      return this.sendPayment({ ...params, chain: params.chains[0] });
    }

    // Estimate fees on all chains in parallel
    const estimates = await Promise.allSettled(
      params.chains.map(async (chain) => ({
        chain,
        estimate: await this.estimateFees({ ...params, chain }),
      }))
    );

    const successful = estimates
      .filter((r): r is PromiseFulfilledResult<{ chain: string; estimate: FeeEstimate }> =>
        r.status === "fulfilled"
      )
      .map((r) => r.value)
      .sort((a, b) => parseFloat(a.estimate.feeUsd ?? "0") - parseFloat(b.estimate.feeUsd ?? "0"));

    if (successful.length === 0) throw new Error("Fee estimation failed on all chains");

    // Send on cheapest chain
    return this.sendPayment({ ...params, chain: successful[0].chain });
  }

  /**
   * Get all supported chains across all adapters.
   */
  getSupportedChains(): string[] {
    const chains: string[] = [];
    for (const adapter of this.adapters.values()) {
      chains.push(...adapter.supportedChains);
    }
    return chains;
  }
}

// Singleton for convenience
let defaultRouter: PaymentRouter | null = null;

export function getPaymentRouter(): PaymentRouter {
  if (!defaultRouter) {
    defaultRouter = new PaymentRouter();
  }
  return defaultRouter;
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit src/payments/router.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/integrations/src/payments/router.ts
git commit -m "feat: add PaymentRouter with auto-chain selection (picks cheapest fees)"
```

---

### Task 14: Wire payments into integrations index + update Gate middleware

**Files:**
- Modify: `packages/integrations/src/index.ts`
- Modify: `packages/gate/src/index.ts`

- [ ] **Step 1: Export payments from integrations index**

Add to end of `packages/integrations/src/index.ts`:

```typescript
// Multi-chain payment gateway
export { PaymentRouter, getPaymentRouter } from "./payments/router.js";
export { EVMAdapter } from "./payments/evm/adapter.js";
export { StellarAdapter } from "./payments/stellar/adapter.js";
export { SolanaAdapter } from "./payments/solana/adapter.js";
export type { ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData, ChainConfig, TokenInfo } from "./payments/types.js";
export { EVM_CHAINS, getChainConfig, isEvmChain, getExplorerTxUrl } from "./payments/evm/chains.js";
export { TOKEN_REGISTRY, resolveToken } from "./payments/evm/tokens.js";
export { estimatePaymentFees, compareFeesAcrossChains } from "./payments/evm/gas.js";
export { resolveENS, reverseResolveENS } from "./payments/evm/ens.js";
export { contractRead, encodeContractWrite } from "./payments/evm/contracts.js";
```

- [ ] **Step 2: Update Gate AegisGateOptions for multi-chain**

In `packages/gate/src/index.ts`, update the `AegisGateOptions` interface:

```typescript
export interface AegisGateOptions {
  price: string;
  token?: string;        // default "USDC"
  agentId: string;
  walletAddress?: string;
  network?: string;      // default "eip155:1"
  acceptedChains?: string[];  // NEW: chains this gate accepts payment on
  description?: string;
  verify?: boolean;
}
```

- [ ] **Step 3: Update Gate 402 response to include accepted chains**

In the `aegisGate` function, update the 402 response to include `acceptedChains`:

```typescript
res.status(402).json({
  x402Version: 1,
  payTo: walletAddress,
  price: options.price,
  token,
  network,
  acceptedChains: options.acceptedChains ?? [network],  // NEW
  resource: req.path,
  agentId: options.agentId,
  description: options.description,
});
```

- [ ] **Step 4: Update Gate payment verification to use PaymentRouter**

In the payment verification section of `aegisGate`, update the on-chain verification to detect chain from payment header:

```typescript
// In the payment header parsing, add chain field
const payment = JSON.parse(paymentHeader) as {
  fromAgent?: string;
  txHash?: string;
  timestamp?: string;
  deadline?: number;
  signatureType?: string;
  nonce?: number;
  chain?: string;  // NEW: which chain was payment made on
};

// Use chain from payment header for verification
const paymentChain = payment.chain ?? network;
```

And update the verify block:

```typescript
if (options.verify && payment.txHash && payment.txHash.length > 20 && !payment.txHash.startsWith("mock")) {
  try {
    const { verifySettlement } = await import("./verify-settlement.js");
    const verified = await verifySettlement(payment.txHash, paymentChain);
    if (verified === false) {
      res.status(402).json({ error: "Payment not confirmed on-chain", txHash: payment.txHash });
      return;
    }
  } catch {}
}
```

- [ ] **Step 5: Update payAndFetch for multi-chain**

In `payAndFetch`, add chain selection logic after probing:

```typescript
// After getting 402 details, select chain
const acceptedChains = (details as any).acceptedChains as string[] | undefined;
const selectedChain = acceptedChains?.[0] ?? details.network ?? "eip155:1";
```

And include chain in the X-PAYMENT header:

```typescript
"X-PAYMENT": JSON.stringify({
  fromAgent: callerAgentId,
  token: details.token,
  amount,
  txHash: txProof,
  timestamp: paymentTimestamp,
  deadline,
  signatureType: "eip712",
  chain: selectedChain,  // NEW
}),
```

- [ ] **Step 6: Verify compilation**

```bash
cd /Users/rajkaria/Projects/aegis/packages/integrations && npx tsc --noEmit
cd /Users/rajkaria/Projects/aegis/packages/gate && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add packages/integrations/src/index.ts packages/gate/src/index.ts
git commit -m "feat: wire payment gateway into integrations + multi-chain Gate middleware"
```

---

### Task 15: Dashboard integration mirror

**Files:**
- Create: `dashboard/src/lib/integrations/payments/` (mirror all files from Task 1-13)

- [ ] **Step 1: Copy payment modules to dashboard**

The dashboard runs standalone on Vercel without the monorepo packages. Mirror the payment modules:

```bash
mkdir -p /Users/rajkaria/Projects/aegis/dashboard/src/lib/integrations/payments/evm
mkdir -p /Users/rajkaria/Projects/aegis/dashboard/src/lib/integrations/payments/stellar
mkdir -p /Users/rajkaria/Projects/aegis/dashboard/src/lib/integrations/payments/solana
```

Copy each file, adjusting imports from `"../types.js"` → `"../types"` and `"../../types.js"` → `"../../types"` (dashboard uses Next.js module resolution, not .js extensions).

Files to mirror:
- `payments/types.ts`
- `payments/router.ts`
- `payments/evm/chains.ts`
- `payments/evm/provider.ts`
- `payments/evm/tokens.ts`
- `payments/evm/gas.ts`
- `payments/evm/ens.ts`
- `payments/evm/receipt.ts`
- `payments/evm/contracts.ts`
- `payments/evm/adapter.ts`
- `payments/stellar/payments.ts`
- `payments/stellar/accounts.ts`
- `payments/stellar/receipt.ts`
- `payments/stellar/adapter.ts`
- `payments/solana/adapter.ts`

For the **SolanaAdapter** in the dashboard, remove the `@aegis-ows/gate` dynamic imports and use direct Solana RPC calls instead (the dashboard doesn't have the gate package).

- [ ] **Step 2: Add viem to dashboard**

```bash
cd /Users/rajkaria/Projects/aegis/dashboard && npm install viem
```

- [ ] **Step 3: Verify dashboard builds**

```bash
cd /Users/rajkaria/Projects/aegis/dashboard && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/lib/integrations/payments/ dashboard/package.json dashboard/package-lock.json
git commit -m "feat: mirror payment gateway modules into dashboard for standalone Vercel deploy"
```

---

### Task 16: Dashboard components (ChainSelector, MultiChainPayment, FeeComparison, TxHistory)

**Files:**
- Create: `dashboard/src/components/chain-selector.tsx`
- Create: `dashboard/src/components/multi-chain-payment.tsx`
- Create: `dashboard/src/components/fee-comparison-card.tsx`
- Create: `dashboard/src/components/unified-tx-history.tsx`

- [ ] **Step 1: Create ChainSelector component**

Create `dashboard/src/components/chain-selector.tsx` — a dropdown showing chain name, badge color, and current gas estimate. Follows the pattern of `moonpay-fund-widget.tsx` (uses Card, Badge from shadcn/ui).

Key features:
- Shows all supported EVM chains + Stellar + Solana
- Color-coded badges (green for cheap L2s, yellow for L1)
- "Recommended" tag on Base (cheapest)
- onChange callback with CAIP-2 chainId

- [ ] **Step 2: Create MultiChainPaymentWidget**

Create `dashboard/src/components/multi-chain-payment.tsx` — unified fund/withdraw widget replacing per-chain widgets.

Key features:
- ChainSelector at top
- Token selector (ETH, USDC, SOL, XLM based on selected chain)
- Amount input
- Live fee estimate from `/api/payments/estimate`
- Send button → POST `/api/payments/send`
- Status display on completion

- [ ] **Step 3: Create FeeComparisonCard**

Create `dashboard/src/components/fee-comparison-card.tsx` — shows gas costs across chains.

Key features:
- Fetches from `/api/payments/chains`
- Horizontal bar chart showing relative costs
- "Cheapest" badge on lowest-fee chain
- Auto-refreshes every 30 seconds

- [ ] **Step 4: Create UnifiedTransactionHistory**

Create `dashboard/src/components/unified-tx-history.tsx` — transaction list across all chains.

Key features:
- Chain badge per transaction (color-coded)
- Status indicator (pending/confirmed/failed)
- Explorer link per transaction
- Filterable by chain

- [ ] **Step 5: Verify dashboard builds**

```bash
cd /Users/rajkaria/Projects/aegis/dashboard && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/components/chain-selector.tsx dashboard/src/components/multi-chain-payment.tsx dashboard/src/components/fee-comparison-card.tsx dashboard/src/components/unified-tx-history.tsx
git commit -m "feat: add multi-chain dashboard components (ChainSelector, Payment, Fees, TxHistory)"
```

---

### Task 17: Dashboard API routes

**Files:**
- Create: `dashboard/src/app/api/payments/send/route.ts`
- Create: `dashboard/src/app/api/payments/estimate/route.ts`
- Create: `dashboard/src/app/api/payments/chains/route.ts`

- [ ] **Step 1: Create POST /api/payments/send**

Create `dashboard/src/app/api/payments/send/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { PaymentRouter } from "@/lib/integrations/payments/router";

const router = new PaymentRouter();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chain, to, amount, token, memo } = body;

    if (!chain || !to || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: chain, to, amount" },
        { status: 400 }
      );
    }

    const result = await router.sendPayment({ chain, to, amount, token, memo });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create POST /api/payments/estimate**

Create `dashboard/src/app/api/payments/estimate/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { PaymentRouter } from "@/lib/integrations/payments/router";

const router = new PaymentRouter();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chains, to, amount, token } = body;

    if (!to || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: to, amount" },
        { status: 400 }
      );
    }

    const chainList = chains ?? ["eip155:8453", "eip155:137", "eip155:42161"];

    const estimates = await Promise.allSettled(
      chainList.map((chain: string) =>
        router.estimateFees({ chain, to, amount, token })
      )
    );

    const results = estimates
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => r.value)
      .sort((a: any, b: any) => parseFloat(a.feeUsd ?? "0") - parseFloat(b.feeUsd ?? "0"));

    return NextResponse.json({ estimates: results });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create GET /api/payments/chains**

Create `dashboard/src/app/api/payments/chains/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { EVM_CHAINS } from "@/lib/integrations/payments/evm/chains";

export async function GET() {
  const chains = Object.entries(EVM_CHAINS).map(([chainId, config]) => ({
    chainId,
    name: config.name,
    nativeToken: config.nativeToken.symbol,
    gasModel: config.gasModel,
    avgBlockTime: config.avgBlockTime,
    blockExplorer: config.blockExplorer,
  }));

  // Add non-EVM chains
  chains.push(
    {
      chainId: "stellar:pubnet",
      name: "Stellar",
      nativeToken: "XLM",
      gasModel: "fixed" as any,
      avgBlockTime: 5,
      blockExplorer: "https://stellar.expert/explorer/public",
    },
    {
      chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      name: "Solana",
      nativeToken: "SOL",
      gasModel: "fixed" as any,
      avgBlockTime: 0.4,
      blockExplorer: "https://solscan.io",
    }
  );

  return NextResponse.json({ chains });
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/rajkaria/Projects/aegis/dashboard && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/app/api/payments/
git commit -m "feat: add payment API routes (/send, /estimate, /chains)"
```

---

### Task 18: Update agent dashboard page with multi-chain widgets

**Files:**
- Modify: `dashboard/src/app/(dashboard)/dashboard/agents/[id]/page.tsx`

- [ ] **Step 1: Read current agent page**

Read the agent page and identify where MoonPayFundWidget and MoonPaySellWidget are rendered.

- [ ] **Step 2: Add MultiChainPaymentWidget alongside MoonPay widgets**

Import and add the new components below the existing MoonPay section:

```typescript
import { MultiChainPaymentWidget } from "@/components/multi-chain-payment";
import { FeeComparisonCard } from "@/components/fee-comparison-card";
```

Add after the MoonPay section:

```tsx
{/* Multi-Chain Payments */}
<MultiChainPaymentWidget agentId={agent.id} />
<FeeComparisonCard />
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/rajkaria/Projects/aegis/dashboard && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/app/\\(dashboard\\)/dashboard/agents/\\[id\\]/page.tsx
git commit -m "feat: add multi-chain payment + fee comparison to agent dashboard"
```

---

### Task 19: EVM docs page

**Files:**
- Create: `dashboard/src/app/(landing)/docs/evm/page.tsx`

- [ ] **Step 1: Create /docs/evm page**

Follow the pattern of existing docs pages (e.g., `docs/moonpay/page.tsx`). Include:

1. **Overview** — What EVM integration provides (payments, receipts, ENS, contracts)
2. **Supported Chains** — Table of all 6 chains with gas costs and recommended use
3. **Quick Start** — 3-line code example with PaymentRouter
4. **ERC-20 Tokens** — Built-in token registry, custom token support
5. **Gas Optimization** — Why Base is recommended, fee comparison API
6. **Receipt Anchoring** — How on-chain receipts work on EVM
7. **ENS Resolution** — Using .eth names as payment addresses
8. **Contract Interactions** — Generic ABI read/write
9. **Environment Variables** — Reference table for all EVM env vars
10. **Gate Integration** — Multi-chain x402 middleware setup
11. **Hackathon Ideas** — Agent-to-agent payments on L2, cross-chain arbitrage, gas-optimized routing

- [ ] **Step 2: Commit**

```bash
git add dashboard/src/app/\\(landing\\)/docs/evm/page.tsx
git commit -m "docs: add comprehensive EVM integration docs page"
```

---

### Task 20: Update Stellar docs page with payment capabilities

**Files:**
- Modify: `dashboard/src/app/(landing)/docs/stellar/page.tsx`

- [ ] **Step 1: Read current Stellar docs page**

Read and understand existing content.

- [ ] **Step 2: Add payment sections**

Add after existing balance/verification sections:

1. **Native Payments** — Send XLM and issued assets (USDC)
2. **Account Creation** — Auto-handling of account activation (1 XLM minimum)
3. **Receipt Anchoring** — Memo-based on-chain proofs
4. **Cross-Border Payments** — Use case for near-zero-fee international transfers
5. **Federation** — Resolve human-readable addresses

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/app/\\(landing\\)/docs/stellar/page.tsx
git commit -m "docs: update Stellar docs with native payments, accounts, receipt anchoring"
```

---

### Task 21: Update main docs page + final integration wiring

**Files:**
- Modify: `dashboard/src/app/(landing)/docs/page.tsx`

- [ ] **Step 1: Add Multi-Chain Payments card to Infrastructure section**

In the integrations card grid on the main docs page, add a card for multi-chain payments linking to `/docs/evm`:

```tsx
{
  name: "Multi-Chain Payments",
  description: "Send payments on EVM, Solana, and Stellar with auto-chain selection",
  href: "/docs/evm",
  category: "Infrastructure",
}
```

- [ ] **Step 2: Update Stellar card to mention payments**

Update the existing Stellar card description to include payment capabilities.

- [ ] **Step 3: Final compilation check**

```bash
cd /Users/rajkaria/Projects/aegis && npm run build --workspaces
cd /Users/rajkaria/Projects/aegis/dashboard && npx tsc --noEmit
```

- [ ] **Step 4: Run dev server and verify pages render**

```bash
cd /Users/rajkaria/Projects/aegis/dashboard && npm run dev
```

Visit `/docs/evm`, `/docs/stellar`, `/docs`, and agent dashboard to verify all pages render without errors.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/app/\\(landing\\)/docs/page.tsx
git commit -m "docs: add multi-chain payments card to main docs hub"
```

- [ ] **Step 6: Final commit — update CLAUDE.md session context**

Update `CLAUDE.md` with session context for next session:
- Multi-chain payment gateway implemented
- EVM + Stellar + Solana adapters
- PaymentRouter with auto-chain selection
- Dashboard components + API routes
- Docs updated

```bash
git add CLAUDE.md
git commit -m "chore: update session context with multi-chain payment gateway"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Types + viem dep | `payments/types.ts` |
| 2 | EVM chain configs | `payments/evm/chains.ts` |
| 3 | viem provider facade | `payments/evm/provider.ts` |
| 4 | ERC-20 token registry | `payments/evm/tokens.ts` |
| 5 | Gas estimation | `payments/evm/gas.ts` |
| 6 | ENS resolution | `payments/evm/ens.ts` |
| 7 | Receipt anchoring | `payments/evm/receipt.ts` |
| 8 | Contract interactions | `payments/evm/contracts.ts` |
| 9 | EVM adapter | `payments/evm/adapter.ts` |
| 10 | Stellar payments/accounts/receipts | `payments/stellar/*.ts` |
| 11 | Stellar adapter | `payments/stellar/adapter.ts` |
| 12 | Solana adapter wrapper | `payments/solana/adapter.ts` |
| 13 | Payment router | `payments/router.ts` |
| 14 | Wire into index + Gate | `index.ts`, gate `index.ts` |
| 15 | Dashboard mirror | `dashboard/src/lib/integrations/payments/` |
| 16 | Dashboard components | 4 new components |
| 17 | Dashboard API routes | 3 new routes |
| 18 | Agent page update | Agent dashboard |
| 19 | EVM docs page | `/docs/evm` |
| 20 | Stellar docs update | `/docs/stellar` |
| 21 | Final wiring + docs hub | Main docs + CLAUDE.md |
