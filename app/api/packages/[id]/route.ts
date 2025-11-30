import { connectDB } from "@/lib/DB/ConnectDB";
import Packages from "@/lib/model/packages";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  console.log("🚀 GET /api/packages/[id] called with id:", params.id);

  try {
    await connectDB();
    console.log("✅ Database connected");

    const packageDoc = await Packages.findById(params.id).lean();
    console.log("📦 Package fetched from DB:", packageDoc);

    if (!packageDoc) {
      console.warn("⚠️ Package not found:", params.id);
      return NextResponse.json(
        { message: "Package not found" },
        { status: 404 }
      );
    }

    console.log("✅ Returning package");
    return NextResponse.json(packageDoc);
  } catch (error) {
    console.error("❌ GET /api/packages/[id] error:", error);
    return NextResponse.json(
      { message: "Error fetching package" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const packageId = params.id;

  try {
    await connectDB();
    console.log("✅ Database connected for PATCH");

    const body = await req.json();
    console.log("📥 PATCH body:", body);

    // Update the package
    const updatedPackage = await Packages.findByIdAndUpdate(packageId, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedPackage) {
      console.warn("⚠️ Package not found for update:", packageId);
      return NextResponse.json(
        { message: "Package not found" },
        { status: 404 }
      );
    }

    console.log("✅ Package updated:", updatedPackage);
    return NextResponse.json(updatedPackage, { status: 200 });
  } catch (error) {
    console.error("❌ PATCH /api/packages/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update package" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const packageId = params.id;

  try {
    await connectDB();
    console.log("✅ Database connected for DELETE");

    const deletedPackage = await Packages.findByIdAndDelete(packageId).lean();

    if (!deletedPackage) {
      console.warn("⚠️ Package not found for deletion:", packageId);
      return NextResponse.json(
        { message: "Package not found" },
        { status: 404 }
      );
    }

    console.log("✅ Package deleted:", deletedPackage);
    return NextResponse.json(
      { message: "Package deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /api/packages/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete package" },
      { status: 500 }
    );
  }
}
