import type { Metadata } from "next";
import { AuthPage } from "@/components/customer/AuthPage";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
