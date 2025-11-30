import PayPalSuccessClient from "./paypalSuccessClient";

export const dynamic = "force-dynamic"; // ensures no prerendering

export default function PayPalSuccessPage() {
  return <PayPalSuccessClient />;
}
