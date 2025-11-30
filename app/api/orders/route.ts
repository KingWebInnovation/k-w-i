import { connectDB } from "@/lib/DB/ConnectDB";
import { sendEmail } from "@/lib/email/sendEmail";
import { Order } from "@/lib/model/Order";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const userId = formData.get("userId")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    const email = formData.get("email")?.toString() ?? "";
    const phone = formData.get("phone")?.toString() ?? "";
    const planId = formData.get("planId")?.toString() ?? "";
    const planTitle = formData.get("planTitle")?.toString() ?? "";
    const planType = formData.get("planType")?.toString() as
      | "development"
      | "maintenance";
    const description = formData.get("description")?.toString() ?? "";
    const price = Number(formData.get("price")) || 0;

    // Features array
    const features: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("features[")) {
        const value = formData.get(key);
        if (value) features.push(value.toString());
      }
    }

    // File URLs
    const fileUrls: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("fileUrls[")) {
        const value = formData.get(key);
        if (value) fileUrls.push(value.toString());
      }
    }

    // Links
    const links: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("links[")) {
        const value = formData.get(key);
        if (value) links.push(value.toString());
      }
    }

    // Create order
    const order = await Order.create({
      userId,
      name,
      email,
      phone,
      planId,
      planTitle,
      planType,
      features,
      description,
      fileUrls,
      links,
      price,
    });

    // Send notification email
    const notifyTo = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
    if (notifyTo) {
      const emailText = `
New order received!

Name: ${name}
Email: ${email}
Phone: ${phone}
Plan: ${planTitle} (${planType})
Price: $${price.toFixed(2)}
Description: ${description}

Attached Links: ${links.length > 0 ? links.join(", ") : "None"}
Attachments: ${fileUrls.length > 0 ? fileUrls.join(", ") : "None"}
Order ID: ${order._id}
Created At: ${order.createdAt.toLocaleString()}
      `;

      await sendEmail({
        to: notifyTo,
        subject: `New Order Received: ${order._id}`,
        text: emailText,
      });
    }

    return NextResponse.json({
      message: "Order created successfully",
      order,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Order creation error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("❌ Unknown error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const orders = await Order.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
