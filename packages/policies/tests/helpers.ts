import { execSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, copyFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const AEGIS_DIR = join(homedir(), ".ows", "aegis");

// Files we may write/read during tests
const CONFIG_FILES = [
  "budget-config.json",
  "guard-config.json",
  "deadswitch-config.json",
  "budget-ledger.json",
  "earnings-ledger.json",
  "policy-log.json",
  "messages.json",
];

const BACKUP_SUFFIX = ".test-backup";

export function backupAegisFiles(): void {
  mkdirSync(AEGIS_DIR, { recursive: true });
  for (const file of CONFIG_FILES) {
    const path = join(AEGIS_DIR, file);
    if (existsSync(path)) {
      copyFileSync(path, path + BACKUP_SUFFIX);
    }
  }
}

export function restoreAegisFiles(): void {
  for (const file of CONFIG_FILES) {
    const path = join(AEGIS_DIR, file);
    const backup = path + BACKUP_SUFFIX;
    if (existsSync(backup)) {
      copyFileSync(backup, path);
      rmSync(backup);
    } else if (existsSync(path)) {
      rmSync(path);
    }
  }
}

export function writeConfig(filename: string, data: unknown): void {
  writeFileSync(join(AEGIS_DIR, filename), JSON.stringify(data, null, 2));
}

export function readConfig(filename: string): unknown {
  const path = join(AEGIS_DIR, filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export function clearConfig(filename: string): void {
  const path = join(AEGIS_DIR, filename);
  if (existsSync(path)) rmSync(path);
}

export function runPolicy(policyPath: string, input: unknown): Promise<{ allow: boolean; reason?: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [policyPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch {
        reject(new Error(`Failed to parse policy output: ${stdout}\nStderr: ${stderr}`));
      }
    });

    child.on("error", reject);

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

export function makePolicyContext(overrides: Record<string, unknown> = {}) {
  return {
    transaction: { to: "0x1234567890abcdef", value: "1.0" },
    chainId: "eip155:1",
    wallet: { id: "w1", name: "test-wallet", addresses: {} },
    timestamp: new Date().toISOString(),
    apiKeyId: "test-agent",
    ...overrides,
  };
}
