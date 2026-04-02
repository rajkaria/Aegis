#!/usr/bin/env node
import {
  readBudgetConfig,
  readLedger,
  getSpentInPeriod,
  appendPolicyLog,
} from "@aegis-ows/shared";
import type { PolicyContext, PolicyResult } from "@aegis-ows/shared";

function estimateValue(ctx: PolicyContext): number {
  const raw = ctx.simulation?.value ?? ctx.transaction.value;
  if (!raw) return 0;
  const parsed = parseFloat(String(raw));
  return isNaN(parsed) ? 0 : parsed;
}

function extractToken(ctx: PolicyContext): string {
  const data = ctx.transaction.data;
  if (typeof data === "string" && data.startsWith("0xa9059cbb")) {
    // ERC-20 transfer
    return "ERC20";
  }
  // Default by chain
  const chainId = ctx.chainId;
  if (chainId.startsWith("solana")) return "SOL";
  return "ETH";
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

  const config = readBudgetConfig();
  if (!config || config.limits.length === 0) {
    return { allow: true };
  }

  const ledger = readLedger();
  const txValue = estimateValue(ctx);
  const token = extractToken(ctx);

  for (const limit of config.limits) {
    // Check chainId match (support "*" wildcard)
    const chainMatch =
      limit.chainId === "*" || limit.chainId === ctx.chainId;
    // Check token match (support "*" wildcard)
    const tokenMatch = limit.token === "*" || limit.token === token;

    if (!chainMatch || !tokenMatch) continue;

    const periods: Array<"daily" | "weekly" | "monthly"> = [
      "daily",
      "weekly",
      "monthly",
    ];

    for (const period of periods) {
      const cap = limit[period];
      if (!cap) continue;

      const capValue = parseFloat(cap);
      if (isNaN(capValue)) continue;

      const spent = getSpentInPeriod(
        ledger,
        ctx.apiKeyId,
        ctx.chainId,
        token,
        period
      );

      if (spent + txValue > capValue) {
        const periodLabel =
          period.charAt(0).toUpperCase() + period.slice(1);
        const result: PolicyResult = {
          allow: false,
          reason: `${periodLabel} ${token} limit on ${ctx.chainId} exceeded: $${(spent + txValue).toFixed(2)}/$${capValue.toFixed(2)}`,
        };
        logResult(ctx, "aegis-budget", result);
        return result;
      }
    }
  }

  const result: PolicyResult = { allow: true };
  logResult(ctx, "aegis-budget", result);
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
      reason: `aegis-budget error: ${message}`,
    };
    process.stdout.write(JSON.stringify(result));
  });
