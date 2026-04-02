import { readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import type { PolicyLog, PolicyLogEntry } from "./types.js";
import { PATHS, ensureAegisDir } from "./paths.js";

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

export function appendPolicyLog(entry: PolicyLogEntry): void {
  ensureAegisDir();
  const log = readPolicyLog();
  log.entries.push(entry);
  writeFileSync(PATHS.policyLog, JSON.stringify(log, null, 2), "utf-8");
}
