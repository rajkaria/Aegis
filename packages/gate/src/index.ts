import type { Request, Response, NextFunction } from "express";
import { appendEarningsEntry, ensureAegisDir } from "@aegis-ows/shared";
import { appendLedgerEntry } from "@aegis-ows/shared";

export interface AegisGateOptions {
  price: string;
  token?: string;        // default "USDC"
  agentId: string;
  walletAddress?: string;
  network?: string;      // default "eip155:1"
}

export function aegisGate(options: AegisGateOptions) {
  const token = options.token ?? "USDC";
  const network = options.network ?? "eip155:1";

  return (req: Request, res: Response, next: NextFunction): void => {
    const paymentHeader = req.headers["x-payment"] as string | undefined;

    if (!paymentHeader) {
      res.status(402).json({
        type: "x402",
        version: 1,
        network,
        token,
        amount: options.price,
        recipient: options.walletAddress ?? `wallet:${options.agentId}`,
        resource: req.path,
        agentId: options.agentId,
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
    amount: string;
    agentId?: string;
    resource?: string;
  };

  // Step 2: Log spending
  ensureAegisDir();
  appendLedgerEntry({
    timestamp: new Date().toISOString(),
    apiKeyId: callerAgentId,
    chainId: details.network ?? "eip155:1",
    token: details.token ?? "USDC",
    amount: details.amount,
    tool: url,
    description: `x402 payment to ${details.agentId} for ${details.resource}`,
  });

  // Step 3: Retry with payment
  const paidRes = await fetch(url, {
    headers: {
      "X-PAYMENT": JSON.stringify({
        fromAgent: callerAgentId,
        token: details.token,
        amount: details.amount,
        txHash: `mock-tx-${Date.now()}`,
      }),
    },
  });

  return paidRes.json();
}
