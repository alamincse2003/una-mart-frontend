import type { Metadata } from "next";
import { AuthPage } from "@/components/customer/AuthPage";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
