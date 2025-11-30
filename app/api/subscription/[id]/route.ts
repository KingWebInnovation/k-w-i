import { connectDB } from "@/lib/DB/ConnectDB";
import { Subscription } from "@/lib/model/Subscription";
import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// GET /api/subscription/[id]
export async function GET(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    await connectDB();
    const subscription = await Subscription.findById(params.id);

    if (!subscription) {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("GET /api/subscription/[id] error:", error);
    return NextResponse.json(
      { message: "Error fetching subscription" },
      { status: 500 }
    );
  }
}

// PATCH /api/subscription/[id]
export async function PATCH(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };

  try {
    await connectDB();
    const body = await req.json();

    // ✅ only allow subscription-related fields
    const allowedFields: Partial<{
      name: string;
      email: string;
      phone: string;
      planId: string;
      planTitle: string;
      price: number;
      interval: "monthly" | "yearly";
      description: string;
      features: string[];
      fileUrls: string[];
      links: string[];
      startDate: Date;
      nextBillingDate: Date;
      endDate: Date;
      status: "pending" | "active" | "paused" | "cancelled" | "expired";
      paypalSubscriptionId: string;
      paystackSubscriptionCode: string;
      paystackEmailToken: string;
    }> = {};

    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.email !== undefined) allowedFields.email = body.email;
    if (body.phone !== undefined) allowedFields.phone = body.phone;
    if (body.planId !== undefined) allowedFields.planId = body.planId;
    if (body.planTitle !== undefined) allowedFields.planTitle = body.planTitle;
    if (body.price !== undefined) allowedFields.price = body.price;
    if (body.interval !== undefined) allowedFields.interval = body.interval;
    if (body.description !== undefined)
      allowedFields.description = body.description;
    if (body.features !== undefined) allowedFields.features = body.features;
    if (body.fileUrls !== undefined) allowedFields.fileUrls = body.fileUrls;
    if (body.links !== undefined) allowedFields.links = body.links;

    if (body.startDate !== undefined)
      allowedFields.startDate = new Date(body.startDate);
    if (body.nextBillingDate !== undefined)
      allowedFields.nextBillingDate = new Date(body.nextBillingDate);
    if (body.endDate !== undefined)
      allowedFields.endDate = new Date(body.endDate);

    if (
      body.status &&
      ["pending", "active", "paused", "cancelled", "expired"].includes(
        body.status
      )
    ) {
      allowedFields.status = body.status;
    }

    if (body.paypalSubscriptionId !== undefined)
      allowedFields.paypalSubscriptionId = body.paypalSubscriptionId;
    if (body.paystackSubscriptionCode !== undefined)
      allowedFields.paystackSubscriptionCode = body.paystackSubscriptionCode;
    if (body.paystackEmailToken !== undefined)
      allowedFields.paystackEmailToken = body.paystackEmailToken;

    if (body.status?.toLowerCase() === "cancelled") {
      const subscription = await Subscription.findById(params.id);

      if (
        subscription?.paystackSubscriptionCode &&
        subscription?.paystackEmailToken
      ) {
        try {
          const response = await axios.post(
            "https://api.paystack.co/subscription/disable",
            {
              code: subscription.paystackSubscriptionCode,
              token: subscription.paystackEmailToken,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("👉 Paystack cancel response:", response.data);
        } catch (err) {
          const error = err as AxiosError<{ message?: string }>;
          console.error(
            "❌ Failed to cancel Paystack subscription:",
            error.response?.data || error.message
          );
        }
      } else {
        console.warn(
          "⚠️ No paystackSubscriptionCode or paystackEmailToken found."
        );
      }
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      params.id,
      { $set: allowedFields },
      { new: true }
    );

    if (!updatedSubscription) {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error("PATCH /api/subscription/[id] error:", error);
    return NextResponse.json(
      { message: "Error updating subscription" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    await connectDB();
    const subscription = await Subscription.findById(params.id);

    if (!subscription) {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 404 }
      );
    }

    if (!["cancelled", "expired"].includes(subscription.status)) {
      return NextResponse.json(
        {
          message: "Can only delete cancelled or expired subscriptions",
        },
        { status: 403 }
      );
    }

    await Subscription.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/subscription/[id] error:", error);
    return NextResponse.json(
      { message: "Error deleting subscription" },
      { status: 500 }
    );
  }
}
