#!/usr/bin/env node
import {
  readDeadswitchConfig,
  writeDeadswitchConfig,
  updateHeartbeat,
  appendPolicyLog,
} from "@aegis-ows/shared";
import type { PolicyContext, PolicyResult } from "@aegis-ows/shared";

async function main(): Promise<PolicyResult> {
  // Read PolicyContext from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  const ctx: PolicyContext = JSON.parse(raw);

  const config = readDeadswitchConfig();

  // If not enabled or null config → allow
  if (!config || !config.enabled) {
    const result: PolicyResult = { allow: true };
    appendPolicyLog({
      timestamp: new Date().toISOString(),
      policyName: "aegis-deadswitch",
      apiKeyId: ctx.apiKeyId,
      chainId: ctx.chainId,
      allowed: true,
      reason: "Deadswitch not enabled",
    });
    return result;
  }

  const now = new Date();

  // If no lastHeartbeat, set it to now (first activity) and allow
  if (!config.lastHeartbeat) {
    config.lastHeartbeat = now.toISOString();
    writeDeadswitchConfig(config);
    const result: PolicyResult = { allow: true };
    appendPolicyLog({
      timestamp: now.toISOString(),
      policyName: "aegis-deadswitch",
      apiKeyId: ctx.apiKeyId,
      chainId: ctx.chainId,
      allowed: true,
      reason: "First activity — heartbeat initialized",
    });
    return result;
  }

  // Calculate minutes since last heartbeat
  const lastHeartbeat = new Date(config.lastHeartbeat);
  const elapsedMinutes = (now.getTime() - lastHeartbeat.getTime()) / 60000;

  if (elapsedMinutes > config.maxInactiveMinutes) {
    const result: PolicyResult = {
      allow: false,
      reason: `Dead man's switch triggered: agent inactive for ${Math.floor(elapsedMinutes)} minutes`,
    };
    appendPolicyLog({
      timestamp: now.toISOString(),
      policyName: "aegis-deadswitch",
      apiKeyId: ctx.apiKeyId,
      chainId: ctx.chainId,
      allowed: false,
      reason: result.reason,
    });
    return result;
  }

  // Within threshold — update heartbeat and allow
  updateHeartbeat();
  const result: PolicyResult = { allow: true };
  appendPolicyLog({
    timestamp: now.toISOString(),
    policyName: "aegis-deadswitch",
    apiKeyId: ctx.apiKeyId,
    chainId: ctx.chainId,
    allowed: true,
    reason: `Heartbeat updated (${elapsedMinutes.toFixed(1)}min since last activity)`,
  });
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
      reason: `aegis-deadswitch error: ${message}`,
    };
    process.stdout.write(JSON.stringify(result));
  });
