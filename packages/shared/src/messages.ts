import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { PATHS, ensureAegisDir } from "./paths.js";

export interface ServiceAnnouncement {
  type: "service_announcement";
  agentId: string;
  timestamp: string;
  services: {
    endpoint: string;
    price: string;
    token: string;
    description: string;
    baseUrl: string;
  }[];
}

export interface ServiceQuery {
  type: "service_query";
  agentId: string;
  timestamp: string;
  query: string;
}

export interface ServiceResponse {
  type: "service_response";
  agentId: string;
  timestamp: string;
  inResponseTo: string;
  matches: {
    endpoint: string;
    price: string;
    description: string;
    fullUrl: string;
  }[];
}

export type AgentMessage = ServiceAnnouncement | ServiceQuery | ServiceResponse;

export interface MessageBus {
  messages: AgentMessage[];
}

export function readMessages(): MessageBus {
  if (!existsSync(PATHS.messageBus)) return { messages: [] };
  return JSON.parse(readFileSync(PATHS.messageBus, "utf-8")) as MessageBus;
}

export function postMessage(msg: AgentMessage): void {
  ensureAegisDir();
  const bus = readMessages();
  bus.messages.push(msg);
  writeFileSync(PATHS.messageBus, JSON.stringify(bus, null, 2));
}

export function getAnnouncements(): ServiceAnnouncement[] {
  return readMessages().messages.filter(
    (m): m is ServiceAnnouncement => m.type === "service_announcement"
  );
}

export function discoverServices(query: string): ServiceAnnouncement["services"][number][] {
  const announcements = getAnnouncements();
  const q = query.toLowerCase();
  const matches: ServiceAnnouncement["services"][number][] = [];
  for (const ann of announcements) {
    for (const svc of ann.services) {
      if (
        svc.description.toLowerCase().includes(q) ||
        svc.endpoint.toLowerCase().includes(q)
      ) {
        matches.push(svc);
      }
    }
  }
  return matches;
}
