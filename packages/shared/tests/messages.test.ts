import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDir, cleanTestDir, mockPaths } from "./test-helpers.js";

let testDir: string;

beforeEach(() => {
  testDir = createTestDir();
  vi.doMock("../src/paths.js", () => ({
    PATHS: mockPaths(testDir),
    ensureAegisDir: () => {},
  }));
});

afterEach(() => {
  cleanTestDir(testDir);
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("readMessages", () => {
  it("returns empty when no file exists", async () => {
    const { readMessages } = await import("../src/messages.js");
    expect(readMessages()).toEqual({ messages: [] });
  });
});

describe("postMessage", () => {
  it("appends to bus", async () => {
    const { postMessage, readMessages } = await import("../src/messages.js");
    postMessage({
      type: "service_announcement",
      agentId: "agent-1",
      timestamp: "2025-01-15T10:00:00Z",
      services: [
        {
          endpoint: "/api/weather",
          price: "0.01",
          token: "USDC",
          description: "Weather data API",
          baseUrl: "https://weather.agent.example",
        },
      ],
    });
    const bus = readMessages();
    expect(bus.messages).toHaveLength(1);
    expect(bus.messages[0].type).toBe("service_announcement");
  });
});

describe("discoverServices", () => {
  it("matches by description", async () => {
    const { postMessage, discoverServices } = await import("../src/messages.js");
    postMessage({
      type: "service_announcement",
      agentId: "agent-1",
      timestamp: "2025-01-15T10:00:00Z",
      services: [
        { endpoint: "/api/weather", price: "0.01", token: "USDC", description: "Weather data API", baseUrl: "http://localhost" },
        { endpoint: "/api/stocks", price: "0.05", token: "USDC", description: "Stock market data", baseUrl: "http://localhost" },
      ],
    });
    const matches = discoverServices("weather");
    expect(matches).toHaveLength(1);
    expect(matches[0].endpoint).toBe("/api/weather");
  });

  it("matches by endpoint", async () => {
    const { postMessage, discoverServices } = await import("../src/messages.js");
    postMessage({
      type: "service_announcement",
      agentId: "agent-1",
      timestamp: "2025-01-15T10:00:00Z",
      services: [
        { endpoint: "/api/translate", price: "0.02", token: "USDC", description: "Translation service", baseUrl: "http://localhost" },
      ],
    });
    const matches = discoverServices("translate");
    expect(matches).toHaveLength(1);
  });
});

describe("getAnnouncements", () => {
  it("filters by type", async () => {
    const { postMessage, getAnnouncements } = await import("../src/messages.js");
    postMessage({
      type: "service_announcement",
      agentId: "agent-1",
      timestamp: "2025-01-15T10:00:00Z",
      services: [],
    });
    postMessage({
      type: "service_query",
      agentId: "agent-2",
      timestamp: "2025-01-15T11:00:00Z",
      query: "looking for weather",
    });
    const announcements = getAnnouncements();
    expect(announcements).toHaveLength(1);
    expect(announcements[0].agentId).toBe("agent-1");
  });
});
