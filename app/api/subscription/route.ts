import { connectDB } from "@/lib/DB/ConnectDB";
import { sendEmail } from "@/lib/email/sendEmail";
import { Subscription } from "@/lib/model/Subscription";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 🔹 1. Connect to DB
    await connectDB();

    // 🔹 2. Parse formData
    const formData = await req.formData();

    // 🔹 3. Extract base fields
    const userId = formData.get("userId")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    const email = formData.get("email")?.toString() ?? "";
    const phone = formData.get("phone")?.toString() ?? "";

    const planId = formData.get("planId")?.toString() ?? "";
    const planName = formData.get("planName")?.toString() ?? "";
    const planTitle = formData.get("planTitle")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const price = Number(formData.get("price")) || 0;
    const interval = formData.get("interval")?.toString() as
      | "monthly"
      | "yearly";

    // 🔹 4. Collect features
    const features: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("features[")) {
        const value = formData.get(key);
        if (value) features.push(value.toString());
      }
    }

    // 🔹 5. Collect file URLs
    const fileUrls: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("fileUrls[")) {
        const value = formData.get(key);
        if (value) fileUrls.push(value.toString());
      }
    }

    // 🔹 6. Collect links
    const links: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("links[")) {
        const value = formData.get(key);
        if (value) links.push(value.toString());
      }
    }

    // 🔹 7. Dates
    const startDate = new Date();
    const nextBillingDate =
      interval === "monthly"
        ? new Date(
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            startDate.getDate()
          )
        : new Date(
            startDate.getFullYear() + 1,
            startDate.getMonth(),
            startDate.getDate()
          );

    // 🔹 8. Create subscription
    const subscription = await Subscription.create({
      userId,
      name,
      email,
      phone,
      planId,
      planName, // ✅ now stored
      planTitle,
      description,
      features,
      fileUrls,
      links,
      price,
      interval,
      startDate,
      nextBillingDate,
      status: "pending",
    });

    // 🔹 9. Notify admin
    const notifyTo = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
    if (notifyTo) {
      const emailText = `
New subscription started!

Name: ${name}
Email: ${email}
Phone: ${phone}
Plan: ${planTitle} (${planName}, ${interval})
Price: $${price.toFixed(2)}
Description: ${description}

Attached Links: ${links.length > 0 ? links.join(", ") : "None"}
Attachments: ${fileUrls.length > 0 ? fileUrls.join(", ") : "None"}
Start Date: ${subscription.startDate.toLocaleDateString()}
Next Billing Date: ${subscription.nextBillingDate.toLocaleDateString()}

Subscription ID: ${subscription._id}
Created At: ${subscription.createdAt.toLocaleString()}
      `;

      await sendEmail({
        to: notifyTo,
        subject: `New Subscription Started: ${subscription._id}`,
        text: emailText,
      });
    } else {
      console.warn("⚠️ No NOTIFY_EMAIL or SMTP_USER set, skipping email.");
    }

    // 🔹 10. Respond
    return NextResponse.json({
      message: "Subscription created successfully",
      subscription,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Subscription creation error:", err.message);
      console.error("🛑 Stack:", err.stack);
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
    const subscriptions = await Subscription.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(subscriptions);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
