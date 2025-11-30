import { connectDB } from "@/lib/DB/ConnectDB";
import Services from "@/lib/model/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    await connectDB();
    const service = await Services.findById(params.id);

    if (!service)
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );

    return NextResponse.json(service);
  } catch (error) {
    console.error("GET /api/service/[id] error:", error);
    return NextResponse.json(
      { message: "Error fetching service" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const serviceId = params.id;

  try {
    await connectDB();
    console.log("✅ Database connected for PATCH");

    const body = await req.json();
    console.log("📥 PATCH body:", body);

    // Update the service
    const updatedService = await Services.findByIdAndUpdate(serviceId, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedService) {
      console.warn("⚠️ Service not found for update:", serviceId);
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    console.log("✅ Service updated:", updatedService);
    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    console.error("❌ PATCH /api/admin/services/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const serviceId = params.id;

  try {
    await connectDB();
    console.log("✅ Database connected for DELETE");

    const deletedService = await Services.findByIdAndDelete(serviceId).lean();

    if (!deletedService) {
      console.warn("⚠️ Service not found for deletion:", serviceId);
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    console.log("✅ Service deleted:", serviceId);
    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /api/admin/services/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
