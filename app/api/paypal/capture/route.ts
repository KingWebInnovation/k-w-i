import { NextResponse } from "next/server";
import { getPayPalClient } from "@/lib/paypal/paypal";
import paypal from "@paypal/checkout-server-sdk";
import { Order, IOrder } from "@/lib/model/Order";
import { Subscription, ISubscription } from "@/lib/model/Subscription";
import { connectDB } from "@/lib/DB/ConnectDB";

interface CaptureBody {
  orderId: string; // PayPal order ID or subscription ID
  payerId: string; // PayPal Payer ID
}

type PayPalDoc = (IOrder & { _id: string }) | (ISubscription & { _id: string });

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: CaptureBody = await req.json();
    const { orderId: paypalId, payerId } = body;

    if (!paypalId || !payerId) {
      return NextResponse.json(
        { error: "Missing PayPal ID or PayerID" },
        { status: 400 }
      );
    }

    const client = getPayPalClient();

    // 🔎 Auto-detect type: check Orders first, then Subscriptions
    let doc: PayPalDoc | null = (await Order.findOne({
      paypalOrderId: paypalId,
    })) as PayPalDoc | null;
    let type: "order" | "subscription" = "order";

    if (!doc) {
      doc = (await Subscription.findOne({
        paypalSubscriptionId: paypalId,
      })) as PayPalDoc | null;
      type = "subscription";
    }

    if (!doc) {
      return NextResponse.json(
        { error: "No order or subscription found for PayPal ID" },
        { status: 404 }
      );
    }

    // 1️⃣ Handle Orders
    if (type === "order") {
      const authorizeRequest = new paypal.orders.OrdersAuthorizeRequest(
        paypalId
      );
      const authorizeResponse = await client.execute(authorizeRequest);

      const authorization =
        authorizeResponse.result.purchase_units[0].payments!.authorizations[0];

      const captureRequest = new paypal.payments.AuthorizationsCaptureRequest(
        authorization.id
      );
      captureRequest.requestBody({});
      const captureResponse = await client.execute(captureRequest);

      if (captureResponse.result.status === "COMPLETED") {
        await Order.findByIdAndUpdate(doc._id, {
          status: "paid",
          paymentStatus: "captured",
        });
      }

      return NextResponse.json({
        success: captureResponse.result.status === "COMPLETED",
        capture: captureResponse.result,
      });
    }

    // 2️⃣ Handle Subscriptions
    await Subscription.findByIdAndUpdate(doc._id, {
      status: "active",
      paymentStatus: "captured",
    });

    return NextResponse.json({
      success: true,
      message: "Subscription activated",
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Unknown error capturing PayPal order";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
