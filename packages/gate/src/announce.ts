import { postMessage, type ServiceAnnouncement } from "@aegis-ows/shared";
import type { AegisConfig } from "./index.js";

export function announceServices(config: AegisConfig, baseUrl: string): void {
  const services = Object.entries(config.endpoints)
    .filter(([_, ep]) => ep.price !== "0")
    .map(([path, ep]) => ({
      endpoint: path,
      price: ep.price,
      token: ep.token ?? "USDC",
      description: ep.description ?? path,
      baseUrl,
    }));

  const announcement: ServiceAnnouncement = {
    type: "service_announcement",
    agentId: config.walletName,
    timestamp: new Date().toISOString(),
    services,
  };

  postMessage(announcement);
}
