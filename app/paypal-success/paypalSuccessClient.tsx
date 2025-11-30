"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";

export default function PayPalSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const capturePayment = async () => {
      const orderId = searchParams.get("token");
      const payerId = searchParams.get("PayerID");

      console.log("💡 PayPal Success params:", { orderId, payerId });

      if (!orderId || !payerId) {
        console.warn("⚠️ Missing PayPal token/orderId or PayerID!");
        router.push("/paypal-error");
        return;
      }

      try {
        console.log("💡 Sending capture request for orderId:", orderId);
        const res = await axios.post("/api/paypal/capture", {
          orderId,
          payerId,
        });
        console.log("✅ Capture response:", res.data);

        // Redirect to orders page on success
        router.push("/orders");
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(
            "❌ Capture failed:",
            err.response?.data || err.message
          );
        } else if (err instanceof Error) {
          console.error("❌ Capture failed:", err.message);
        } else {
          console.error("❌ Capture failed: Unknown error", err);
        }
        router.push("/paypal-error");
      }
    };

    capturePayment();
  }, [searchParams, router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Processing your payment...</h1>
      <p>Please wait while we confirm your transaction.</p>
    </div>
  );
}
