// app/api/subscribers/route.ts
import { connectDB } from "@/lib/DB/ConnectDB";
import Subscriber from "@/lib/model/newsletter";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(subscribers, { status: 200 });
  } catch (err) {
    console.error("❌ Fetch Subscription error:", err);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await Subscriber.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { message: "This email is already subscribed" },
        { status: 409 }
      );
    }

    // Save new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    return NextResponse.json(
      { message: "Subscribed successfully", subscriber },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Subscribe API error:", err);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
