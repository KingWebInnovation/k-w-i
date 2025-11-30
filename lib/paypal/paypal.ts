import paypal from "@paypal/checkout-server-sdk";

const { PayPalHttpClient, SandboxEnvironment, LiveEnvironment } =
  paypal.core || paypal;

// ✅ Switch between sandbox and live
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("⚠️ Missing PayPal credentials");
  }

  if (process.env.NODE_ENV === "production") {
    // 👇 Live mode
    return new LiveEnvironment(clientId, clientSecret);
  } else {
    // 👇 Sandbox mode (for local dev)
    return new SandboxEnvironment(clientId, clientSecret);
  }
}

export function getPayPalClient() {
  return new PayPalHttpClient(environment());
}
