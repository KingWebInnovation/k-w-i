import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 🔥 Update order status after successful payment
    await axios.patch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${orderId}`,
      {
        paymentStatus: "captured",
        status: "inprogress",
      }
    );

    console.log("✔ Order updated successfully:", orderId);

    // Redirect user back to their orders page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/clientdashboard/orders/${orderId}?success=true`
    );
  } catch (err) {
    console.error("❌ Stripe success handling error:", err);
    return NextResponse.json(
      { error: "Failed to handle Stripe success" },
      { status: 500 }
    );
  }
}
