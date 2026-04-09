import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { privateKeyToAccount } from "viem/accounts";

const walletRegistry = new Map<string, {
  solanaKeypair?: Keypair;
  evmPrivateKey?: `0x${string}`;
  solanaPublicKey?: string;
  evmAddress?: string;
}>();

export function initOWSWallets(): void {
  const agentEnvMap: Record<string, { solKey: string; baseKey: string }> = {
    "data-miner": {
      solKey: process.env.DATA_MINER_SOL_KEY ?? "",
      baseKey: process.env.DATA_MINER_BASE_KEY ?? "",
    },
    analyst: {
      solKey: process.env.ANALYST_SOL_KEY ?? "",
      baseKey: process.env.ANALYST_BASE_KEY ?? "",
    },
    "research-buyer": {
      solKey: process.env.BUYER_SOL_KEY ?? "",
      baseKey: process.env.BUYER_BASE_KEY ?? "",
    },
  };

  for (const [agentId, keys] of Object.entries(agentEnvMap)) {
    const entry: {
      solanaKeypair?: Keypair;
      evmPrivateKey?: `0x${string}`;
      solanaPublicKey?: string;
      evmAddress?: string;
    } = {};

    if (keys.solKey) {
      try {
        const secretBytes = bs58.decode(keys.solKey);
        entry.solanaKeypair = Keypair.fromSecretKey(secretBytes);
        entry.solanaPublicKey = entry.solanaKeypair.publicKey.toBase58();
      } catch (err) {
        console.error(`[OWS] Failed to load Solana key for ${agentId}:`, (err as Error).message);
      }
    }

    if (keys.baseKey) {
      try {
        const pk = keys.baseKey.startsWith("0x") ? keys.baseKey as `0x${string}` : `0x${keys.baseKey}` as `0x${string}`;
        const account = privateKeyToAccount(pk);
        entry.evmPrivateKey = pk;
        entry.evmAddress = account.address;
      } catch (err) {
        console.error(`[OWS] Failed to load EVM key for ${agentId}:`, (err as Error).message);
      }
    }

    if (entry.solanaKeypair || entry.evmPrivateKey) {
      walletRegistry.set(agentId, entry);
      console.log(`[OWS] Registered wallet for ${agentId}:`, {
        solana: entry.solanaPublicKey ?? "none",
        evm: entry.evmAddress ?? "none",
      });
    }
  }
}

export function getSolanaKeypair(agentId: string): Keypair | null {
  return walletRegistry.get(agentId)?.solanaKeypair ?? null;
}

export function getEVMAccount(agentId: string): { privateKey: `0x${string}`; address: string } | null {
  const entry = walletRegistry.get(agentId);
  if (!entry?.evmPrivateKey || !entry.evmAddress) return null;
  return { privateKey: entry.evmPrivateKey, address: entry.evmAddress };
}

export function getSolanaAddress(agentId: string): string | null {
  return walletRegistry.get(agentId)?.solanaPublicKey ?? null;
}

export function getEVMAddress(agentId: string): string | null {
  return walletRegistry.get(agentId)?.evmAddress ?? null;
}
