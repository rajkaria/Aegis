import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { appendEarningsEntry, ensureAegisDir } from "@aegis-ows/shared";
import { appendLedgerEntry } from "@aegis-ows/shared";

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

  return (req: Request, res: Response, next: NextFunction): void => {
    const paymentHeader = req.headers["x-payment"] as string | undefined;

    if (!paymentHeader) {
      const walletAddress = options.walletAddress ?? `wallet:${options.agentId}`;
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
      };
      ensureAegisDir();

      appendEarningsEntry({
        timestamp: new Date().toISOString(),
        agentId: options.agentId,
        endpoint: req.path,
        fromAgent: payment.fromAgent ?? "unknown",
        token,
        amount: options.price,
        txHash: payment.txHash ?? `mock-${Date.now()}`,
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

  // Step 3: Retry with payment
  const paidRes = await fetch(url, {
    headers: {
      "X-PAYMENT": JSON.stringify({
        fromAgent: callerAgentId,
        token: details.token,
        amount,
        txHash: `mock-tx-${Date.now()}`,
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
