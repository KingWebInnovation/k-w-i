// app/api/paystack/verify/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { connectDB } from "@/lib/DB/ConnectDB";
import { Subscription } from "@/lib/model/Subscription";
import { Order } from "@/lib/model/Order";

// Define TypeScript interfaces for Paystack responses
interface PaystackTransactionCustomer {
  email: string;
}

interface PaystackTransactionData {
  status: "success" | "failed" | string;
  customer?: PaystackTransactionCustomer;
}

interface PaystackTransactionResponse {
  status: boolean;
  message: string;
  data: PaystackTransactionData;
}

interface PaystackSubscription {
  subscription_code: string;
  email_token: string;
  customer?: {
    email: string;
  };
}

interface PaystackSubscriptionResponse {
  status: boolean;
  data: PaystackSubscription[];
}

export async function POST(req: Request) {
  try {
    const body: { reference?: string } = await req.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    await connectDB();

    // ✅ Verify transaction with Paystack
    const response = await axios.get<PaystackTransactionResponse>(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = response.data;

    if (!data.status || !data.data) {
      return NextResponse.json(
        { error: "Verification failed", details: data },
        { status: 400 }
      );
    }

    const tx = data.data;

    // ---- Handle Order ----
    const order = await Order.findOne({ paystackReference: reference });
    if (order) {
      if (tx.status === "success") {
        order.status = "inprogress";
        order.paymentStatus = "captured";
      } else {
        order.status = "failed";
        order.paymentStatus = "unpaid";
      }
      await order.save();
      return NextResponse.json({ success: true, type: "order", order });
    }

    // ---- Handle Subscription ----
    const subscription = await Subscription.findOne({
      paystackReference: reference,
    });

    if (subscription) {
      if (tx.status === "success") {
        subscription.status = "active";
        subscription.startDate = new Date();
        subscription.nextBillingDate =
          subscription.interval === "monthly"
            ? new Date(new Date().setMonth(new Date().getMonth() + 1))
            : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

        // 🔎 Fallback: fetch subscription details from Paystack API
        try {
          const subsResponse = await axios.get<PaystackSubscriptionResponse>(
            `https://api.paystack.co/subscription`,
            {
              headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              },
            }
          );

          if (subsResponse.data?.status && subsResponse.data.data) {
            const subsList = subsResponse.data.data;
            const match = subsList.find(
              (s) => s.customer?.email === tx.customer?.email
            );

            if (match) {
              subscription.paystackSubscriptionCode = match.subscription_code;
              subscription.paystackEmailToken = match.email_token;
            }
          }
        } catch {
          // Ignore subscription fetch errors silently
        }
      } else {
        subscription.status = "payment_failed";
      }

      await subscription.save();
      return NextResponse.json({
        success: true,
        type: "subscription",
        subscription,
      });
    }

    // Nothing matched
    return NextResponse.json(
      { error: "No matching order or subscription found" },
      { status: 404 }
    );
  } catch (err) {
    const error = err as AxiosError;
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
