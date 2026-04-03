import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { join } from "node:path";
import {
  backupAegisFiles,
  restoreAegisFiles,
  writeConfig,
  clearConfig,
  runPolicy,
  makePolicyContext,
} from "./helpers.js";

const BUDGET_SCRIPT = join(
  import.meta.dirname,
  "..",
  "..",
  "policies",
  "dist",
  "budget",
  "index.js"
);

beforeAll(() => {
  backupAegisFiles();
});

afterAll(() => {
  restoreAegisFiles();
});

beforeEach(() => {
  clearConfig("budget-config.json");
  clearConfig("budget-ledger.json");
  clearConfig("policy-log.json");
});

describe("aegis-budget policy", () => {
  it("allows transaction when no budget config exists", async () => {
    const result = await runPolicy(BUDGET_SCRIPT, makePolicyContext());
    expect(result.allow).toBe(true);
  });

  it("allows transaction within budget", async () => {
    writeConfig("budget-config.json", {
      limits: [{ chainId: "eip155:1", token: "ETH", daily: "100" }],
    });
    const ctx = makePolicyContext({ transaction: { to: "0xabc", value: "5.0" } });
    const result = await runPolicy(BUDGET_SCRIPT, ctx);
    expect(result.allow).toBe(true);
  });

  it("blocks transaction exceeding daily limit", async () => {
    // Pre-load ledger with existing spending
    writeConfig("budget-ledger.json", {
      entries: [
        {
          timestamp: new Date().toISOString(),
          apiKeyId: "test-agent",
          chainId: "eip155:1",
          token: "ETH",
          amount: "95",
        },
      ],
    });
    writeConfig("budget-config.json", {
      limits: [{ chainId: "eip155:1", token: "ETH", daily: "100" }],
    });
    const ctx = makePolicyContext({ transaction: { to: "0xabc", value: "10" } });
    const result = await runPolicy(BUDGET_SCRIPT, ctx);
    expect(result.allow).toBe(false);
    expect(result.reason).toContain("Daily");
    expect(result.reason).toContain("exceeded");
  });

  it("blocks transaction exceeding monthly limit", async () => {
    writeConfig("budget-ledger.json", {
      entries: [
        {
          timestamp: new Date().toISOString(),
          apiKeyId: "test-agent",
          chainId: "eip155:1",
          token: "ETH",
          amount: "490",
        },
      ],
    });
    writeConfig("budget-config.json", {
      limits: [{ chainId: "eip155:1", token: "ETH", monthly: "500" }],
    });
    const ctx = makePolicyContext({ transaction: { to: "0xabc", value: "20" } });
    const result = await runPolicy(BUDGET_SCRIPT, ctx);
    expect(result.allow).toBe(false);
    expect(result.reason).toContain("Monthly");
  });

  it("respects wildcard chain matching", async () => {
    writeConfig("budget-config.json", {
      limits: [{ chainId: "*", token: "ETH", daily: "10" }],
    });
    writeConfig("budget-ledger.json", {
      entries: [
        {
          timestamp: new Date().toISOString(),
          apiKeyId: "test-agent",
          chainId: "eip155:1",
          token: "ETH",
          amount: "9",
        },
      ],
    });
    const ctx = makePolicyContext({ transaction: { to: "0xabc", value: "5" } });
    const result = await runPolicy(BUDGET_SCRIPT, ctx);
    expect(result.allow).toBe(false);
  });

  it("respects wildcard token matching", async () => {
    writeConfig("budget-config.json", {
      limits: [{ chainId: "eip155:1", token: "*", daily: "10" }],
    });
    writeConfig("budget-ledger.json", {
      entries: [
        {
          timestamp: new Date().toISOString(),
          apiKeyId: "test-agent",
          chainId: "eip155:1",
          token: "ETH",
          amount: "9",
        },
      ],
    });
    // The policy uses extractToken which returns "ETH" for eip155, and wildcard matches any token
    const ctx = makePolicyContext({ transaction: { to: "0xabc", value: "5" } });
    const result = await runPolicy(BUDGET_SCRIPT, ctx);
    expect(result.allow).toBe(false);
  });
});
