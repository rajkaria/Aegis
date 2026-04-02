import { readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { ServiceEntry, ServiceRegistry } from "./types.js";
import { PATHS, ensureAegisDir } from "./paths.js";

export function readRegistry(): ServiceRegistry {
  if (!existsSync(PATHS.serviceRegistry)) {
    return { services: [] };
  }
  try {
    const raw = readFileSync(PATHS.serviceRegistry, "utf-8");
    return JSON.parse(raw) as ServiceRegistry;
  } catch {
    return { services: [] };
  }
}

function writeRegistry(registry: ServiceRegistry): void {
  ensureAegisDir();
  writeFileSync(PATHS.serviceRegistry, JSON.stringify(registry, null, 2), "utf-8");
}

export interface RegisterServiceParams {
  name: string;
  description: string;
  endpoint: string;
  price: string;
  token: string;
  protocol: "x402" | "mpp";
  chains: string[];
  registeredBy: string;
}

export function registerService(params: RegisterServiceParams): ServiceEntry {
  const entry: ServiceEntry = {
    id: randomUUID(),
    name: params.name,
    description: params.description,
    endpoint: params.endpoint,
    price: params.price,
    token: params.token,
    protocol: params.protocol,
    chains: params.chains,
    registeredBy: params.registeredBy,
    registeredAt: new Date().toISOString(),
  };

  const registry = readRegistry();
  registry.services.push(entry);
  writeRegistry(registry);

  return entry;
}

export function searchServices(
  query: string,
  maxPrice?: string,
  chain?: string,
  protocol?: "x402" | "mpp"
): ServiceEntry[] {
  const registry = readRegistry();
  const lowerQuery = query.toLowerCase();

  return registry.services.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.endpoint.toLowerCase().includes(lowerQuery);

    if (!matchesQuery) return false;

    if (maxPrice !== undefined && parseFloat(s.price) > parseFloat(maxPrice)) {
      return false;
    }

    if (chain !== undefined && !s.chains.includes(chain)) {
      return false;
    }

    if (protocol !== undefined && s.protocol !== protocol) {
      return false;
    }

    return true;
  });
}
