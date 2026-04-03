import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDir, cleanTestDir, mockPaths } from "./test-helpers.js";

let testDir: string;
let paths: ReturnType<typeof mockPaths>;

beforeEach(() => {
  testDir = createTestDir();
  paths = mockPaths(testDir);
  vi.doMock("../src/paths.js", () => ({
    PATHS: paths,
    ensureAegisDir: () => {},
  }));
});

afterEach(() => {
  cleanTestDir(testDir);
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("readLedger", () => {
  it("returns empty entries when no file exists", async () => {
    const { readLedger } = await import("../src/ledger.js");
    const result = readLedger();
    expect(result).toEqual({ entries: [] });
  });
});

describe("appendLedgerEntry", () => {
  it("creates file and adds entry", async () => {
    const { appendLedgerEntry, readLedger } = await import("../src/ledger.js");
    const entry = {
      timestamp: "2025-01-15T10:00:00Z",
      apiKeyId: "agent-1",
      chainId: "eip155:1",
      token: "ETH",
      amount: "0.5",
    };
    appendLedgerEntry(entry);
    const ledger = readLedger();
    expect(ledger.entries).toHaveLength(1);
    expect(ledger.entries[0]).toEqual(entry);
  });

  it("appends to existing entries", async () => {
    const { appendLedgerEntry, readLedger } = await import("../src/ledger.js");
    appendLedgerEntry({
      timestamp: "2025-01-15T10:00:00Z",
      apiKeyId: "agent-1",
      chainId: "eip155:1",
      token: "ETH",
      amount: "0.5",
    });
    appendLedgerEntry({
      timestamp: "2025-01-15T11:00:00Z",
      apiKeyId: "agent-1",
      chainId: "eip155:1",
      token: "ETH",
      amount: "1.0",
    });
    const ledger = readLedger();
    expect(ledger.entries).toHaveLength(2);
  });
});

describe("getSpentInPeriod", () => {
  it("filters by apiKeyId, chainId, token correctly", async () => {
    const { getSpentInPeriod } = await import("../src/ledger.js");
    const now = new Date().toISOString();
    const ledger = {
      entries: [
        { timestamp: now, apiKeyId: "agent-1", chainId: "eip155:1", token: "ETH", amount: "1.0" },
        { timestamp: now, apiKeyId: "agent-2", chainId: "eip155:1", token: "ETH", amount: "2.0" },
        { timestamp: now, apiKeyId: "agent-1", chainId: "solana:mainnet", token: "SOL", amount: "3.0" },
      ],
    };
    const result = getSpentInPeriod(ledger, "agent-1", "eip155:1", "ETH", "daily");
    expect(result).toBe(1.0);
  });

  it("returns 0 when no entries match", async () => {
    const { getSpentInPeriod } = await import("../src/ledger.js");
    const ledger = { entries: [] };
    const result = getSpentInPeriod(ledger, "agent-1", "eip155:1", "ETH", "daily");
    expect(result).toBe(0);
  });

  it("handles daily cutoff correctly", async () => {
    const { getSpentInPeriod } = await import("../src/ledger.js");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const ledger = {
      entries: [
        { timestamp: today.toISOString(), apiKeyId: "a", chainId: "c", token: "T", amount: "1.0" },
        { timestamp: yesterday.toISOString(), apiKeyId: "a", chainId: "c", token: "T", amount: "2.0" },
      ],
    };
    const result = getSpentInPeriod(ledger, "a", "c", "T", "daily");
    // Only today's entry should be counted
    expect(result).toBe(1.0);
  });

  it("handles monthly cutoff correctly", async () => {
    const { getSpentInPeriod } = await import("../src/ledger.js");
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 5).toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString();

    const ledger = {
      entries: [
        { timestamp: thisMonth, apiKeyId: "a", chainId: "c", token: "T", amount: "5.0" },
        { timestamp: lastMonth, apiKeyId: "a", chainId: "c", token: "T", amount: "10.0" },
      ],
    };
    const result = getSpentInPeriod(ledger, "a", "c", "T", "monthly");
    expect(result).toBe(5.0);
  });
});
