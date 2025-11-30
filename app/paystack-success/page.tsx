"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PaystackVerifyResponse {
  success: boolean;
  message?: string;
}

export default function PaystackSuccessPage({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  const reference = searchParams.reference;
  const [status, setStatus] = useState("Verifying...");
  const router = useRouter();

  useEffect(() => {
    if (!reference) {
      console.warn("⚠️ No reference provided in query params");
      setStatus("❌ No reference provided.");
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log("📤 Sending verify request to API...");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
          }
        );

        console.log("📥 API response status:", res.status);
        const data: PaystackVerifyResponse = await res.json();
        console.log("📄 API response body:", data);

        if (data.success) {
          setStatus("✅ Payment Successful!");
          // Redirect to client dashboard after a short delay
          setTimeout(() => {
            router.push("/clientdashboard");
          }, 5000);
        } else {
          setStatus("❌ Payment Failed.");
        }
      } catch (err) {
        console.error("❌ Error verifying payment:", err);
        setStatus("❌ Error verifying payment.");
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{status}</h1>
      {reference && <p>Reference: {reference}</p>}
    </div>
  );
}
