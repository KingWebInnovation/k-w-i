import { connectDB } from "@/lib/DB/ConnectDB";
import Subscriber from "@/lib/model/newsletter";
import { Subscription } from "@/lib/model/Subscription";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    const data = await Subscription.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("❌ Fetch Subscription error:", err);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
