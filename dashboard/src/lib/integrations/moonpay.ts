import type { FundingOption } from "./types";

export function getMoonPayFundingOptions(walletAddress: string): FundingOption {
  return {
    provider: "moonpay",
    command: `mp buy --currency usdc --wallet ${walletAddress}`,
    url: `https://www.moonpay.com/buy/usdc?walletAddress=${walletAddress}`,
    supportedTokens: ["USDC", "ETH", "SOL"],
    supportedChains: ["Ethereum", "Base", "Solana", "Polygon"],
  };
}
