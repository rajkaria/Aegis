import { z } from "zod";
import { fetchWithMpp } from "../payments/mpp-client.js";

export const payMppSchema = {
  url: z.string().url().describe("URL of the MPP-protected resource"),
  walletName: z.string().describe("Wallet to use for payment"),
  sessionId: z.string().optional().describe("Existing MPP session ID to reuse"),
  maxSessionCost: z.string().optional().describe("Maximum total session cost"),
};

export async function payMppHandler(params: {
  url: string;
  walletName: string;
  sessionId?: string;
  maxSessionCost?: string;
}): Promise<{ content: [{ type: "text"; text: string }] }> {
  const { url, walletName, sessionId, maxSessionCost } = params;

  const result = await fetchWithMpp(url, walletName, sessionId, maxSessionCost);

  let text: string;
  if (result.success) {
    text = [
      `SUCCESS: MPP payment completed`,
      `URL: ${url}`,
      `Session ID: ${result.sessionId ?? "N/A"}`,
      ``,
      `Response:`,
      result.content ?? "(empty)",
    ].join("\n");
  } else {
    text = [
      `ERROR: MPP payment failed`,
      `URL: ${url}`,
      `Reason: ${result.error ?? "Unknown error"}`,
      result.statusCode ? `Status: ${result.statusCode}` : "",
      result.sessionId ? `Session ID: ${result.sessionId}` : "",
    ]
      .filter((l) => l !== "")
      .join("\n");
  }

  return { content: [{ type: "text", text }] };
}
