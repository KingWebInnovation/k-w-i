import { connectDB } from "@/lib/DB/ConnectDB";
import { Subscription } from "@/lib/model/Subscription";
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

    // Only allow subscription-related fields
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

// DELETE /api/subscription/[id]
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
