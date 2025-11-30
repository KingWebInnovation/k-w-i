import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/clientdashboard/orders/${orderId}?canceled=true`
    );
  } catch (err) {
    console.error("Stripe cancel handling error:", err);
    return NextResponse.json(
      { error: "Failed to handle Stripe cancel" },
      { status: 500 }
    );
  }
}
