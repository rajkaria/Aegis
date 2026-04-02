import { readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { ApprovalQueue, PendingApproval, SerializedTransaction } from "./types.js";
import { PATHS, ensureAegisDir } from "./paths.js";

export function readApprovals(): ApprovalQueue {
  if (!existsSync(PATHS.pendingApprovals)) {
    return { pending: [] };
  }
  try {
    const raw = readFileSync(PATHS.pendingApprovals, "utf-8");
    return JSON.parse(raw) as ApprovalQueue;
  } catch {
    return { pending: [] };
  }
}

function writeApprovals(queue: ApprovalQueue): void {
  ensureAegisDir();
  writeFileSync(PATHS.pendingApprovals, JSON.stringify(queue, null, 2), "utf-8");
}

export interface AddPendingApprovalParams {
  apiKeyId: string;
  chainId: string;
  transaction: SerializedTransaction;
  estimatedValue: string;
  token: string;
  reason?: string;
  ttlMinutes?: number;
}

export function addPendingApproval(params: AddPendingApprovalParams): PendingApproval {
  const now = new Date();
  const ttlMinutes = params.ttlMinutes ?? 30;
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  const approval: PendingApproval = {
    id: randomUUID(),
    apiKeyId: params.apiKeyId,
    chainId: params.chainId,
    transaction: params.transaction,
    estimatedValue: params.estimatedValue,
    token: params.token,
    reason: params.reason,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "pending",
  };

  const queue = readApprovals();
  queue.pending.push(approval);
  writeApprovals(queue);

  return approval;
}

export function resolveApproval(
  id: string,
  status: "approved" | "rejected" | "expired"
): PendingApproval | null {
  const queue = readApprovals();
  const index = queue.pending.findIndex((a) => a.id === id);
  if (index === -1) return null;

  queue.pending[index].status = status;
  queue.pending[index].resolvedAt = new Date().toISOString();
  writeApprovals(queue);

  return queue.pending[index];
}

export function isApproved(
  apiKeyId: string,
  chainId: string,
  txTo?: string
): boolean {
  const queue = readApprovals();
  const now = new Date();

  return queue.pending.some((a) => {
    if (a.apiKeyId !== apiKeyId) return false;
    if (a.chainId !== chainId) return false;
    if (a.status !== "approved") return false;
    if (new Date(a.expiresAt) < now) return false;
    if (txTo !== undefined && a.transaction.to !== txTo) return false;
    return true;
  });
}
