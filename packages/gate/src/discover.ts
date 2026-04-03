import { discoverServices, postMessage, type ServiceQuery } from "@aegis-ows/shared";

export interface DiscoveredService {
  endpoint: string;
  price: string;
  token: string;
  description: string;
  fullUrl: string;
}

export function findServices(query: string, callerAgentId: string): DiscoveredService[] {
  // Post a query message to the bus (for visibility in dashboard)
  const queryMsg: ServiceQuery = {
    type: "service_query",
    agentId: callerAgentId,
    timestamp: new Date().toISOString(),
    query,
  };
  postMessage(queryMsg);

  // Search announcements
  const matches = discoverServices(query);
  return matches.map((m) => ({
    endpoint: m.endpoint,
    price: m.price,
    token: m.token,
    description: m.description,
    fullUrl: m.baseUrl + m.endpoint,
  }));
}
