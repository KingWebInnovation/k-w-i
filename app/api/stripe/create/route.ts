// app/api/stripe/create/route.ts
import { stripe } from "@/lib/stripe/stripe";
import { NextResponse } from "next/server";

interface CreatePaymentBody {
  amount: number;
  currency?: string;
  orderId?: string;
}

export async function POST(req: Request) {
  try {
    console.log("Received request to create Stripe Checkout Session");

    const body: CreatePaymentBody = await req.json();
    console.log("Request body:", body);

    const { amount, currency = "usd", orderId } = body;

    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    console.log(
      `Creating Checkout Session for amount: ${amount} ${currency}, orderId: ${orderId}`
    );

    // Stripe expects amount in cents
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: `Order ${orderId}` },
            unit_amount: Math.round(amount * 100), // convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/success?orderId=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/cancel?orderId=${orderId}`,

      metadata: { orderId: orderId || "N/A" },
    });

    console.log("Checkout Session created successfully:", session.id);

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err: unknown) {
    console.error("Stripe create error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Unknown error creating Checkout Session";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
