import { z } from "zod";
import { registerService } from "@aegis-ows/shared";

export const registerServiceSchema = {
  name: z.string().describe("Service name"),
  description: z.string().describe("Service description"),
  endpoint: z.string().url().describe("Service endpoint URL"),
  price: z.string().describe("Price per request"),
  token: z.string().default("USDC").describe("Payment token (default: USDC)"),
  protocol: z.enum(["x402", "mpp"]).describe("Payment protocol"),
  chains: z.array(z.string()).describe("Supported chain IDs"),
  registeredBy: z.string().describe("Wallet name registering this service"),
};

export async function registerServiceHandler(params: {
  name: string;
  description: string;
  endpoint: string;
  price: string;
  token: string;
  protocol: "x402" | "mpp";
  chains: string[];
  registeredBy: string;
}): Promise<{ content: [{ type: "text"; text: string }] }> {
  const entry = registerService(params);

  const text = [
    `SUCCESS: Service registered`,
    ``,
    `ID: ${entry.id}`,
    `Name: ${entry.name}`,
    `Description: ${entry.description}`,
    `Endpoint: ${entry.endpoint}`,
    `Price: ${entry.price} ${entry.token}`,
    `Protocol: ${entry.protocol}`,
    `Chains: ${entry.chains.join(", ")}`,
    `Registered by: ${entry.registeredBy}`,
    `Registered at: ${entry.registeredAt}`,
  ].join("\n");

  return { content: [{ type: "text", text }] };
}
