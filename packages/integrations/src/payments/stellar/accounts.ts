import * as StellarSdk from "@stellar/stellar-sdk";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHorizonUrl(chainId: string): string {
  return chainId === "stellar:pubnet" ? HORIZON_MAINNET : HORIZON_TESTNET;
}

function isTestnet(chainId: string): boolean {
  return chainId !== "stellar:pubnet";
}

// ---------------------------------------------------------------------------
// accountExists
// ---------------------------------------------------------------------------

/**
 * Check whether a Stellar account exists on-chain.
 *
 * Returns `true` when the account is funded (i.e. loadAccount succeeds).
 * Returns `false` when Horizon responds with 404 (account not found).
 * Re-throws unexpected errors so the caller can handle them appropriately.
 */
export async function accountExists(
  accountId: string,
  chainId: string
): Promise<boolean> {
  const horizonUrl = getHorizonUrl(chainId);
  const server = new StellarSdk.Horizon.Server(horizonUrl);

  try {
    await server.loadAccount(accountId);
    return true;
  } catch (err: unknown) {
    // Horizon wraps 404s as an object with a response.status property
    const httpStatus = (err as { response?: { status?: number } })?.response?.status;
    if (httpStatus === 404) return false;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// ensureAccountExists
// ---------------------------------------------------------------------------

/**
 * Ensure a Stellar account exists before attempting a payment.
 *
 * - On **testnet**: uses Friendbot to create and fund the account automatically.
 * - On **mainnet**: throws a descriptive error because there is no automatic
 *   funding mechanism (the account must receive at least 1 XLM from another
 *   funded account to be created).
 */
export async function ensureAccountExists(
  accountId: string,
  chainId: string
): Promise<void> {
  if (await accountExists(accountId, chainId)) return;

  if (!isTestnet(chainId)) {
    throw new Error(
      `Stellar account ${accountId} does not exist on mainnet (${chainId}). ` +
      `To create it, send at least 1 XLM from an existing funded account. ` +
      `Friendbot is only available on testnet.`
    );
  }

  // Testnet: fund via Friendbot
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(accountId)}`
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Friendbot failed to fund ${accountId}: HTTP ${response.status} — ${body.slice(0, 200)}`
    );
  }
}

// ---------------------------------------------------------------------------
// getMinimumBalance
// ---------------------------------------------------------------------------

/**
 * Calculate the minimum XLM balance required to keep a Stellar account open.
 *
 * Formula (as of Protocol 19):
 *   base reserve = 1 XLM
 *   + 0.5 XLM per subentry (trust lines, offers, data entries, signers, etc.)
 *
 * Reference: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#minimum-balance
 *
 * @param subentryCount - Number of subentries currently on the account.
 * @returns Minimum balance as a decimal string (e.g. "1.5000000").
 */
export function getMinimumBalance(subentryCount: number): string {
  const baseReserve = 1.0;
  const perSubentry = 0.5;
  const minimum = baseReserve + perSubentry * Math.max(0, subentryCount);
  return minimum.toFixed(7);
}
