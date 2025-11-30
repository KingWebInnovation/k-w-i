import { connectDB } from "@/lib/DB/ConnectDB";
import Packages from "@/lib/model/packages";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const packages = await Packages.find().lean();

    return NextResponse.json(packages, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching packages:", error);
    return NextResponse.json(
      { message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const newPackage = new Packages(body);
    await newPackage.save();

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/packages error:", error);
    return NextResponse.json(
      { message: "Failed to create package" },
      { status: 500 }
    );
  }
}
