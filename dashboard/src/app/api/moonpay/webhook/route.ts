import { NextResponse } from "next/server";
import { validateMoonPayWebhook } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/**
 * MoonPay webhook handler.
 * Receives transaction lifecycle events (completed, failed, etc.)
 * Validates signature using MOONPAY_WEBHOOK_KEY.
 */
export async function POST(req: Request) {
  const webhookKey = process.env.MOONPAY_WEBHOOK_KEY;
  if (!webhookKey) {
    return NextResponse.json({ error: "Webhooks not configured" }, { status: 503 });
  }

  const signatureHeader = req.headers.get("moonpay-signature-v2") ?? "";
  const rawBody = await req.text();

  const payload = validateMoonPayWebhook(rawBody, signatureHeader);
  if (!payload) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = payload.type as string;
  const data = payload.data as Record<string, unknown> | undefined;

  switch (eventType) {
    case "transaction_completed": {
      const walletAddress = data?.walletAddress as string | undefined;
      const cryptoAmount = data?.quoteCurrencyAmount;
      const currency = (data?.currency as Record<string, unknown>)?.code as string | undefined;
      console.log(
        `[MoonPay] Transaction completed: ${cryptoAmount} ${currency} → ${walletAddress}`
      );
      // TODO: Write to agent activity feed, trigger balance refresh
      break;
    }
    case "transaction_failed": {
      const failureReason = data?.failureReason as string | undefined;
      console.log(`[MoonPay] Transaction failed: ${failureReason}`);
      break;
    }
    case "transaction_updated": {
      const status = data?.status as string | undefined;
      console.log(`[MoonPay] Transaction updated: ${status}`);
      break;
    }
    default:
      console.log(`[MoonPay] Unhandled event: ${eventType}`);
  }

  return NextResponse.json({ received: true });
}
