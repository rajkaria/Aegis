import { execSync } from "node:child_process";
import { createHmac } from "node:crypto";
import type { FundingOption, MoonPayTransaction, MoonPayCurrency, MoonPayAvailability } from "./types.js";

const MOONPAY_API_BASE = "https://api.moonpay.com";
const MOONPAY_BUY_URL = "https://buy.moonpay.com";
const MOONPAY_SELL_URL = "https://sell.moonpay.com";
const MOONPAY_SWAP_URL = "https://swap.moonpay.com";

// --- Configuration helpers ---

function getApiKey(): string | null {
  return process.env.MOONPAY_API_KEY ?? null;
}

function getSecretKey(): string | null {
  return process.env.MOONPAY_SECRET_KEY ?? null;
}

function getWebhookKey(): string | null {
  return process.env.MOONPAY_WEBHOOK_KEY ?? null;
}

/**
 * Sign a MoonPay widget URL using the secret key.
 * Required for embedded widget mode.
 * Returns the original URL + &signature=... appended.
 */
export function signMoonPayUrl(urlToSign: string): string | null {
  const secretKey = getSecretKey();
  if (!secretKey) return null;

  const url = new URL(urlToSign);
  const queryToSign = url.search; // includes the leading "?"
  const signature = createHmac("sha256", secretKey)
    .update(queryToSign)
    .digest("base64");

  url.searchParams.set("signature", signature);
  return url.toString();
}

// --- On-Ramp (Buy) ---

export function getMoonPayFundingOptions(walletAddress: string): FundingOption {
  return {
    provider: "moonpay",
    command: `mp buy --currency usdc --wallet ${walletAddress}`,
    url: `https://www.moonpay.com/buy/usdc?walletAddress=${walletAddress}`,
    supportedTokens: ["USDC", "ETH", "SOL"],
    supportedChains: ["Ethereum", "Base", "Solana", "Polygon"],
  };
}

/**
 * Generate a MoonPay buy widget URL for a specific token and wallet.
 * If API key is set, includes it for embedded mode.
 * If secret key is set, signs the URL.
 */
export function getMoonPayBuyUrl(options: {
  walletAddress: string;
  currencyCode?: string;  // "sol", "usdc", "eth" — defaults to "usdc"
  baseCurrencyCode?: string; // "usd", "eur" — defaults to "usd"
  baseCurrencyAmount?: string; // Fiat amount to pre-fill
  externalTransactionId?: string; // Your reference ID
  redirectUrl?: string;
}): string {
  const apiKey = getApiKey();
  const params = new URLSearchParams();

  if (apiKey) params.set("apiKey", apiKey);
  params.set("currencyCode", options.currencyCode ?? "usdc");
  params.set("baseCurrencyCode", options.baseCurrencyCode ?? "usd");
  params.set("walletAddress", options.walletAddress);
  if (options.baseCurrencyAmount) params.set("baseCurrencyAmount", options.baseCurrencyAmount);
  if (options.externalTransactionId) params.set("externalTransactionId", options.externalTransactionId);
  if (options.redirectUrl) params.set("redirectURL", options.redirectUrl);

  const url = `${MOONPAY_BUY_URL}?${params.toString()}`;

  // Sign if secret key available
  const signed = signMoonPayUrl(url);
  return signed ?? url;
}

// --- Off-Ramp (Sell) ---

/**
 * Generate a MoonPay sell widget URL for cashing out agent profits.
 */
export function getMoonPaySellUrl(options: {
  walletAddress: string;
  currencyCode?: string;        // "sol", "eth", "usdc"
  baseCurrencyCode?: string;    // "usd", "eur"
  quoteCurrencyAmount?: string; // Crypto amount to sell
  externalTransactionId?: string;
  redirectUrl?: string;
}): string {
  const apiKey = getApiKey();
  const params = new URLSearchParams();

  if (apiKey) params.set("apiKey", apiKey);
  params.set("currencyCode", options.currencyCode ?? "usdc");
  params.set("baseCurrencyCode", options.baseCurrencyCode ?? "usd");
  params.set("walletAddress", options.walletAddress);
  if (options.quoteCurrencyAmount) params.set("quoteCurrencyAmount", options.quoteCurrencyAmount);
  if (options.externalTransactionId) params.set("externalTransactionId", options.externalTransactionId);
  if (options.redirectUrl) params.set("redirectURL", options.redirectUrl);

  const url = `${MOONPAY_SELL_URL}?${params.toString()}`;
  const signed = signMoonPayUrl(url);
  return signed ?? url;
}

// --- Swap ---

/**
 * Generate a MoonPay swap widget URL for cross-token operations.
 */
export function getMoonPaySwapUrl(options: {
  walletAddress: string;
  fromCurrencyCode?: string;  // "sol"
  toCurrencyCode?: string;    // "usdc"
}): string {
  const apiKey = getApiKey();
  const params = new URLSearchParams();

  if (apiKey) params.set("apiKey", apiKey);
  params.set("walletAddress", options.walletAddress);
  if (options.fromCurrencyCode) params.set("baseCurrencyCode", options.fromCurrencyCode);
  if (options.toCurrencyCode) params.set("defaultCurrencyCode", options.toCurrencyCode);

  const url = `${MOONPAY_SWAP_URL}?${params.toString()}`;
  const signed = signMoonPayUrl(url);
  return signed ?? url;
}

// --- Transaction Status ---

/**
 * Query MoonPay for a transaction by its external ID.
 * Requires MOONPAY_SECRET_KEY.
 */
export async function getMoonPayTransaction(externalTransactionId: string): Promise<MoonPayTransaction | null> {
  const secretKey = getSecretKey();
  if (!secretKey) return null;

  try {
    const response = await fetch(
      `${MOONPAY_API_BASE}/v1/transactions/ext/${encodeURIComponent(externalTransactionId)}`,
      {
        headers: {
          "Authorization": `Api-Key ${secretKey}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`MoonPay transaction query failed: ${response.status}`);
      return null;
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      id: data.id as string,
      externalTransactionId: data.externalTransactionId as string | undefined,
      status: data.status as MoonPayTransaction["status"],
      cryptoTransactionId: data.cryptoTransactionId as string | undefined,
      cryptoAmount: data.quoteCurrencyAmount != null ? String(data.quoteCurrencyAmount) : undefined,
      baseCurrencyAmount: data.baseCurrencyAmount != null ? String(data.baseCurrencyAmount) : undefined,
      baseCurrency: (data.baseCurrency as Record<string, unknown>)?.code as string | undefined,
      currency: (data.currency as Record<string, unknown>)?.code as string | undefined,
      walletAddress: data.walletAddress as string | undefined,
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
    };
  } catch (err) {
    console.error("MoonPay transaction query failed:", (err as Error).message);
    return null;
  }
}

// --- Currencies API ---

let currenciesCache: { data: MoonPayCurrency[]; fetchedAt: number } | null = null;
const CURRENCIES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch supported currencies from MoonPay.
 * Cached for 1 hour. Falls back to hardcoded list without API key.
 */
export async function getMoonPayCurrencies(): Promise<MoonPayCurrency[]> {
  // Return cache if fresh
  if (currenciesCache && Date.now() - currenciesCache.fetchedAt < CURRENCIES_CACHE_TTL) {
    return currenciesCache.data;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    // Hardcoded fallback
    return [
      { id: "sol", code: "sol", name: "Solana", type: "crypto", minBuyAmount: 0.1, maxBuyAmount: 30000, minSellAmount: 0.1, maxSellAmount: 10000, isSellSupported: true },
      { id: "usdc", code: "usdc", name: "USD Coin", type: "crypto", minBuyAmount: 20, maxBuyAmount: 30000, minSellAmount: 20, maxSellAmount: 10000, isSellSupported: true },
      { id: "eth", code: "eth", name: "Ethereum", type: "crypto", minBuyAmount: 0.01, maxBuyAmount: 30000, minSellAmount: 0.01, maxSellAmount: 10000, isSellSupported: true },
    ];
  }

  try {
    const response = await fetch(
      `${MOONPAY_API_BASE}/v3/currencies?apiKey=${apiKey}&type=crypto`,
      { headers: { "Accept": "application/json" } }
    );

    if (!response.ok) {
      console.error(`MoonPay currencies query failed: ${response.status}`);
      return currenciesCache?.data ?? [];
    }

    const data = await response.json() as Array<Record<string, unknown>>;
    const currencies: MoonPayCurrency[] = data.map((c) => ({
      id: c.id as string,
      code: c.code as string,
      name: c.name as string,
      type: "crypto" as const,
      minBuyAmount: c.minBuyAmount as number | null,
      maxBuyAmount: c.maxBuyAmount as number | null,
      minSellAmount: c.minSellAmount as number | null,
      maxSellAmount: c.maxSellAmount as number | null,
      isSellSupported: (c.isSellSupported as boolean) ?? false,
    }));

    currenciesCache = { data: currencies, fetchedAt: Date.now() };
    return currencies;
  } catch (err) {
    console.error("MoonPay currencies query failed:", (err as Error).message);
    return currenciesCache?.data ?? [];
  }
}

// --- IP / Geo Availability ---

/**
 * Check if MoonPay is available for the current user's IP.
 * Requires API key. Returns optimistic result without it.
 */
export async function checkMoonPayAvailability(ipAddress?: string): Promise<MoonPayAvailability> {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Optimistic default when no API key
    return { isAllowed: true, isBuyAllowed: true, isSellAllowed: true, alpha2: "US" };
  }

  try {
    const url = ipAddress
      ? `${MOONPAY_API_BASE}/v4/ip_address?apiKey=${apiKey}&ipAddress=${ipAddress}`
      : `${MOONPAY_API_BASE}/v4/ip_address?apiKey=${apiKey}`;

    const response = await fetch(url, { headers: { "Accept": "application/json" } });

    if (!response.ok) {
      return { isAllowed: true, isBuyAllowed: true, isSellAllowed: true, alpha2: "US" };
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      isAllowed: (data.isAllowed as boolean) ?? true,
      isBuyAllowed: (data.isBuyAllowed as boolean) ?? true,
      isSellAllowed: (data.isSellAllowed as boolean) ?? true,
      alpha2: (data.alpha2 as string) ?? "US",
      state: data.state as string | undefined,
    };
  } catch {
    return { isAllowed: true, isBuyAllowed: true, isSellAllowed: true, alpha2: "US" };
  }
}

// --- Webhook Validation ---

/**
 * Validate a MoonPay webhook signature.
 * Returns the parsed payload if valid, null if invalid.
 */
export function validateMoonPayWebhook(
  rawBody: string,
  signatureHeader: string
): Record<string, unknown> | null {
  const webhookKey = getWebhookKey();
  if (!webhookKey) return null;

  const expectedSignature = createHmac("sha256", webhookKey)
    .update(rawBody)
    .digest("base64");

  if (expectedSignature !== signatureHeader) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// --- CLI Helpers (existing) ---

export function isMoonPayInstalled(): boolean {
  try {
    execSync("mp --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function getMoonPayWallets(): string[] {
  try {
    const output = execSync("mp wallet list --json", { stdio: "pipe" }).toString();
    const wallets = JSON.parse(output) as Array<{ address: string }>;
    return wallets.map((w) => w.address);
  } catch {
    return [];
  }
}

// --- Config check ---

/**
 * Returns which MoonPay features are available based on configured env vars.
 */
export function getMoonPayConfig(): {
  hasApiKey: boolean;
  hasSecretKey: boolean;
  hasWebhookKey: boolean;
  widgetMode: "embedded" | "external";
  features: string[];
} {
  const hasApiKey = !!getApiKey();
  const hasSecretKey = !!getSecretKey();
  const hasWebhookKey = !!getWebhookKey();

  const features: string[] = ["buy-url", "sell-url", "swap-url", "cli"];
  if (hasApiKey) features.push("currencies", "availability", "embedded-widget");
  if (hasSecretKey) features.push("signed-urls", "transaction-status");
  if (hasWebhookKey) features.push("webhooks");

  return {
    hasApiKey,
    hasSecretKey,
    hasWebhookKey,
    widgetMode: hasSecretKey ? "embedded" : "external",
    features,
  };
}
