import { z } from "zod";
import { searchServices } from "@aegis-ows/shared";
import type { ServiceEntry } from "@aegis-ows/shared";

export const discoverServicesSchema = {
  query: z.string().describe("Search query for discovering services"),
  maxPrice: z.string().optional().describe("Maximum price filter"),
  chain: z.string().optional().describe("Filter by chain ID"),
  protocol: z.enum(["x402", "mpp", "any"]).optional().describe("Filter by payment protocol"),
};

export async function discoverServicesHandler(params: {
  query: string;
  maxPrice?: string;
  chain?: string;
  protocol?: "x402" | "mpp" | "any";
}): Promise<{ content: [{ type: "text"; text: string }] }> {
  const { query, maxPrice, chain, protocol } = params;

  const protocolFilter = protocol === "any" ? undefined : protocol;
  const results: ServiceEntry[] = searchServices(query, maxPrice, chain, protocolFilter);

  if (results.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No services found matching "${query}"${maxPrice ? ` with max price ${maxPrice}` : ""}${chain ? ` on chain ${chain}` : ""}${protocol && protocol !== "any" ? ` using ${protocol}` : ""}.`,
        },
      ],
    };
  }

  const lines: string[] = [
    `Found ${results.length} service${results.length === 1 ? "" : "s"} matching "${query}":`,
    "",
  ];

  for (const svc of results) {
    lines.push(`--- ${svc.name} ---`);
    lines.push(`ID: ${svc.id}`);
    lines.push(`Description: ${svc.description}`);
    lines.push(`Endpoint: ${svc.endpoint}`);
    lines.push(`Price: ${svc.price} ${svc.token}`);
    lines.push(`Protocol: ${svc.protocol}`);
    lines.push(`Chains: ${svc.chains.join(", ")}`);
    lines.push(`Registered by: ${svc.registeredBy}`);
    lines.push(`Registered at: ${svc.registeredAt}`);
    lines.push("");
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}
