import { NextResponse } from "next/server";
import { getPayPalClient } from "@/lib/paypal/paypal";
import paypal from "@paypal/checkout-server-sdk";
import { Order } from "@/lib/model/Order";
import { Subscription } from "@/lib/model/Subscription"; // 👈 import subscription model
import { connectDB } from "@/lib/DB/ConnectDB";

interface PayPalCreateBody {
  type: "order" | "subscription";
  orderId?: string;
  subscriptionId?: string;
  amount?: string; // 💰 amount is in KES from client
}

// 🔹 Helper: Convert KES → USD
async function convertKESToUSD(amountKES: number): Promise<number> {
  const res = await fetch(`https://open.er-api.com/v6/latest/KES`);
  const data = await res.json();

  if (!data || !data.rates?.USD) {
    throw new Error("Failed to fetch exchange rate");
  }

  const rate = data.rates.USD; // e.g. 0.0068 (KES → USD)
  const usdAmount = (amountKES * rate).toFixed(2); // round to 2 decimals
  return parseFloat(usdAmount);
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: PayPalCreateBody = await req.json();
    const { type, orderId, subscriptionId, amount } = body;

    if (type === "order" && !orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    if (type === "subscription" && !subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscriptionId" },
        { status: 400 }
      );
    }

    const client = getPayPalClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // pick correct reference id
    const referenceId = type === "order" ? orderId! : subscriptionId!;

    // 💰 Convert KES to USD before PayPal
    const kesAmount = Number(amount ?? "500");
    const usdAmount = await convertKESToUSD(kesAmount);

    // 1️⃣ Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "AUTHORIZE",
      purchase_units: [
        {
          reference_id: referenceId,
          amount: {
            currency_code: "USD",
            value: usdAmount.toString(),
          },
        },
      ],
      application_context: {
        brand_name: "NextEssay",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${baseUrl}/paypal-success`,
        cancel_url: `${baseUrl}/paypal-cancel`,
      },
    });

    const createResponse = await client.execute(request);

    // 2️⃣ Save PayPal order ID to correct collection
    const paypalOrderId = createResponse.result.id;

    if (type === "order") {
      await Order.findByIdAndUpdate(orderId, { paypalOrderId });
    } else if (type === "subscription") {
      await Subscription.findByIdAndUpdate(subscriptionId, {
        paypalSubscriptionId: paypalOrderId,
      });
    }

    // 3️⃣ Return PayPal order data to client
    return NextResponse.json(createResponse.result);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Unknown error creating PayPal order";
    console.error("❌ [PayPal Create API] Error:", errorMessage, err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
