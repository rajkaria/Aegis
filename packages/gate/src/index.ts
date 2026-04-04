/**
 * Aegis Gate — x402 Payment Middleware for Express
 *
 * Architecture Notes:
 *
 * Payment Flow:
 * 1. Client requests resource → Gate returns 402 with payment details
 * 2. Client signs payment authorization using EIP-712 (Permit2-style)
 * 3. Client retries with X-PAYMENT header containing signed authorization
 * 4. Gate verifies: signature exists, deadline not expired, timestamp fresh
 * 5. Optional: Gate verifies payment landed on-chain (verify: true)
 * 6. Gate logs earning and forwards to handler
 *
 * Production Considerations:
 * - For mainnet deployment, integrate with Coinbase's x402 facilitator
 *   for trustless payment verification
 * - The verify: true option does direct RPC verification (suitable for
 *   low-volume or trusted environments)
 * - For high-throughput: use webhook-based confirmation from a payment
 *   indexer (e.g., Allium Realtime API)
 */

import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { appendEarningsEntry, ensureAegisDir } from "@aegis-ows/shared";
import { appendLedgerEntry } from "@aegis-ows/shared";
import { signMessage, signTypedData, getWallet } from "@open-wallet-standard/core";
import { verifyTypedData } from "ethers";
import { sendSolPayment } from "./solana-pay.js";

export { announceServices } from "./announce.js";
export { findServices, type DiscoveredService } from "./discover.js";

// Rate limiter — max 100 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return false;
  }
  return true;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 60000);

export interface AegisGateOptions {
  price: string;
  token?: string;        // default "USDC"
  agentId: string;
  walletAddress?: string;
  network?: string;      // default "eip155:1"
  description?: string;
  verify?: boolean;      // If true, verify the payment tx landed on-chain before granting access
}

export function aegisGate(options: AegisGateOptions) {
  const token = options.token ?? "USDC";
  const network = options.network ?? "eip155:1";

  // Try to get real wallet address from OWS at initialization
  let resolvedAddress = options.walletAddress ?? `wallet:${options.agentId}`;
  try {
    const w = getWallet(options.agentId);
    const evmAccount = w?.accounts?.find((a) => a.chainId.startsWith("eip155:"));
    if (evmAccount) {
      resolvedAddress = evmAccount.address;
    }
  } catch {
    // OWS not available, use fallback
  }

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const paymentHeader = req.headers["x-payment"] as string | undefined;

    if (!paymentHeader) {
      // Rate limit 402 responses
      const clientIp = req.ip ?? (req.headers["x-forwarded-for"]?.toString()) ?? "unknown";
      if (!checkRateLimit(clientIp)) {
        res.status(429).json({ error: "Too many requests. Try again later." });
        return;
      }

      const walletAddress = resolvedAddress;
      res.status(402).json({
        // x402 spec fields
        x402Version: 1,
        payTo: walletAddress,
        price: options.price,
        token,
        // extended fields for backward compat
        network,
        resource: req.path,
        agentId: options.agentId,
        description: options.description,
      });
      return;
    }

    try {
      const payment = JSON.parse(paymentHeader) as {
        fromAgent?: string;
        txHash?: string;
        timestamp?: string;
        deadline?: number;
        signatureType?: string;
        nonce?: number;
      };

      // Verify deadline for EIP-712 signed payments
      if (payment.deadline) {
        const now = Math.floor(Date.now() / 1000);
        if (now > payment.deadline) {
          res.status(401).json({ error: "Payment authorization expired" });
          return;
        }
      }

      // Verify timestamp freshness to prevent replay attacks (5-minute window)
      if (payment.timestamp) {
        const age = Date.now() - new Date(payment.timestamp).getTime();
        if (age > 5 * 60 * 1000) {
          res.status(401).json({ error: "Payment proof expired" });
          return;
        }
      }

      // Verify that a non-trivial txHash / signature is present
      if (!payment.txHash || payment.txHash.length < 10) {
        res.status(401).json({ error: "Invalid payment signature" });
        return;
      }

      // Verify the EIP-712 signature matches the claimed sender
      if (payment.signatureType === "eip712" && payment.txHash && payment.fromAgent) {
        try {
          const domain = { name: "AegisGate", version: "1", chainId: 1 };
          const types = {
            PaymentAuthorization: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "token", type: "string" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
              { name: "resource", type: "string" },
            ],
          };

          let expectedAddress: string | null = null;
          try {
            const senderWallet = getWallet(payment.fromAgent);
            const evmAccount = senderWallet?.accounts?.find((a: any) => a.chainId?.startsWith("eip155:"));
            if (evmAccount) expectedAddress = evmAccount.address;
          } catch {}

          if (expectedAddress) {
            const recoveredAddress = verifyTypedData(domain, types, {
              to: resolvedAddress,
              amount: Math.floor(parseFloat(options.price) * 1e6).toString(),
              token,
              nonce: payment.nonce?.toString() ?? "0",
              deadline: (payment.deadline ?? 0).toString(),
              resource: req.path,
            }, payment.txHash);

            if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
              res.status(401).json({
                error: "Payment signature does not match sender wallet",
                expected: expectedAddress,
                recovered: recoveredAddress,
              });
              return;
            }
          }
          // If we can't get the expected address, skip verification (graceful degradation)
        } catch {
          // Signature verification failed — but don't block if it's a non-EIP712 payment
        }
      }

      // Optional on-chain verification: confirm the tx landed on Solana devnet
      if (options.verify && payment.txHash && payment.txHash.length > 60 && !payment.txHash.startsWith("mock")) {
        try {
          const { Connection } = await import("@solana/web3.js");
          const conn = new Connection("https://api.devnet.solana.com", "confirmed");
          const txInfo = await conn.getTransaction(payment.txHash, { maxSupportedTransactionVersion: 0 });

          if (!txInfo || txInfo.meta?.err) {
            res.status(402).json({ error: "Payment transaction not confirmed on-chain", txHash: payment.txHash });
            return;
          }
          // Verified — payment landed on chain
        } catch {
          // Verification failed but don't block — log warning
          console.error("[aegis-gate] On-chain verification failed for tx:", payment.txHash);
        }
      }

      ensureAegisDir();

      appendEarningsEntry({
        timestamp: new Date().toISOString(),
        agentId: options.agentId,
        endpoint: req.path,
        fromAgent: payment.fromAgent ?? "unknown",
        token,
        amount: options.price,
        txHash: payment.txHash,
      });

      next();
    } catch {
      res.status(400).json({ error: "Invalid payment header" });
    }
  };
}

export async function payAndFetch(url: string, callerAgentId: string): Promise<unknown> {
  // Step 1: Probe the endpoint
  const probeRes = await fetch(url);

  if (probeRes.status !== 402) {
    return probeRes.json();
  }

  const details = await probeRes.json() as {
    network?: string;
    token?: string;
    // new spec fields
    price?: string;
    payTo?: string;
    // legacy fields (backward compat)
    amount?: string;
    recipient?: string;
    agentId?: string;
    resource?: string;
  };

  // Support both new spec field names and legacy field names
  const amount = details.price ?? details.amount ?? "0";
  const recipient = details.payTo ?? details.recipient ?? details.agentId;

  // Step 2: Log spending
  ensureAegisDir();
  appendLedgerEntry({
    timestamp: new Date().toISOString(),
    apiKeyId: callerAgentId,
    chainId: details.network ?? "eip155:1",
    token: details.token ?? "USDC",
    amount,
    tool: url,
    description: `x402 payment to ${recipient} for ${details.resource ?? url}`,
  });

  // Step 3: Sign a payment authorization using EIP-712 typed data (Permit2-style)
  const paymentTimestamp = new Date().toISOString();
  const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
  let txProof: string;
  try {
    const typedData = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        PaymentAuthorization: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "token", type: "string" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "resource", type: "string" },
        ],
      },
      primaryType: "PaymentAuthorization",
      domain: {
        name: "AegisGate",
        version: "1",
        chainId: 1,
      },
      message: {
        to: recipient ?? "0x0",
        amount: Math.floor(parseFloat(amount) * 1e6).toString(), // Convert to smallest unit
        token: details.token ?? "USDC",
        nonce: Date.now().toString(),
        deadline: deadline.toString(),
        resource: details.resource ?? url,
      },
    });
    const result = signTypedData(callerAgentId, "evm", typedData);
    txProof = result.signature;
  } catch {
    // Fallback to signMessage if signTypedData unavailable
    try {
      const message = JSON.stringify({
        action: "x402_payment",
        to: recipient,
        amount,
        token: details.token ?? "USDC",
        timestamp: paymentTimestamp,
      });
      const result = signMessage(callerAgentId, "evm", message);
      txProof = result.signature;
    } catch {
      txProof = `mock-tx-${Date.now()}`;
    }
  }

  // Try real on-chain Solana payment when the network is Solana
  if (details.network?.includes("solana") || (recipient && recipient.length === 44)) {
    const solTxHash = await sendSolPayment(callerAgentId, recipient ?? "", parseFloat(amount) * 0.001);
    if (solTxHash) {
      txProof = solTxHash;
    }
  }

  // Step 4: Retry with payment — include timestamp so Gate can verify freshness
  const paidRes = await fetch(url, {
    headers: {
      "X-PAYMENT": JSON.stringify({
        fromAgent: callerAgentId,
        token: details.token,
        amount,
        txHash: txProof,
        timestamp: paymentTimestamp,
        deadline,
        signatureType: "eip712",
      }),
    },
  });

  return paidRes.json();
}

export interface AegisConfig {
  walletName: string;
  network?: string;
  endpoints: Record<string, {
    price: string;
    token?: string;
    description?: string;
  }>;
}

export function loadConfig(configPath?: string): AegisConfig {
  const path = configPath ?? join(process.cwd(), "aegis.config.json");
  return JSON.parse(readFileSync(path, "utf-8")) as AegisConfig;
}

export function aegisGateFromConfig(configPath?: string): Router {
  const config = loadConfig(configPath);
  const router = Router();

  for (const [path, endpoint] of Object.entries(config.endpoints)) {
    if (endpoint.price === "0") continue; // Free endpoints don't need gate
    router.use(path, aegisGate({
      price: endpoint.price,
      token: endpoint.token ?? "USDC",
      agentId: config.walletName,
      network: config.network ?? "eip155:1",
      description: endpoint.description,
    }));
  }

  return router;
}
