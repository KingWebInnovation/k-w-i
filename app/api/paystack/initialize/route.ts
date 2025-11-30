import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { connectDB } from "@/lib/DB/ConnectDB";
import { Order, IOrder } from "@/lib/model/Order";
import { Subscription, ISubscription } from "@/lib/model/Subscription";

interface PaystackInitBody {
  type: "order" | "subscription";
  orderId?: string;
  subscriptionId?: string;
  amount?: number; // only for orders
  email: string;
  name?: string;
}

// Extend document types with Paystack fields
type PaystackOrder = IOrder & {
  paystackReference?: string;
  paystackAccessCode?: string;
};
type PaystackSubscription = ISubscription & {
  paystackReference?: string;
  paystackAccessCode?: string;
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: PaystackInitBody = await req.json();
    const { type, orderId, subscriptionId, amount, email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (type === "order" && (!orderId || !amount)) {
      return NextResponse.json(
        { error: "Missing orderId or amount" },
        { status: 400 }
      );
    }

    if (type === "subscription" && !subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscriptionId" },
        { status: 400 }
      );
    }

    let data;

    if (type === "order") {
      // Handle Order Initialization
      const doc = (await Order.findById(orderId)) as PaystackOrder | null;
      if (!doc) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const payload = {
        email,
        amount: amount! * 100, // Paystack expects kobo
        currency: "KES",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/paystack-success`,
        metadata: { name, docId: doc._id.toString(), type },
      };

      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      data = response.data;

      if (data.status && data.data) {
        doc.paystackReference = data.data.reference;
        doc.paystackAccessCode = data.data.access_code;
        await doc.save();
      }
    } else {
      // Handle Subscription Initialization
      const doc = (await Subscription.findById(
        subscriptionId
      )) as PaystackSubscription | null;
      if (!doc) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }

      // Pick correct Paystack plan code based on planName in DB
      const planCodes: Record<string, string> = {
        Basic: process.env.PAYSTACK_BASIC_PLAN!,
        Growth: process.env.PAYSTACK_GROWTH_PLAN!,
        Premium: process.env.PAYSTACK_PREMIUM_PLAN!,
        Test: process.env.PAYSTACK_LIVE_PLAN!,
      };

      const planCode = planCodes[doc.planName];
      if (!planCode) {
        return NextResponse.json(
          { error: `No Paystack plan found for ${doc.planName}` },
          { status: 400 }
        );
      }

      // Create or validate Paystack customer
      const customerRes = await axios.post(
        "https://api.paystack.co/customer",
        { email, first_name: name },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const customer = customerRes.data.data;

      const payload = {
        email,
        amount: doc.price * 100, // kobo
        plan: planCode, // dynamic plan selection
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/paystack-success`,
        metadata: { name, docId: doc._id.toString(), type },
      };

      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      data = response.data;

      if (data.status && data.data) {
        // Save the transaction reference for webhook matching
        doc.paystackReference = data.data.reference;
        doc.paystackAccessCode = data.data.access_code; // optional
        await doc.save();
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return NextResponse.json(
      { error: error.response?.data || error.message || "Payment init failed" },
      { status: 500 }
    );
  }
}
