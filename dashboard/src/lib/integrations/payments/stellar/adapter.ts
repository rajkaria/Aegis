import type {
  ChainAdapter,
  PaymentParams,
  PaymentResult,
  FeeEstimate,
  ReceiptData,
} from "../types";
import type { ChainBalance, TxVerification } from "../../types";
import { getStellarBalances } from "../../stellar";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Stellar fixed base fee (100 stroops = 0.00001 XLM). */
const STELLAR_FEE_XLM = "0.00001";
/** Rough USD estimate at ~$0.12/XLM. */
const STELLAR_FEE_USD = "0.0000012";
/** Stellar average ledger close time (seconds). */
const STELLAR_BLOCK_TIME = 5;

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";

// ---------------------------------------------------------------------------
// verifyStellarTransaction (inlined — not exported from dashboard stellar.ts)
// ---------------------------------------------------------------------------

async function verifyStellarTransaction(
  txHash: string,
  testnet: boolean
): Promise<TxVerification> {
  const horizonUrl = testnet ? HORIZON_TESTNET : HORIZON_MAINNET;
  const chain = testnet ? "stellar:testnet" : "stellar:pubnet";

  try {
    const response = await fetch(`${horizonUrl}/transactions/${txHash}`);

    if (response.status === 404) {
      return { txHash, chain, status: "not_found", source: "stellar-horizon" };
    }

    if (!response.ok) {
      return { txHash, chain, status: "error", source: "stellar-horizon" };
    }

    const tx = (await response.json()) as {
      successful: boolean;
      ledger: number;
      created_at: string;
    };

    return {
      txHash,
      chain,
      status: tx.successful ? "confirmed" : "pending",
      blockNumber: tx.ledger,
      timestamp: tx.created_at,
      source: "stellar-horizon",
    };
  } catch {
    return { txHash, chain, status: "error", source: "stellar-horizon" };
  }
}

// ---------------------------------------------------------------------------
// StellarAdapter
// ---------------------------------------------------------------------------

export class StellarAdapter implements ChainAdapter {
  readonly chainType = "stellar" as const;

  readonly supportedChains: string[] = ["stellar:pubnet", "stellar:testnet"];

  private readonly walletName: string;

  constructor(walletName: string = "default") {
    this.walletName = walletName;
  }

  // -------------------------------------------------------------------------
  // sendPayment — STUBBED (OWS signing not available in dashboard)
  // -------------------------------------------------------------------------

  async sendPayment(_params: PaymentParams): Promise<PaymentResult> {
    throw new Error(
      "OWS signing not available in dashboard. " +
      "Use the /api/payments/send API route to send Stellar payments."
    );
  }

  // -------------------------------------------------------------------------
  // estimateFees
  // -------------------------------------------------------------------------

  async estimateFees(params: PaymentParams): Promise<FeeEstimate> {
    // Stellar has a fixed base fee of 100 stroops (0.00001 XLM)
    return {
      chain: params.chain,
      fee: STELLAR_FEE_XLM,
      feeUsd: STELLAR_FEE_USD,
      estimatedTime: STELLAR_BLOCK_TIME,
    };
  }

  // -------------------------------------------------------------------------
  // verifyTransaction
  // -------------------------------------------------------------------------

  async verifyTransaction(txHash: string, chainId: string): Promise<TxVerification> {
    const testnet = chainId !== "stellar:pubnet";
    return verifyStellarTransaction(txHash, testnet);
  }

  // -------------------------------------------------------------------------
  // getBalance
  // -------------------------------------------------------------------------

  async getBalance(address: string, _token?: string): Promise<ChainBalance[]> {
    // getStellarBalances in the dashboard only queries testnet
    return getStellarBalances(address);
  }

  // -------------------------------------------------------------------------
  // anchorReceipt — STUBBED (OWS signing not available in dashboard)
  // -------------------------------------------------------------------------

  async anchorReceipt(_receipt: ReceiptData, _chainId: string): Promise<string> {
    throw new Error(
      "OWS signing not available in dashboard. " +
      "Use the /api/payments/anchor API route to anchor Stellar receipts on-chain."
    );
  }

  // -------------------------------------------------------------------------
  // resolveAddress — Stellar Federation
  // -------------------------------------------------------------------------

  /**
   * Resolve a Stellar address or Federation name to a public key.
   *
   * Stellar Federation format: "name*domain.com"
   * If the input doesn't contain "*", it is returned as-is (assumed to be
   * a raw G... public key).
   */
  async resolveAddress(nameOrAddress: string, _chainId?: string): Promise<string> {
    if (!nameOrAddress.includes("*")) {
      // Already a Stellar public key — validate format lightly
      return nameOrAddress;
    }

    const [, domain] = nameOrAddress.split("*");
    if (!domain) {
      throw new Error(`Invalid Stellar Federation address: "${nameOrAddress}"`);
    }

    // Step 1: Fetch stellar.toml
    const tomlUrl = `https://${domain}/.well-known/stellar.toml`;
    let tomlText: string;
    try {
      const tomlRes = await fetch(tomlUrl);
      if (!tomlRes.ok) {
        throw new Error(`HTTP ${tomlRes.status}`);
      }
      tomlText = await tomlRes.text();
    } catch (err) {
      throw new Error(
        `Failed to fetch stellar.toml from ${tomlUrl}: ${(err as Error).message}`
      );
    }

    // Step 2: Extract FEDERATION_SERVER (simple line-by-line parse)
    let federationServer: string | null = null;
    for (const line of tomlText.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("FEDERATION_SERVER")) {
        const match = trimmed.match(/=\s*"?([^"]+)"?/);
        if (match?.[1]) {
          federationServer = match[1].trim();
          break;
        }
      }
    }

    if (!federationServer) {
      throw new Error(
        `No FEDERATION_SERVER found in ${tomlUrl} for "${nameOrAddress}"`
      );
    }

    // Step 3: Query Federation server
    const queryUrl = `${federationServer}?q=${encodeURIComponent(nameOrAddress)}&type=name`;
    let federationRes: Response;
    try {
      federationRes = await fetch(queryUrl);
    } catch (err) {
      throw new Error(
        `Federation query failed for "${nameOrAddress}": ${(err as Error).message}`
      );
    }

    if (!federationRes.ok) {
      throw new Error(
        `Federation server returned HTTP ${federationRes.status} for "${nameOrAddress}"`
      );
    }

    const data = (await federationRes.json()) as { account_id?: string };
    if (!data.account_id) {
      throw new Error(
        `Federation response missing account_id for "${nameOrAddress}"`
      );
    }

    return data.account_id;
  }
}
