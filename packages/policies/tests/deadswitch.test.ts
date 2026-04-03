import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { join } from "node:path";
import {
  backupAegisFiles,
  restoreAegisFiles,
  writeConfig,
  clearConfig,
  readConfig,
  runPolicy,
  makePolicyContext,
} from "./helpers.js";

const DEADSWITCH_SCRIPT = join(
  import.meta.dirname,
  "..",
  "..",
  "policies",
  "dist",
  "deadswitch",
  "index.js"
);

beforeAll(() => {
  backupAegisFiles();
});

afterAll(() => {
  restoreAegisFiles();
});

beforeEach(() => {
  clearConfig("deadswitch-config.json");
  clearConfig("policy-log.json");
});

describe("aegis-deadswitch policy", () => {
  it("allows when config is null (no file)", async () => {
    const result = await runPolicy(DEADSWITCH_SCRIPT, makePolicyContext());
    expect(result.allow).toBe(true);
  });

  it("allows when config is disabled", async () => {
    writeConfig("deadswitch-config.json", {
      maxInactiveMinutes: 30,
      onTrigger: "revoke_key",
      sweepFunds: false,
      enabled: false,
    });
    const result = await runPolicy(DEADSWITCH_SCRIPT, makePolicyContext());
    expect(result.allow).toBe(true);
  });

  it("allows and sets initial heartbeat when no lastHeartbeat", async () => {
    writeConfig("deadswitch-config.json", {
      maxInactiveMinutes: 30,
      onTrigger: "revoke_key",
      sweepFunds: false,
      enabled: true,
    });
    const result = await runPolicy(DEADSWITCH_SCRIPT, makePolicyContext());
    expect(result.allow).toBe(true);

    // Verify heartbeat was written
    const config = readConfig("deadswitch-config.json") as { lastHeartbeat?: string };
    expect(config.lastHeartbeat).toBeDefined();
  });

  it("allows when within timeout and updates heartbeat", async () => {
    const recentHeartbeat = new Date(Date.now() - 5 * 60000).toISOString(); // 5 min ago
    writeConfig("deadswitch-config.json", {
      maxInactiveMinutes: 30,
      onTrigger: "revoke_key",
      sweepFunds: false,
      enabled: true,
      lastHeartbeat: recentHeartbeat,
    });
    const result = await runPolicy(DEADSWITCH_SCRIPT, makePolicyContext());
    expect(result.allow).toBe(true);
  });

  it("blocks when inactive beyond maxInactiveMinutes", async () => {
    const oldHeartbeat = new Date(Date.now() - 60 * 60000).toISOString(); // 60 min ago
    writeConfig("deadswitch-config.json", {
      maxInactiveMinutes: 30,
      onTrigger: "revoke_key",
      sweepFunds: false,
      enabled: true,
      lastHeartbeat: oldHeartbeat,
    });
    const result = await runPolicy(DEADSWITCH_SCRIPT, makePolicyContext());
    expect(result.allow).toBe(false);
    expect(result.reason).toContain("inactive");
  });
});
