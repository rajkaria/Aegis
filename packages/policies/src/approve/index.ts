#!/usr/bin/env node
import {
  readApproveConfig,
  isApproved,
  addPendingApproval,
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
    return "ERC20";
  }
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

  const config = readApproveConfig();
  if (!config) {
    return { allow: true };
  }

  const txValue = estimateValue(ctx);
  const token = extractToken(ctx);
  const hardBlockAbove = parseFloat(config.thresholds.hard_block_above);
  const autoApproveBelow = parseFloat(config.thresholds.auto_approve_below);

  // Hard block check
  if (!isNaN(hardBlockAbove) && txValue > hardBlockAbove) {
    const result: PolicyResult = {
      allow: false,
      reason: `Transaction value $${txValue.toFixed(2)} exceeds hard limit of $${hardBlockAbove.toFixed(2)}`,
    };
    logResult(ctx, "aegis-approve", result);
    return result;
  }

  // Auto-approve below threshold
  if (!isNaN(autoApproveBelow) && txValue <= autoApproveBelow) {
    const result: PolicyResult = { allow: true };
    logResult(ctx, "aegis-approve", result);
    return result;
  }

  // Check if already approved
  if (isApproved(ctx.apiKeyId, ctx.chainId, ctx.transaction.to)) {
    const result: PolicyResult = {
      allow: true,
      reason: "Previously approved",
    };
    logResult(ctx, "aegis-approve", result);
    return result;
  }

  // Add to pending approval queue
  const approval = addPendingApproval({
    apiKeyId: ctx.apiKeyId,
    chainId: ctx.chainId,
    transaction: ctx.transaction,
    estimatedValue: txValue.toFixed(2),
    token,
    reason: `Transaction requires human approval: $${txValue.toFixed(2)} ${token}`,
    ttlMinutes: config.approval_ttl_minutes,
  });

  const result: PolicyResult = {
    allow: false,
    reason: `Transaction requires human approval. Approval ID: ${approval.id}. Check pending approvals to approve or reject this transaction.`,
  };
  logResult(ctx, "aegis-approve", result);
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
      reason: `aegis-approve error: ${message}`,
    };
    process.stdout.write(JSON.stringify(result));
  });
