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

const GUARD_SCRIPT = join(
  import.meta.dirname,
  "..",
  "..",
  "policies",
  "dist",
  "guard",
  "index.js"
);

beforeAll(() => {
  backupAegisFiles();
});

afterAll(() => {
  restoreAegisFiles();
});

beforeEach(() => {
  clearConfig("guard-config.json");
  clearConfig("policy-log.json");
});

describe("aegis-guard policy", () => {
  it("allows when no guard config", async () => {
    const result = await runPolicy(GUARD_SCRIPT, makePolicyContext());
    expect(result.allow).toBe(true);
  });

  it("allows address on allowlist", async () => {
    writeConfig("guard-config.json", {
      mode: "allowlist",
      addresses: { "eip155:1": ["0x1234567890abcdef"] },
    });
    const ctx = makePolicyContext({
      transaction: { to: "0x1234567890abcdef", value: "1" },
    });
    const result = await runPolicy(GUARD_SCRIPT, ctx);
    expect(result.allow).toBe(true);
  });

  it("blocks address not on allowlist", async () => {
    writeConfig("guard-config.json", {
      mode: "allowlist",
      addresses: { "eip155:1": ["0xallowed"] },
    });
    const ctx = makePolicyContext({
      transaction: { to: "0xunknown", value: "1" },
    });
    const result = await runPolicy(GUARD_SCRIPT, ctx);
    expect(result.allow).toBe(false);
    expect(result.reason).toContain("not on the allowlist");
  });

  it("blocks address on blocklist regardless of mode", async () => {
    writeConfig("guard-config.json", {
      mode: "blocklist",
      addresses: {},
      blockAddresses: ["0xbadactor"],
    });
    const ctx = makePolicyContext({
      transaction: { to: "0xbadactor", value: "1" },
    });
    const result = await runPolicy(GUARD_SCRIPT, ctx);
    expect(result.allow).toBe(false);
    expect(result.reason).toContain("blocklist");
  });

  it("supports wildcard chain prefix matching", async () => {
    writeConfig("guard-config.json", {
      mode: "allowlist",
      addresses: { "solana:*": ["SolAddr123"] },
    });
    const ctx = makePolicyContext({
      chainId: "solana:mainnet",
      transaction: { to: "SolAddr123", value: "1" },
    });
    const result = await runPolicy(GUARD_SCRIPT, ctx);
    expect(result.allow).toBe(true);
  });
});
