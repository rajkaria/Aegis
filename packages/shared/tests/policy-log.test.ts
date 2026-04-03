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

describe("readPolicyLog", () => {
  it("returns empty when no file exists", async () => {
    const { readPolicyLog } = await import("../src/policy-log.js");
    expect(readPolicyLog()).toEqual({ entries: [] });
  });
});

describe("appendPolicyLog", () => {
  it("appends entries", async () => {
    const { appendPolicyLog, readPolicyLog } = await import("../src/policy-log.js");
    appendPolicyLog({
      timestamp: "2025-01-15T10:00:00Z",
      policyName: "aegis-budget",
      apiKeyId: "agent-1",
      chainId: "eip155:1",
      allowed: true,
    });
    appendPolicyLog({
      timestamp: "2025-01-15T11:00:00Z",
      policyName: "aegis-guard",
      apiKeyId: "agent-1",
      chainId: "eip155:1",
      allowed: false,
      reason: "not on allowlist",
    });
    const log = readPolicyLog();
    expect(log.entries).toHaveLength(2);
    expect(log.entries[0].allowed).toBe(true);
    expect(log.entries[1].allowed).toBe(false);
  });
});
