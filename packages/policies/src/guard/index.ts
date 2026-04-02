#!/usr/bin/env node
import {
  readGuardConfig,
  appendPolicyLog,
} from "@aegis-ows/shared";
import type { PolicyContext, PolicyResult } from "@aegis-ows/shared";

function getAllowedAddresses(
  addresses: Record<string, string[]>,
  chainId: string
): string[] {
  // Exact match
  if (addresses[chainId]) {
    return addresses[chainId];
  }

  // Wildcard prefix match: e.g. "solana:*" matches "solana:mainnet"
  for (const key of Object.keys(addresses)) {
    if (key.endsWith(":*")) {
      const prefix = key.slice(0, -1); // "solana:"
      if (chainId.startsWith(prefix)) {
        return addresses[key];
      }
    }
  }

  return [];
}

function logResult(
  ctx: PolicyContext,
  policyName: string,
  result: PolicyResult
): void {
  appendPolicyLog({
    timestamp: new Date().toISOString(),
    policyName,
    apiKeyId: ctx.apiKeyId,
    chainId: ctx.chainId,
    allowed: result.allow,
    reason: result.reason,
    transactionPreview: ctx.transaction.to
      ? `to:${ctx.transaction.to}`
      : undefined,
  });
}

async function main(): Promise<PolicyResult> {
  // Read PolicyContext from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  const ctx: PolicyContext = JSON.parse(raw);

  const config = readGuardConfig();
  if (!config) {
    return { allow: true };
  }

  const targetAddress = ctx.transaction.to;

  // If no target address, allow
  if (!targetAddress) {
    const result: PolicyResult = { allow: true };
    logResult(ctx, "aegis-guard", result);
    return result;
  }

  const lowerTarget = targetAddress.toLowerCase();

  // Check blocklist first
  if (config.blockAddresses && config.blockAddresses.length > 0) {
    const blocked = config.blockAddresses.some(
      (addr) => addr.toLowerCase() === lowerTarget
    );
    if (blocked) {
      const result: PolicyResult = {
        allow: false,
        reason: `Address ${targetAddress} is on the blocklist`,
      };
      logResult(ctx, "aegis-guard", result);
      return result;
    }
  }

  // In allowlist mode, check if address is allowed
  if (config.mode === "allowlist") {
    const allowed = getAllowedAddresses(config.addresses, ctx.chainId);
    if (allowed.length > 0) {
      const isAllowed = allowed.some(
        (addr) => addr.toLowerCase() === lowerTarget
      );
      if (!isAllowed) {
        const result: PolicyResult = {
          allow: false,
          reason: `Address ${targetAddress} is not on the allowlist for chain ${ctx.chainId}`,
        };
        logResult(ctx, "aegis-guard", result);
        return result;
      }
    }
  }

  const result: PolicyResult = { allow: true };
  logResult(ctx, "aegis-guard", result);
  return result;
}

main()
  .then((result) => {
    process.stdout.write(JSON.stringify(result));
  })
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    const result: PolicyResult = {
      allow: false,
      reason: `aegis-guard error: ${message}`,
    };
    process.stdout.write(JSON.stringify(result));
  });
