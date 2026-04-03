import { listWallets, getWallet, listPolicies, listApiKeys } from "@open-wallet-standard/core";
import type { WalletInfo, AccountInfo } from "@open-wallet-standard/core";

export interface OWSWalletInfo {
  id: string;
  name: string;
  addresses: Record<string, string>;
}

/** Convert WalletInfo accounts array to a chainId -> address map. */
function accountsToAddresses(accounts: AccountInfo[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const a of accounts) {
    map[a.chainId] = a.address;
  }
  return map;
}

function toOWSWalletInfo(w: WalletInfo): OWSWalletInfo {
  return {
    id: w.id,
    name: w.name,
    addresses: accountsToAddresses(w.accounts),
  };
}

export function getOWSWallets(): OWSWalletInfo[] {
  try {
    const wallets = listWallets();
    return wallets.map(toOWSWalletInfo);
  } catch {
    return [];
  }
}

export function getOWSWallet(name: string): OWSWalletInfo | null {
  try {
    const wallet = getWallet(name);
    if (!wallet) return null;
    return toOWSWalletInfo(wallet);
  } catch {
    return null;
  }
}

export function getOWSPolicies() {
  try {
    return listPolicies();
  } catch {
    return [];
  }
}

export function getOWSApiKeys() {
  try {
    return listApiKeys();
  } catch {
    return [];
  }
}
