import { connectDB } from "@/lib/DB/ConnectDB";
import { Order } from "@/lib/model/Order";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    await connectDB();
    const order = await Order.findById(params.id);

    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Error fetching order" },
      { status: 500 }
    );
  }
}
// PATCH /api/orders/[id]
export async function PATCH(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    await connectDB();
    const body = await req.json();

    const allowedFields: Partial<{
      email: string;
      words: number;
      subject: string;
      dueDate: Date;
      description: string;
      links: string[];
      fileUrls: string[]; // ✅ allow fileUrls
      price: number;
      status:
        | "pending"
        | "inprogress"
        | "completed"
        | "accepted"
        | "failed"
        | "cancelled";
      paymentStatus:
        | "unpaid"
        | "authorized"
        | "captured"
        | "voided"
        | "refunded";
    }> = {};

    if (body.email !== undefined) allowedFields.email = body.email;
    if (body.words !== undefined) allowedFields.words = body.words;
    if (body.subject !== undefined) allowedFields.subject = body.subject;
    if (body.dueDate !== undefined)
      allowedFields.dueDate = new Date(body.dueDate);
    if (body.description !== undefined)
      allowedFields.description = body.description;
    if (body.links !== undefined) allowedFields.links = body.links;
    if (body.fileUrls !== undefined) allowedFields.fileUrls = body.fileUrls; // ✅ add this
    if (body.price !== undefined) allowedFields.price = body.price;

    if (
      body.status &&
      [
        "pending",
        "inprogress",
        "completed",
        "accepted",
        "failed",
        "cancelled",
      ].includes(body.status)
    )
      allowedFields.status = body.status;

    if (
      body.paymentStatus &&
      ["unpaid", "authorized", "captured", "voided", "refunded"].includes(
        body.paymentStatus
      )
    )
      allowedFields.paymentStatus = body.paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { $set: allowedFields },
      { new: true }
    );

    if (!updatedOrder)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Error updating order" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] → delete only if payment not captured/authorized
export async function DELETE(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    await connectDB();
    const order = await Order.findById(params.id);

    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (["captured", "authorized"].includes(order.paymentStatus)) {
      return NextResponse.json(
        {
          message: "Cannot delete an order with captured or authorized payment",
        },
        { status: 403 }
      );
    }

    await Order.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Error deleting order" },
      { status: 500 }
    );
  }
}
