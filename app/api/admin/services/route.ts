import { connectDB } from "@/lib/DB/ConnectDB";
import Services from "@/lib/model/services";

import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    console.log("✅ Database connected for POST");

    const body = await req.json();
    console.log("📥 POST body:", body);

    // Create a new Service document
    const newService = new Services({
      title: body.title,
      description: body.description,
      badge: body.badge || "",
      icon: body.icon,
    });

    await newService.save();
    console.log("✅ Service created:", newService);

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/services error:", error);
    return NextResponse.json(
      { message: "Failed to create service" },
      { status: 500 }
    );
  }
}
