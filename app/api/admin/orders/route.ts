// app/api/admin/orders/route.ts
import { connectDB } from "@/lib/DB/ConnectDB";
import { Order } from "@/lib/model/Order";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Connect to DB
  await connectDB();

  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (err) {
    console.error("❌ Fetch orders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
