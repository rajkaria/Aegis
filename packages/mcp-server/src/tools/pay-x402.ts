import { z } from "zod";
import { fetchWithX402 } from "../payments/x402-client.js";

export const payX402Schema = {
  url: z.string().url().describe("URL of the x402-protected resource"),
  walletName: z.string().describe("Wallet to use for payment"),
  chain: z.string().optional().describe("Chain to use for payment"),
  maxAmount: z.string().optional().describe("Maximum amount to pay"),
};

export async function payX402Handler(params: {
  url: string;
  walletName: string;
  chain?: string;
  maxAmount?: string;
}): Promise<{ content: [{ type: "text"; text: string }] }> {
  const { url, walletName, chain, maxAmount } = params;

  const result = await fetchWithX402(url, walletName, chain, maxAmount);

  let text: string;
  if (result.success) {
    text = [
      `SUCCESS: x402 payment completed`,
      `URL: ${url}`,
      result.paymentDetails
        ? `Payment: ${result.paymentDetails.amount} ${result.paymentDetails.token} on ${result.paymentDetails.network}`
        : "",
      ``,
      `Response:`,
      result.content ?? "(empty)",
    ]
      .filter((l) => l !== "")
      .join("\n");
  } else {
    text = [
      `ERROR: x402 payment failed`,
      `URL: ${url}`,
      `Reason: ${result.error ?? "Unknown error"}`,
      result.statusCode ? `Status: ${result.statusCode}` : "",
      result.paymentDetails
        ? `Payment required: ${result.paymentDetails.amount} ${result.paymentDetails.token}`
        : "",
    ]
      .filter((l) => l !== "")
      .join("\n");
  }

  return { content: [{ type: "text", text }] };
}
