# Multi-Chain Payment Gateway — Design Spec

**Date:** 2026-04-09  
**Status:** Approved  
**Scope:** EVM deep integration + Stellar native payments + unified payment router

---

## Problem

Aegis has native payment capability on Solana (`solana-pay.ts`) but **zero native transaction capability on EVM chains** — the largest crypto ecosystem (~80% of TVL). Agents can read EVM balances (via Zerion/Uniblock/Allium) but cannot send transactions, interact with contracts, or anchor receipts. Stellar has balance queries but no payment capability. This limits OWS adoption to Solana-only agent commerce.

## Solution

Hybrid Chain Adapter + Payment Router architecture. One unified `sendPayment()` API for common operations, with chain-specific extensions for power features. Facade pattern wraps both viem (primary) and ethers v6 (compatibility).

## Architecture

### Chain Adapter Interface

Every chain implements `ChainAdapter`:

```typescript
interface ChainAdapter {
  chainType: "evm" | "solana" | "stellar" | "xrpl";
  supportedChains: string[]; // CAIP-2 IDs

  sendPayment(params: PaymentParams): Promise<PaymentResult>;
  estimateFees(params: PaymentParams): Promise<FeeEstimate>;
  verifyTransaction(txHash: string, chainId: string): Promise<TxVerification>;
  getBalance(address: string, token?: string): Promise<ChainBalance[]>;
  anchorReceipt(receipt: ReceiptData): Promise<string>; // returns txHash
  resolveAddress(nameOrAddress: string): Promise<string>;
}
```

### Payment Router

Routes by CAIP-2 prefix to the correct adapter:

```typescript
class PaymentRouter {
  private adapters: Map<string, ChainAdapter>;

  // Register adapters
  constructor() {
    this.register("eip155", new EVMAdapter());
    this.register("solana", new SolanaAdapter());
    this.register("stellar", new StellarAdapter());
  }

  // Detect chain from CAIP-2 and delegate
  async sendPayment(params: PaymentParams): Promise<PaymentResult>;

  // "auto" mode — picks cheapest chain from a list
  async sendPaymentAuto(
    params: Omit<PaymentParams, "chain"> & { chains: string[] }
  ): Promise<PaymentResult>;
}
```

### Core Types

```typescript
interface PaymentParams {
  chain: string;              // CAIP-2 chain ID (e.g., "eip155:8453")
  to: string;                 // recipient address
  amount: string;             // human-readable amount (e.g., "5.00")
  token?: string;             // token symbol or contract address (default: native)
  memo?: string;              // optional memo/reference
  budgetCheck?: boolean;      // check against OWS budget limits (default: true)
}

interface PaymentResult {
  txHash: string;
  chain: string;              // CAIP-2 chain ID
  from: string;
  to: string;
  amount: string;
  token: string;
  fee: string;                // actual fee paid
  feeUsd?: string;            // fee in USD
  blockNumber?: number;
  explorerUrl: string;        // link to block explorer
  status: "pending" | "confirmed" | "failed";
}

interface FeeEstimate {
  chain: string;
  fee: string;                // in native token
  feeUsd?: string;            // in USD
  gasLimit?: bigint;          // EVM only
  gasPrice?: bigint;          // EVM only
  maxFeePerGas?: bigint;      // EVM EIP-1559
  maxPriorityFeePerGas?: bigint;
  estimatedTime: number;      // seconds to confirmation
}

interface ReceiptData {
  paymentTxHash: string;
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  token: string;
  chain: string;
  timestamp: number;
  metadata?: Record<string, string>;
}
```

---

## File Structure

```
packages/integrations/src/payments/
  types.ts              — ChainAdapter, PaymentParams, PaymentResult, FeeEstimate, ReceiptData
  router.ts             — PaymentRouter with CAIP-2 dispatch + auto-chain selection
  evm/
    adapter.ts          — EVMAdapter implementing ChainAdapter
    provider.ts         — viem/ethers facade: createChainClient(chainId, options?)
    chains.ts           — Chain configs: RPCs, explorers, native tokens, gas models
    tokens.ts           — ERC-20 registry (USDC/USDT/WETH/DAI per chain) + transfers + approvals
    contracts.ts        — Generic ABI interaction (EVM-only extension)
    gas.ts              — EIP-1559 estimation, L2-aware models, USD conversion
    ens.ts              — Forward + reverse ENS resolution
    receipt.ts          — Calldata-based on-chain receipt anchoring
  solana/
    adapter.ts          — SolanaAdapter wrapping existing solana-pay.ts + receipt-anchor.ts
  stellar/
    adapter.ts          — StellarAdapter implementing ChainAdapter
    payments.ts         — XLM + issued asset transfers (USDC via Circle)
    accounts.ts         — Account creation + minimum balance handling
    receipt.ts          — Memo-field receipt anchoring

dashboard/src/lib/integrations/payments/
  (mirror of above for dashboard standalone deploy)

dashboard/src/components/
  chain-selector.tsx         — Dropdown for preferred payment chain
  multi-chain-payment.tsx    — Unified fund/withdraw across chains
  fee-comparison-card.tsx    — Gas cost comparison across chains
  unified-tx-history.tsx     — Transaction history with chain badges

dashboard/src/app/api/payments/
  send/route.ts              — POST: send payment via router
  estimate/route.ts          — POST: estimate fees across chains
  history/route.ts           — GET: unified transaction history
  chains/route.ts            — GET: supported chains + current gas prices
```

---

## EVM Deep Integration

### Supported Chains

| Chain | CAIP-2 | Native Token | Gas Cost | Use Case |
|-------|--------|-------------|----------|----------|
| Ethereum | eip155:1 | ETH | ~$2-10 | High-value, ENS |
| Base | eip155:8453 | ETH | ~$0.001 | **Recommended for agents** |
| Polygon | eip155:137 | MATIC/POL | ~$0.01 | High throughput |
| Arbitrum | eip155:42161 | ETH | ~$0.01 | DeFi ecosystem |
| Optimism | eip155:10 | ETH | ~$0.005 | Superchain |
| Sepolia | eip155:11155111 | ETH | Free | Testnet |

Any custom EVM chain addable via `ChainConfig`.

### Chain Configuration

```typescript
interface ChainConfig {
  chainId: string;           // CAIP-2
  name: string;
  nativeToken: { symbol: string; decimals: number };
  rpcUrls: string[];         // fallback array
  blockExplorer: string;
  gasModel: "legacy" | "eip1559" | "arbitrum" | "optimism";
  avgBlockTime: number;      // seconds
  tokens: Record<string, string>; // symbol → contract address
}
```

Public RPC URLs built in for all chains. Override via env vars:
- `EVM_RPC_URL` — default for all EVM chains
- `BASE_RPC_URL`, `POLYGON_RPC_URL`, `ARBITRUM_RPC_URL`, etc. — chain-specific overrides

### viem/ethers Facade

```typescript
// Primary: viem (modern, TypeScript-native, tree-shakeable)
const client = createChainClient("eip155:8453");

// Alternative: ethers v6 (for integrators who prefer it)
const client = createChainClient("eip155:8453", { engine: "ethers" });

// Both return the same interface:
interface ChainClient {
  getBalance(address: string): Promise<bigint>;
  estimateGas(tx: TransactionRequest): Promise<bigint>;
  sendTransaction(tx: TransactionRequest): Promise<string>;
  call(tx: TransactionRequest): Promise<string>;
  getTransactionReceipt(hash: string): Promise<TransactionReceipt | null>;
  readContract(params: ContractReadParams): Promise<unknown>;
  writeContract(params: ContractWriteParams): Promise<string>;
}
```

### ERC-20 Token Registry

Built-in addresses for common tokens per chain:

```typescript
const TOKEN_REGISTRY: Record<string, Record<string, TokenInfo>> = {
  "eip155:1": {
    "USDC": { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    "USDT": { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    "WETH": { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
    "DAI":  { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
  },
  "eip155:8453": { /* Base token addresses */ },
  "eip155:137":  { /* Polygon token addresses */ },
  // ...
};
```

Custom tokens via contract address: `sendPayment({ token: "0x1234..." })`.

### Gas Estimation

```typescript
async function estimateEvmFees(params: PaymentParams): Promise<FeeEstimate> {
  // 1. Get gas price (EIP-1559 or legacy depending on chain)
  // 2. Estimate gas limit for the specific tx type (native vs ERC-20)
  // 3. Apply chain-specific buffer (1.2x for L1, 1.1x for L2)
  // 4. Convert to USD using token price from existing balance data
  // 5. Check against OWS budget limits if budgetCheck enabled
}
```

L2-specific models:
- **Arbitrum:** L1 data fee + L2 execution fee (ArbGasInfo precompile)
- **Optimism/Base:** L1 data fee via GasPriceOracle + L2 execution fee

### Receipt Anchoring (EVM)

Self-transfer with receipt hash in calldata — cheapest possible on-chain proof:

```typescript
async function anchorReceiptEvm(receipt: ReceiptData, chainId: string): Promise<string> {
  const hash = sha256(JSON.stringify(receipt));
  // Send 0-value tx to self with hash as calldata
  // On Base: ~$0.001 per anchor
  return txHash;
}
```

### ENS Resolution

```typescript
async function resolveENS(name: string): Promise<string | null> {
  // Requires Ethereum mainnet RPC
  // Forward: "vitalik.eth" → "0xd8dA..."
  // Reverse: "0xd8dA..." → "vitalik.eth"
}
```

### Contract Interactions (EVM-only Extension)

Not part of `ChainAdapter` — power feature accessed directly:

```typescript
// Read
const balance = await evmAdapter.readContract({
  chain: "eip155:8453",
  address: "0xContractAddress",
  abi: erc20Abi,
  method: "balanceOf",
  args: ["0xOwner"],
});

// Write
const txHash = await evmAdapter.writeContract({
  chain: "eip155:8453",
  address: "0xContractAddress",
  abi: erc20Abi,
  method: "transfer",
  args: ["0xRecipient", parseUnits("100", 6)],
});
```

---

## Stellar Deep Integration

### Payments

```typescript
async function sendStellarPayment(params: {
  to: string;
  amount: string;
  asset?: { code: string; issuer: string }; // default: native XLM
  memo?: string;
  network?: "pubnet" | "testnet";
}): Promise<PaymentResult> {
  // 1. Check if destination account exists
  // 2. If not, create it with minimum balance (1 XLM) + payment
  // 3. Build transaction with optional memo
  // 4. Sign via OWS wallet
  // 5. Submit to Horizon
}
```

### Issued Assets

Built-in support for USDC on Stellar:
```typescript
const STELLAR_ASSETS = {
  "USDC": {
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", // Circle
  },
};
```

Trust line creation handled automatically when sending issued assets to accounts that don't have a trust line.

### Account Creation

Stellar requires accounts to exist with minimum 1 XLM. The adapter handles this:
1. Check if destination exists via Horizon
2. If not, use `createAccount` operation with minimum balance + payment amount
3. If yes, use standard `payment` operation

### Receipt Anchoring

Uses Stellar's native memo field — zero additional cost:

```typescript
async function anchorReceiptStellar(receipt: ReceiptData): Promise<string> {
  const hash = sha256(JSON.stringify(receipt));
  // Attach as MEMO_HASH to a minimum-fee transaction
  // Cost: standard Stellar fee (0.00001 XLM)
}
```

### Federation

Resolve human-readable addresses:
```typescript
// "agent*aegis.com" → "GABCDEF..."
async function resolveFederation(address: string): Promise<string>;
```

---

## Solana Adapter

Wraps existing code — no new Solana logic:

```typescript
class SolanaAdapter implements ChainAdapter {
  chainType = "solana" as const;
  supportedChains = ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", "solana:devnet"];

  // Delegates to existing solana-pay.ts
  async sendPayment(params) { return sendSolanaPayment(params); }

  // Delegates to existing receipt-anchor.ts
  async anchorReceipt(receipt) { return anchorSolanaReceipt(receipt); }

  // Delegates to existing verify-settlement.ts
  async verifyTransaction(hash, chainId) { return verifySolanaSettlement(hash); }

  // Delegates to existing solana.ts in integrations
  async getBalance(address) { return getSolanaBalances(address); }

  // Solana doesn't have name resolution (no SNS support yet)
  async resolveAddress(addr) { return addr; }
}
```

---

## Gate Middleware Updates

### Multi-Chain x402

```typescript
// Agent side: accept payments on multiple chains
app.use(x402({
  price: { amount: "0.01", token: "USDC" },
  acceptedChains: ["eip155:8453", "eip155:137", "stellar:pubnet", "solana:mainnet"],
  wallet: owsWallet,
}));

// Response header: X-Payment-Chains: eip155:8453,eip155:137,stellar:pubnet,solana:mainnet
// Client picks chain → pays → includes X-Payment-TxHash + X-Payment-Chain headers
```

### Auto-Chain Selection

```typescript
// Buyer side: automatically pick cheapest chain
const result = await payAndFetch(url, {
  chain: "auto", // estimates fees on all accepted chains, picks cheapest
  wallet: owsWallet,
});
```

### Settlement Verification

Unified verification via PaymentRouter:

```typescript
// In x402 middleware, after receiving payment proof
const verified = await router.verifyTransaction(
  req.headers["x-payment-txhash"],
  req.headers["x-payment-chain"]
);
```

### Backward Compatibility

Existing Solana-only setups continue working. If no `acceptedChains` specified, defaults to current behavior (EVM EIP-712 signing).

---

## Dashboard Components

### ChainSelector

Dropdown component for selecting preferred payment chain:
- Shows chain name, logo, current gas price
- Highlights recommended chains (Base for cheapest)
- Used in agent config and payment widgets

### MultiChainPaymentWidget

Replaces chain-specific fund/sell widgets:
- Chain selector at top
- Amount input with token selector
- Fee estimate updates live as chain changes
- "Cheapest option" badge on lowest-fee chain
- Integrates with MoonPay for fiat on-ramp when applicable

### FeeComparisonCard

Shows gas costs across all supported chains:
- Side-by-side comparison for the same transaction
- Updates in real-time
- Helps users understand why Base is recommended

### UnifiedTransactionHistory

Single view of all transactions across chains:
- Chain badge (color-coded) per transaction
- Unified status tracking
- Links to block explorer per chain
- Filterable by chain

---

## Dashboard API Routes

### POST `/api/payments/send`
Send a payment via the router.
- Body: `PaymentParams`
- Returns: `PaymentResult`

### POST `/api/payments/estimate`
Estimate fees across multiple chains.
- Body: `{ to, amount, token, chains: string[] }`
- Returns: `FeeEstimate[]` sorted by cost

### GET `/api/payments/history`
Unified transaction history.
- Query: `?address=0x...&chains=eip155:8453,solana:mainnet&limit=50`
- Returns: `PaymentResult[]`

### GET `/api/payments/chains`
Supported chains with current gas prices.
- Returns: `{ chains: ChainConfig[], gasEstimates: Record<string, FeeEstimate> }`

---

## Configuration — Graceful Degradation

| Tier | Env Vars | Unlocks |
|------|----------|---------|
| Read-only | None | Balance queries, fee estimates via public RPCs |
| Custom RPCs | `BASE_RPC_URL`, `POLYGON_RPC_URL`, `STELLAR_NETWORK`, etc. | Reliable RPC, no rate limits |
| Full payments | OWS wallet configured | Send transactions, anchor receipts |
| ENS | Ethereum mainnet RPC available | Name resolution |

No API keys needed for basic EVM or Stellar operations (unlike MoonPay/Zerion/Allium).

---

## Documentation

### New: `/docs/evm` page
- Supported chains table
- Quick start: 3-line payment integration
- ERC-20 token support
- Gas optimization guide (why Base is recommended)
- Contract interactions
- Receipt anchoring
- ENS resolution
- Environment variables reference

### Updated: `/docs/stellar` page
- Add native payment capabilities
- Account creation handling
- Issued assets (USDC)
- Cross-border payment use case
- Memo-based receipt anchoring

### New section on main `/docs` page
- "Multi-Chain Payments" card in Infrastructure category
- Links to EVM and Stellar docs

---

## npm Package Exports

```typescript
// Unified API (recommended)
import { PaymentRouter } from "aegis-ows-gate/payments";

// Chain-specific adapters (power users)
import { EVMAdapter } from "aegis-ows-gate/evm";
import { StellarAdapter } from "aegis-ows-gate/stellar";
import { SolanaAdapter } from "aegis-ows-gate/solana";

// Backward compatible (existing code keeps working)
import { sendSolanaPayment } from "aegis-ows-gate";
```

---

## Dependencies

### New
- `viem` — direct dependency for EVM interactions (currently only transitive via XMTP)

### Existing (no changes)
- `ethers` v6 — already in gate, used for facade compatibility
- `@stellar/stellar-sdk` — already in integrations
- `@solana/web3.js` — already in integrations + gate

---

## Success Criteria

1. `sendPayment()` works on all 6 EVM chains + Stellar + Solana with identical API
2. `chain: "auto"` correctly picks cheapest chain
3. Receipt anchoring produces verifiable on-chain proof on every chain
4. Gas estimation accurate within 20% on all chains
5. Gate x402 middleware accepts multi-chain payments
6. Existing Solana-only setups continue working without changes
7. Dashboard shows unified transaction history across all chains
8. Zero new API keys required for basic EVM/Stellar operations
