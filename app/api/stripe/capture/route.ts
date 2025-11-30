// app/api/stripe/capture/route.ts
import { stripe } from "@/lib/stripe/stripe";
import { NextResponse } from "next/server";

interface CapturePaymentBody {
  paymentIntentId: string;
}

export async function POST(req: Request) {
  try {
    const body: CapturePaymentBody = await req.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Missing paymentIntentId" },
        { status: 400 }
      );
    }

    // Capture the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return NextResponse.json({
      status: paymentIntent.status,
      id: paymentIntent.id,
      amount_received: paymentIntent.amount_received,
      currency: paymentIntent.currency,
    });
  } catch (err: unknown) {
    console.error("Stripe capture error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Unknown error capturing PaymentIntent";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
