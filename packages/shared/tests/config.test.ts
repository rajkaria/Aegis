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

describe("Budget config", () => {
  it("readBudgetConfig returns null when no file", async () => {
    const { readBudgetConfig } = await import("../src/config.js");
    expect(readBudgetConfig()).toBeNull();
  });

  it("writeBudgetConfig creates file and readBudgetConfig reads it", async () => {
    const { writeBudgetConfig, readBudgetConfig } = await import("../src/config.js");
    const config = {
      limits: [{ chainId: "eip155:1", token: "ETH", daily: "10", monthly: "100" }],
    };
    writeBudgetConfig(config);
    const result = readBudgetConfig();
    expect(result).toEqual(config);
  });
});

describe("Guard config", () => {
  it("readGuardConfig returns null when no file", async () => {
    const { readGuardConfig } = await import("../src/config.js");
    expect(readGuardConfig()).toBeNull();
  });

  it("writeGuardConfig creates file", async () => {
    const { writeGuardConfig, readGuardConfig } = await import("../src/config.js");
    const config = {
      mode: "allowlist" as const,
      addresses: { "eip155:1": ["0xabc"] },
    };
    writeGuardConfig(config);
    expect(readGuardConfig()).toEqual(config);
  });
});

describe("Deadswitch config", () => {
  it("readDeadswitchConfig returns null when no file", async () => {
    const { readDeadswitchConfig } = await import("../src/config.js");
    expect(readDeadswitchConfig()).toBeNull();
  });

  it("writeDeadswitchConfig creates file", async () => {
    const { writeDeadswitchConfig, readDeadswitchConfig } = await import("../src/config.js");
    const config = {
      maxInactiveMinutes: 30,
      onTrigger: "revoke_key" as const,
      sweepFunds: false,
      enabled: true,
    };
    writeDeadswitchConfig(config);
    expect(readDeadswitchConfig()).toEqual(config);
  });

  it("updateHeartbeat writes timestamp", async () => {
    const { writeDeadswitchConfig, readDeadswitchConfig, updateHeartbeat } = await import("../src/config.js");
    const config = {
      maxInactiveMinutes: 30,
      onTrigger: "revoke_key" as const,
      sweepFunds: false,
      enabled: true,
    };
    writeDeadswitchConfig(config);
    updateHeartbeat();
    const updated = readDeadswitchConfig();
    expect(updated?.lastHeartbeat).toBeDefined();
    // Should be a valid ISO date string
    expect(new Date(updated!.lastHeartbeat!).getTime()).not.toBeNaN();
  });
});
