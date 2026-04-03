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

describe("readEarningsLedger", () => {
  it("returns empty when no file exists", async () => {
    const { readEarningsLedger } = await import("../src/earnings.js");
    expect(readEarningsLedger()).toEqual({ entries: [] });
  });
});

describe("appendEarningsEntry", () => {
  it("creates and appends entries", async () => {
    const { appendEarningsEntry, readEarningsLedger } = await import("../src/earnings.js");
    const entry = {
      timestamp: "2025-01-15T10:00:00Z",
      agentId: "seller-1",
      endpoint: "/api/data",
      fromAgent: "buyer-1",
      token: "USDC",
      amount: "0.01",
    };
    appendEarningsEntry(entry);
    appendEarningsEntry({ ...entry, amount: "0.02" });

    const ledger = readEarningsLedger();
    expect(ledger.entries).toHaveLength(2);
    expect(ledger.entries[0].amount).toBe("0.01");
    expect(ledger.entries[1].amount).toBe("0.02");
  });
});

describe("getEarningsByAgent", () => {
  it("filters correctly by agentId", async () => {
    const { appendEarningsEntry, getEarningsByAgent } = await import("../src/earnings.js");
    appendEarningsEntry({
      timestamp: "2025-01-15T10:00:00Z",
      agentId: "seller-1",
      endpoint: "/api/data",
      fromAgent: "buyer-1",
      token: "USDC",
      amount: "0.01",
    });
    appendEarningsEntry({
      timestamp: "2025-01-15T11:00:00Z",
      agentId: "seller-2",
      endpoint: "/api/other",
      fromAgent: "buyer-1",
      token: "USDC",
      amount: "0.05",
    });

    const result = getEarningsByAgent("seller-1");
    expect(result).toHaveLength(1);
    expect(result[0].agentId).toBe("seller-1");
  });
});
