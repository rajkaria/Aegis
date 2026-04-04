import { readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import type { PolicyLog, PolicyLogEntry } from "./types.js";
import { PATHS, ensureAegisDir } from "./paths.js";
import { withFileLock } from "./file-lock.js";

export function readPolicyLog(): PolicyLog {
  if (!existsSync(PATHS.policyLog)) {
    return { entries: [] };
  }
  try {
    const raw = readFileSync(PATHS.policyLog, "utf-8");
    return JSON.parse(raw) as PolicyLog;
  } catch {
    return { entries: [] };
  }
}

async function notifyWebhook(entry: PolicyLogEntry): Promise<void> {
  // Only notify on blocks
  if (entry.allowed) return;

  // Check for webhook config
  const webhookUrl = process.env.AEGIS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "policy_block",
        policy: entry.policyName,
        agent: entry.apiKeyId,
        chain: entry.chainId,
        reason: entry.reason,
        timestamp: entry.timestamp,
        source: "aegis",
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Webhook delivery is best-effort — don't block on failure
  }
}

export function appendPolicyLog(entry: PolicyLogEntry): void {
  withFileLock(PATHS.policyLog, () => {
    ensureAegisDir();
    const log = readPolicyLog();
    log.entries.push(entry);
    writeFileSync(PATHS.policyLog, JSON.stringify(log, null, 2), "utf-8");
  });

  // Fire webhook asynchronously (don't await — policy evaluation must be synchronous)
  notifyWebhook(entry).catch(() => {});
}
