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

describe("computeAgentProfile", () => {
  it("calculates revenue from earnings", async () => {
    const { appendEarningsEntry } = await import("../src/earnings.js");
    appendEarningsEntry({
      timestamp: "2025-01-15T10:00:00Z",
      agentId: "agent-A",
      endpoint: "/api/data",
      fromAgent: "agent-B",
      token: "USDC",
      amount: "1.50",
    });
    appendEarningsEntry({
      timestamp: "2025-01-15T11:00:00Z",
      agentId: "agent-A",
      endpoint: "/api/data",
      fromAgent: "agent-C",
      token: "USDC",
      amount: "2.50",
    });

    const { computeAgentProfile } = await import("../src/agent-profile.js");
    const profile = computeAgentProfile("agent-A");
    expect(profile.totalRevenue).toBe(4.0);
  });

  it("calculates spending from ledger", async () => {
    const { appendLedgerEntry } = await import("../src/ledger.js");
    appendLedgerEntry({
      timestamp: "2025-01-15T10:00:00Z",
      apiKeyId: "agent-A",
      chainId: "eip155:1",
      token: "USDC",
      amount: "0.75",
      tool: "vendor-X",
    });

    const { computeAgentProfile } = await import("../src/agent-profile.js");
    const profile = computeAgentProfile("agent-A");
    expect(profile.totalSpending).toBe(0.75);
  });

  it("calculates P&L correctly", async () => {
    const { appendEarningsEntry } = await import("../src/earnings.js");
    const { appendLedgerEntry } = await import("../src/ledger.js");

    appendEarningsEntry({
      timestamp: "2025-01-15T10:00:00Z",
      agentId: "agent-A",
      endpoint: "/api/data",
      fromAgent: "agent-B",
      token: "USDC",
      amount: "10.00",
    });
    appendLedgerEntry({
      timestamp: "2025-01-15T10:00:00Z",
      apiKeyId: "agent-A",
      chainId: "eip155:1",
      token: "USDC",
      amount: "3.00",
      tool: "vendor-X",
    });

    const { computeAgentProfile } = await import("../src/agent-profile.js");
    const profile = computeAgentProfile("agent-A");
    expect(profile.profitLoss).toBe(7.0);
  });
});

describe("computeAllProfiles", () => {
  it("discovers all unique agent IDs", async () => {
    const { appendEarningsEntry } = await import("../src/earnings.js");
    const { appendLedgerEntry } = await import("../src/ledger.js");

    appendEarningsEntry({
      timestamp: "2025-01-15T10:00:00Z",
      agentId: "seller-1",
      endpoint: "/api/data",
      fromAgent: "buyer-1",
      token: "USDC",
      amount: "1.00",
    });
    appendLedgerEntry({
      timestamp: "2025-01-15T10:00:00Z",
      apiKeyId: "buyer-1",
      chainId: "eip155:1",
      token: "USDC",
      amount: "1.00",
    });

    const { computeAllProfiles } = await import("../src/agent-profile.js");
    const profiles = computeAllProfiles();
    const ids = profiles.map((p) => p.agentId).sort();
    expect(ids).toEqual(["buyer-1", "seller-1"]);
  });
});

describe("computeSankeyData", () => {
  it("creates correct nodes and links", async () => {
    const { appendEarningsEntry } = await import("../src/earnings.js");

    appendEarningsEntry({
      timestamp: "2025-01-15T10:00:00Z",
      agentId: "seller-1",
      endpoint: "/api/data",
      fromAgent: "buyer-1",
      token: "USDC",
      amount: "5.00",
    });
    appendEarningsEntry({
      timestamp: "2025-01-15T11:00:00Z",
      agentId: "seller-1",
      endpoint: "/api/data",
      fromAgent: "buyer-1",
      token: "USDC",
      amount: "3.00",
    });

    const { computeSankeyData } = await import("../src/agent-profile.js");
    const data = computeSankeyData();

    expect(data.nodes).toHaveLength(2);
    expect(data.links).toHaveLength(1);
    expect(data.links[0].value).toBe(8.0);
  });
});
