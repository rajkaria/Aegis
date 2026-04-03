import { execSync } from "node:child_process";
import type { FundingOption } from "./types.js";

export function getMoonPayFundingOptions(walletAddress: string): FundingOption {
  return {
    provider: "moonpay",
    command: `mp buy --currency usdc --wallet ${walletAddress}`,
    url: `https://www.moonpay.com/buy/usdc?walletAddress=${walletAddress}`,
    supportedTokens: ["USDC", "ETH", "SOL"],
    supportedChains: ["Ethereum", "Base", "Solana", "Polygon"],
  };
}

export function isMoonPayInstalled(): boolean {
  try {
    execSync("mp --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function getMoonPayWallets(): string[] {
  try {
    const output = execSync("mp wallet list --json", { stdio: "pipe" }).toString();
    const wallets = JSON.parse(output) as Array<{ address: string }>;
    return wallets.map((w) => w.address);
  } catch {
    return [];
  }
}
