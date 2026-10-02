import type { Metadata } from "next";
import { CheckoutView } from "@/components/customer/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
