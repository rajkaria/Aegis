import type {
  ChainAdapter,
  PaymentParams,
  PaymentResult,
  FeeEstimate,
  ReceiptData,
} from "../types.js";
import type { ChainBalance, TxVerification } from "../../types.js";
import { getStellarBalances, verifyStellarTransaction } from "../../stellar.js";
import { sendStellarPayment } from "./payments.js";
import { anchorReceiptStellar } from "./receipt.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Stellar fixed base fee (100 stroops = 0.00001 XLM). */
const STELLAR_FEE_XLM = "0.00001";
/** Rough USD estimate at ~$0.12/XLM. */
const STELLAR_FEE_USD = "0.0000012";
/** Stellar average ledger close time (seconds). */
const STELLAR_BLOCK_TIME = 5;

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
  // sendPayment
  // -------------------------------------------------------------------------

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    const { chain, to, amount, token, memo } = params;

    // Resolve sender from OWS wallet
    const from = await this.resolveStellarAddress(this.walletName);
    if (!from) {
      throw new Error(
        `No Stellar address found for wallet "${this.walletName}". ` +
        `Create one with: ows wallet create ${this.walletName}`
      );
    }

    return sendStellarPayment({
      chainId: chain,
      from,
      to,
      amount,
      asset: token,
      memo,
      walletName: this.walletName,
    });
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
    // Fetch both testnet and mainnet balances in parallel; combine results
    const [mainnet, testnet] = await Promise.allSettled([
      getStellarBalances(address, false),
      getStellarBalances(address, true),
    ]);

    const results: ChainBalance[] = [];
    if (mainnet.status === "fulfilled") results.push(...mainnet.value);
    if (testnet.status === "fulfilled") results.push(...testnet.value);
    return results;
  }

  // -------------------------------------------------------------------------
  // anchorReceipt
  // -------------------------------------------------------------------------

  async anchorReceipt(receipt: ReceiptData, chainId: string): Promise<string> {
    const from = await this.resolveStellarAddress(this.walletName);
    if (!from) {
      throw new Error(
        `No Stellar address found for wallet "${this.walletName}". ` +
        `Cannot anchor receipt without a signing address.`
      );
    }

    return anchorReceiptStellar({
      receipt,
      from,
      chainId,
      walletName: this.walletName,
    });
  }

  // -------------------------------------------------------------------------
  // resolveAddress — Stellar Federation
  // -------------------------------------------------------------------------

  /**
   * Resolve a Stellar address or Federation name to a public key.
   *
   * Stellar Federation format: "name*domain.com"
   * Steps:
   *   1. Fetch https://domain.com/.well-known/stellar.toml
   *   2. Extract FEDERATION_SERVER URL from the TOML
   *   3. GET {FEDERATION_SERVER}?q={address}&type=name
   *   4. Return the account_id from the response JSON
   *
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

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Look up the Stellar (G...) public key for a given OWS wallet name.
   * Returns null when the wallet is not found or has no Stellar account.
   */
  private async resolveStellarAddress(walletName: string): Promise<string | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getWallet } = await import("@open-wallet-standard/core");
      const wallet = getWallet(walletName);
      if (!wallet?.accounts) return null;

      const stellarAccount = wallet.accounts.find(
        (a: { chainId: string; address: string }) =>
          a.chainId === "stellar" ||
          a.chainId.startsWith("stellar:")
      );
      return stellarAccount?.address ?? null;
    } catch {
      return null;
    }
  }
}
