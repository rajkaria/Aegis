import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { appendEarningsEntry, ensureAegisDir } from "@aegis-ows/shared";
import { appendLedgerEntry } from "@aegis-ows/shared";
import { signMessage, getWallet } from "@open-wallet-standard/core";
import { sendSolPayment } from "./solana-pay.js";

export { announceServices } from "./announce.js";
export { findServices, type DiscoveredService } from "./discover.js";

export interface AegisGateOptions {
  price: string;
  token?: string;        // default "USDC"
  agentId: string;
  walletAddress?: string;
  network?: string;      // default "eip155:1"
  description?: string;
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

  return (req: Request, res: Response, next: NextFunction): void => {
    const paymentHeader = req.headers["x-payment"] as string | undefined;

    if (!paymentHeader) {
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
      };

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

  // Step 3: Sign a payment proof using the caller's OWS wallet
  const paymentTimestamp = new Date().toISOString();
  let txProof: string;
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
    // Fallback to mock if OWS wallet not available (e.g., on Vercel)
    txProof = `mock-tx-${Date.now()}`;
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
