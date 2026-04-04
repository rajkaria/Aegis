import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Mock @open-wallet-standard/core since it may not be available in test
vi.mock("@open-wallet-standard/core", () => ({
  signMessage: () => ({ signature: "mock-sig" }),
  signTypedData: () => ({ signature: "mock-eip712-sig" }),
  signTransaction: () => ({ signature: "mock-tx-sig" }),
  getWallet: () => null,
}));

// Mock shared paths to use temp dir
let testDir: string;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), "aegis-gate-test-"));
  vi.doMock("@aegis-ows/shared", async () => {
    const actual = await vi.importActual("@aegis-ows/shared") as Record<string, unknown>;
    return {
      ...actual,
      ensureAegisDir: () => {},
      appendEarningsEntry: vi.fn(),
      appendLedgerEntry: vi.fn(),
    };
  });
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
  vi.restoreAllMocks();
  vi.resetModules();
});

function mockReq(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    headers: {},
    path: "/api/test",
    ...overrides,
  };
}

function mockRes(): { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; statusCode: number; body: unknown } {
  const res: Record<string, unknown> = {};
  res.statusCode = 200;
  res.body = null;
  res.status = vi.fn((code: number) => {
    (res as { statusCode: number }).statusCode = code;
    return res;
  });
  res.json = vi.fn((data: unknown) => {
    (res as { body: unknown }).body = data;
    return res;
  });
  return res as ReturnType<typeof mockRes>;
}

describe("aegisGate middleware", () => {
  it("returns 402 when no X-PAYMENT header", async () => {
    const { aegisGate } = await import("../src/index.js");
    const middleware = aegisGate({
      price: "0.01",
      agentId: "seller-agent",
    });

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(next).not.toHaveBeenCalled();
  });

  it("402 response includes x402Version, payTo, price, token fields", async () => {
    const { aegisGate } = await import("../src/index.js");
    const middleware = aegisGate({
      price: "0.05",
      token: "USDC",
      agentId: "my-agent",
    });

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(res.body).toMatchObject({
      x402Version: 1,
      price: "0.05",
      token: "USDC",
      agentId: "my-agent",
    });
    expect((res.body as Record<string, unknown>).payTo).toBeDefined();
  });

  it("passes through when valid X-PAYMENT header provided", async () => {
    const { aegisGate } = await import("../src/index.js");
    const middleware = aegisGate({
      price: "0.01",
      agentId: "seller-agent",
    });

    const req = mockReq({
      headers: {
        "x-payment": JSON.stringify({ fromAgent: "buyer", txHash: "0xabc123def456" }),
      },
    });
    const res = mockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(402);
  });

  it("logs earnings entry on successful payment", async () => {
    const shared = await import("@aegis-ows/shared");
    const { aegisGate } = await import("../src/index.js");
    const middleware = aegisGate({
      price: "0.01",
      agentId: "seller-agent",
    });

    const req = mockReq({
      headers: {
        "x-payment": JSON.stringify({ fromAgent: "buyer", txHash: "0xabc123def456" }),
      },
    });
    const res = mockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(shared.appendEarningsEntry).toHaveBeenCalled();
  });
});

describe("loadConfig", () => {
  it("reads aegis.config.json correctly", async () => {
    const configPath = join(testDir, "aegis.config.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        walletName: "my-agent",
        network: "eip155:1",
        endpoints: {
          "/api/data": { price: "0.01", description: "Data endpoint" },
        },
      })
    );

    const { loadConfig } = await import("../src/index.js");
    const config = loadConfig(configPath);
    expect(config.walletName).toBe("my-agent");
    expect(config.endpoints["/api/data"].price).toBe("0.01");
  });
});
