"use client";

import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function StripeCheckoutForm({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("StripeCheckoutForm handleSubmit called");
    console.log("stripe:", stripe);
    console.log("elements:", elements);

    if (!stripe || !elements) {
      console.error("Stripe.js or Elements not loaded");
      toast.error("Stripe is not ready. Try again later.");
      return;
    }

    setProcessing(true);
    try {
      console.log(
        "Creating PaymentIntent for orderId:",
        orderId,
        "amount:",
        amount
      );

      const { data } = await axios.post("/api/stripe/create", {
        orderId,
        amount,
      });

      console.log("PaymentIntent response:", data);

      const cardElement = elements.getElement(CardElement);
      console.log("cardElement:", cardElement);

      if (!cardElement) {
        console.error("CardElement not found");
        toast.error("Payment element not found");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        { payment_method: { card: cardElement } }
      );

      console.log("confirmCardPayment result:", { error, paymentIntent });

      if (error) {
        console.error("Payment failed:", error);
        toast.error(error.message);
      } else if (paymentIntent?.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);
        toast.success("Payment successful!");
        // optionally update order status via API
      } else {
        console.warn("Payment status:", paymentIntent?.status);
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      toast.error("Payment failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <CardElement />
      <button type="submit" disabled={!stripe || processing}>
        {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}
