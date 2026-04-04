import { writeFileSync, unlinkSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";

const LOCK_TIMEOUT_MS = 5000; // Max wait for lock
const LOCK_STALE_MS = 10000; // Consider lock stale after this
const POLL_INTERVAL_MS = 50;

function sleepSync(ms: number): void {
  // Use Atomics.wait for efficient synchronous sleep (no CPU spin)
  const buf = new SharedArrayBuffer(4);
  const arr = new Int32Array(buf);
  Atomics.wait(arr, 0, 0, ms);
}

export function withFileLock<T>(filePath: string, fn: () => T): T {
  const lockPath = filePath + ".lock";
  const startTime = Date.now();

  // Wait for existing lock to be released
  while (existsSync(lockPath)) {
    // Check if lock is stale
    try {
      const stats = statSync(lockPath);
      if (Date.now() - stats.mtimeMs > LOCK_STALE_MS) {
        // Stale lock — remove it
        try { unlinkSync(lockPath); } catch {}
        break;
      }
    } catch {
      break; // Lock file disappeared
    }

    if (Date.now() - startTime > LOCK_TIMEOUT_MS) {
      // Timeout — proceed without lock (better than deadlock)
      break;
    }

    sleepSync(POLL_INTERVAL_MS); // Efficient non-spinning wait
  }

  // Acquire lock
  try {
    const dir = dirname(lockPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(lockPath, `${process.pid}:${Date.now()}`, { flag: "wx" });
  } catch {
    // Failed to acquire exclusively — another process got it
    // Proceed anyway (worst case: one write is lost, better than crash)
  }

  try {
    return fn();
  } finally {
    // Release lock
    try { unlinkSync(lockPath); } catch {}
  }
}
