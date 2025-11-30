import { connectDB } from "@/lib/DB/ConnectDB";
import Services from "@/lib/model/services";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Connect to DB
  await connectDB();

  try {
    const services = await Services.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(services);
  } catch (err) {
    console.error("❌ Fetch services error:", err);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
