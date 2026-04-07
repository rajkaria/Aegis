/**
 * XMTP Client Manager
 *
 * Manages XMTP client lifecycle, identity, and key storage.
 * Each agent gets a unique XMTP identity derived from their wallet key.
 *
 * Environment Variables:
 *   XMTP_WALLET_KEY  — Hex-encoded private key for XMTP identity
 *   XMTP_ENV         — "production" | "dev" (default: "production")
 *   XMTP_DB_PATH     — Path to local XMTP database (default: ~/.ows/aegis/xmtp-db/)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { createHash, randomBytes } from "node:crypto";

// === Types ===

export interface XmtpClientConfig {
  /** Hex private key (without 0x prefix) */
  walletKey: string;
  /** XMTP network environment */
  env: "production" | "dev";
  /** Path for local XMTP message database */
  dbPath: string;
  /** Agent ID for this client */
  agentId: string;
}

export interface XmtpClientHandle {
  /** The initialized XMTP client */
  client: unknown;
  /** Agent's XMTP inbox address */
  inboxId: string;
  /** Agent's wallet address (derived from key) */
  address: string;
  /** Configuration used */
  config: XmtpClientConfig;
  /** Whether the client is connected */
  connected: boolean;
}

// === Key Management ===

const XMTP_DIR = join(homedir(), ".ows", "aegis", "xmtp");
const KEYS_FILE = join(XMTP_DIR, "agent-keys.json");

interface AgentKeyEntry {
  agentId: string;
  /** Hex-encoded encryption key for XMTP local DB */
  dbEncryptionKey: string;
  /** Wallet address derived from the agent's key */
  address: string;
  /** When this key was created */
  createdAt: string;
}

function ensureXmtpDir(): void {
  if (!existsSync(XMTP_DIR)) {
    mkdirSync(XMTP_DIR, { recursive: true });
  }
}

function loadKeyStore(): Record<string, AgentKeyEntry> {
  ensureXmtpDir();
  if (!existsSync(KEYS_FILE)) return {};
  try {
    return JSON.parse(readFileSync(KEYS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveKeyStore(store: Record<string, AgentKeyEntry>): void {
  ensureXmtpDir();
  writeFileSync(KEYS_FILE, JSON.stringify(store, null, 2));
}

/**
 * Derive a deterministic DB encryption key from the agent's wallet key.
 * This ensures the same agent always gets the same XMTP DB encryption key.
 */
function deriveDbEncryptionKey(walletKey: string): string {
  return createHash("sha256")
    .update(`aegis-xmtp-db-key:${walletKey}`)
    .digest("hex");
}

/**
 * Derive a wallet address from a hex private key.
 * Uses keccak256 of the public key (Ethereum-style).
 */
function deriveAddress(walletKey: string): string {
  // Use a deterministic hash as a stand-in when ethers is not available
  // In production, this uses the actual ethers Wallet derivation
  try {
    const { Wallet } = require("ethers") as typeof import("ethers");
    const w = new Wallet(walletKey.startsWith("0x") ? walletKey : `0x${walletKey}`);
    return w.address;
  } catch {
    // Fallback: deterministic address from key
    const hash = createHash("sha256").update(walletKey).digest("hex");
    return `0x${hash.slice(0, 40)}`;
  }
}

/**
 * Generate a random wallet key for a new agent.
 */
export function generateAgentKey(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Register an agent's XMTP identity in the local key store.
 */
export function registerAgentKey(agentId: string, walletKey: string): AgentKeyEntry {
  const store = loadKeyStore();
  const entry: AgentKeyEntry = {
    agentId,
    dbEncryptionKey: deriveDbEncryptionKey(walletKey),
    address: deriveAddress(walletKey),
    createdAt: new Date().toISOString(),
  };
  store[agentId] = entry;
  saveKeyStore(store);
  return entry;
}

/**
 * Get an agent's XMTP key entry from the store.
 */
export function getAgentKeyEntry(agentId: string): AgentKeyEntry | null {
  const store = loadKeyStore();
  return store[agentId] ?? null;
}

/**
 * List all registered agent identities.
 */
export function listAgentKeys(): AgentKeyEntry[] {
  return Object.values(loadKeyStore());
}

// === Client Lifecycle ===

/** Cache of initialized XMTP clients */
const clientCache = new Map<string, XmtpClientHandle>();

/**
 * Resolve XMTP client configuration from environment + agent ID.
 */
export function resolveConfig(agentId: string): XmtpClientConfig | null {
  const walletKey = process.env.XMTP_WALLET_KEY;
  if (!walletKey) return null;

  const env = (process.env.XMTP_ENV ?? "production") as "production" | "dev";
  const basePath = process.env.XMTP_DB_PATH ?? join(homedir(), ".ows", "aegis", "xmtp", "db");

  return {
    walletKey: walletKey.replace(/^0x/, ""),
    env,
    dbPath: join(basePath, agentId),
    agentId,
  };
}

/**
 * Initialize an XMTP client for the given agent.
 *
 * Requires @xmtp/node-sdk to be installed. Returns null if XMTP
 * is not configured (no XMTP_WALLET_KEY).
 *
 * The client is cached per agentId — subsequent calls return the same handle.
 */
export async function initXmtpClient(agentId: string): Promise<XmtpClientHandle | null> {
  // Return cached client if available
  const cached = clientCache.get(agentId);
  if (cached?.connected) return cached;

  const config = resolveConfig(agentId);
  if (!config) return null;

  // Ensure DB directory exists
  if (!existsSync(config.dbPath)) {
    mkdirSync(config.dbPath, { recursive: true });
  }

  // Register the key if not already done
  if (!getAgentKeyEntry(agentId)) {
    registerAgentKey(agentId, config.walletKey);
  }

  try {
    // Dynamic import so @xmtp/node-sdk is an optional dependency
    const xmtp = await import("@xmtp/node-sdk");
    const { Wallet } = await import("ethers");

    const wallet = new Wallet(
      config.walletKey.startsWith("0x") ? config.walletKey : `0x${config.walletKey}`
    );

    // Create XMTP signer from the wallet
    // The XMTP SDK signer interface varies by version; we construct
    // a compatible object and fall back gracefully.
    const signer: Record<string, unknown> = {
      type: "EOA",
      getAddress: () => wallet.address,
      getIdentifier: () => ({ identifier: wallet.address, identifierKind: "Ethereum" as const }),
      getChainId: () => BigInt(1),
      signMessage: async (message: string) => {
        const sig = await wallet.signMessage(message);
        // Return as Uint8Array if the SDK expects it
        return typeof sig === "string" ? Uint8Array.from(Buffer.from(sig.replace(/^0x/, ""), "hex")) : sig;
      },
    };

    // Derive DB encryption key
    const dbKeyHex = deriveDbEncryptionKey(config.walletKey);
    const dbEncryptionKey = Uint8Array.from(
      Buffer.from(dbKeyHex.slice(0, 64), "hex")
    );

    // Create the XMTP client — the API may accept (signer, key, opts)
    // or (signer, opts) depending on the SDK version
    let client: any;
    try {
      client = await (xmtp.Client as any).create(signer, dbEncryptionKey, {
        env: config.env,
        dbPath: config.dbPath,
      });
    } catch {
      // Fallback for different SDK signatures
      client = await (xmtp.Client as any).create(signer, {
        env: config.env,
        dbPath: config.dbPath,
        dbEncryptionKey,
      });
    }

    const handle: XmtpClientHandle = {
      client,
      inboxId: (client as any).inboxId ?? wallet.address,
      address: wallet.address,
      config,
      connected: true,
    };

    clientCache.set(agentId, handle);

    // Auto-register in the key store
    const entry = getAgentKeyEntry(agentId);
    if (entry && entry.address !== wallet.address) {
      registerAgentKey(agentId, config.walletKey);
    }

    return handle;
  } catch (err) {
    // XMTP SDK not installed or initialization failed
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[aegis-xmtp] Failed to init XMTP client for ${agentId}: ${errMsg}`);
    return null;
  }
}

/**
 * Get a cached XMTP client handle (does not initialize).
 */
export function getXmtpClient(agentId: string): XmtpClientHandle | null {
  return clientCache.get(agentId) ?? null;
}

/**
 * Close an XMTP client and remove from cache.
 */
export async function closeXmtpClient(agentId: string): Promise<void> {
  const handle = clientCache.get(agentId);
  if (!handle) return;

  try {
    if (handle.client && typeof (handle.client as any).close === "function") {
      await (handle.client as any).close();
    }
  } catch {
    // Ignore close errors
  }

  handle.connected = false;
  clientCache.delete(agentId);
}

/**
 * Close all XMTP clients.
 */
export async function closeAllClients(): Promise<void> {
  for (const agentId of clientCache.keys()) {
    await closeXmtpClient(agentId);
  }
}

/**
 * Check if XMTP is configured (environment variable present).
 */
export function isXmtpConfigured(): boolean {
  return !!process.env.XMTP_WALLET_KEY;
}
