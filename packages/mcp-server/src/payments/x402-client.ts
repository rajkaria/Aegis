import { appendLedgerEntry } from "@aegis-ows/shared";
import type { LedgerEntry } from "@aegis-ows/shared";

export interface X402PaymentDetails {
  network: string;
  token: string;
  amount: string;
  recipient?: string;
  [key: string]: unknown;
}

export interface X402Result {
  success: boolean;
  content?: string;
  statusCode?: number;
  error?: string;
  paymentDetails?: X402PaymentDetails;
}

export async function fetchWithX402(
  url: string,
  walletName: string,
  chain?: string,
  maxAmount?: string
): Promise<X402Result> {
  // Step 1: Initial fetch
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    return { success: false, error: `Fetch failed: ${String(err)}` };
  }

  // Step 2: If not 402, return content directly
  if (response.status !== 402) {
    const content = await response.text();
    return { success: true, content, statusCode: response.status };
  }

  // Step 3: Parse payment details from response headers
  const paymentHeader =
    response.headers.get("x-payment") || response.headers.get("payment-required");

  if (!paymentHeader) {
    return { success: false, error: "402 received but no payment header found", statusCode: 402 };
  }

  let paymentDetails: X402PaymentDetails;
  try {
    paymentDetails = JSON.parse(paymentHeader) as X402PaymentDetails;
  } catch {
    return { success: false, error: "Failed to parse payment header JSON", statusCode: 402 };
  }

  // Step 4: Check maxAmount constraint
  if (maxAmount !== undefined) {
    const required = parseFloat(paymentDetails.amount || "0");
    const max = parseFloat(maxAmount);
    if (required > max) {
      return {
        success: false,
        error: `Payment required (${paymentDetails.amount} ${paymentDetails.token}) exceeds maxAmount (${maxAmount})`,
        statusCode: 402,
        paymentDetails,
      };
    }
  }

  // Step 5: Mock OWS signing
  const signature = `aegis-sig-${Date.now()}`;
  const network = chain || paymentDetails.network || "base";
  const token = paymentDetails.token || "USDC";
  const amount = paymentDetails.amount || "0";

  // Step 6: Retry with payment headers
  let retryResponse: Response;
  try {
    retryResponse = await fetch(url, {
      headers: {
        "x-payment-signature": signature,
        "x-payment-network": network,
        "x-payment-token": token,
        "x-payment-amount": amount,
      },
    });
  } catch (err) {
    return { success: false, error: `Retry fetch failed: ${String(err)}`, paymentDetails };
  }

  // Step 7: Check result
  if (retryResponse.ok || retryResponse.status < 400) {
    const content = await retryResponse.text();

    // Log to ledger
    const entry: LedgerEntry = {
      timestamp: new Date().toISOString(),
      apiKeyId: walletName,
      chainId: network,
      token,
      amount,
      tool: "aegis_pay_x402",
      description: `x402 payment to ${url}`,
    };
    appendLedgerEntry(entry);

    return { success: true, content, statusCode: retryResponse.status, paymentDetails };
  } else {
    return {
      success: false,
      error: `Payment retry failed with status ${retryResponse.status}`,
      statusCode: retryResponse.status,
      paymentDetails,
    };
  }
}
