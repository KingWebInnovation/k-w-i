// app/api/webhook/paystack/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/DB/ConnectDB";
import { Order } from "@/lib/model/Order";
import { Subscription } from "@/lib/model/Subscription";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // ✅ Verify signature
    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    await connectDB();

    // ---- Handle Events ----
    switch (event.event) {
      case "charge.success": {
        const { reference, status } = event.data;

        // Try matching an Order
        const order = await Order.findOne({ paystackReference: reference });
        if (order) {
          if (status === "success") {
            order.status = "inprogress";
            order.paymentStatus = "captured";
          } else {
            order.status = "failed";
            order.paymentStatus = "unpaid";
          }
          await order.save();
          break;
        }

        // Try matching a Subscription
        const subscription = await Subscription.findOne({
          paystackReference: reference,
        });
        if (subscription) {
          if (status === "success") {
            subscription.status = "active";
            subscription.startDate = new Date();
            subscription.nextBillingDate =
              subscription.interval === "monthly"
                ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                : new Date(
                    new Date().setFullYear(new Date().getFullYear() + 1)
                  );
          } else {
            subscription.status = "payment_failed";
          }
          await subscription.save();
        }
        break;
      }

      case "subscription.create": {
        const { subscription_code, email_token, customer } = event.data;
        const subscription = await Subscription.findOne({
          email: customer.email,
        });

        if (subscription) {
          subscription.paystackSubscriptionCode = subscription_code;
          subscription.paystackEmailToken = email_token;
          await subscription.save();
        }
        break;
      }

      case "invoice.payment_failed": {
        const { subscription } = event.data;
        if (!subscription) break;

        const subDoc = await Subscription.findOne({
          paystackSubscriptionCode: subscription.subscription_code,
        });

        if (subDoc) {
          subDoc.status = "payment_failed";
          await subDoc.save();
        }
        break;
      }

      default:
      // Ignore other events silently
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
