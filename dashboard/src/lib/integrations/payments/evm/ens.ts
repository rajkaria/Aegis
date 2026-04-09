import { getPublicClient } from "./provider";
import { normalize } from "viem/ens";

// ---------------------------------------------------------------------------
// ENS resolution helpers
// ---------------------------------------------------------------------------

/**
 * Resolve an ENS name (e.g. "vitalik.eth") to its Ethereum address.
 * Returns null if the name is not registered or resolution fails.
 * Always uses Ethereum mainnet (eip155:1) for ENS lookups.
 */
export async function resolveENS(name: string): Promise<string | null> {
  try {
    const client = getPublicClient("eip155:1");
    const address = await client.getEnsAddress({
      name: normalize(name),
    });
    return address ?? null;
  } catch {
    return null;
  }
}

/**
 * Reverse-resolve an Ethereum address to its primary ENS name.
 * Returns null if no primary name is set or resolution fails.
 * Always uses Ethereum mainnet (eip155:1) for ENS lookups.
 */
export async function reverseResolveENS(address: string): Promise<string | null> {
  try {
    const client = getPublicClient("eip155:1");
    const name = await client.getEnsName({
      address: address as `0x${string}`,
    });
    return name ?? null;
  } catch {
    return null;
  }
}

/**
 * Accept either a raw 0x address or an ENS name and return a resolved address.
 * - If the input looks like a 0x address (starts with "0x" and is 42 chars), return as-is.
 * - Otherwise, attempt ENS resolution.
 * - Throws if ENS resolution fails or returns null.
 */
export async function resolveAddressOrENS(nameOrAddress: string): Promise<string> {
  if (nameOrAddress.startsWith("0x") && nameOrAddress.length === 42) {
    return nameOrAddress;
  }

  const resolved = await resolveENS(nameOrAddress);
  if (!resolved) {
    throw new Error(`ENS resolution failed for: ${nameOrAddress}`);
  }
  return resolved;
}
