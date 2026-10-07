import type { Metadata } from "next";
import { AuthPage, safeNext } from "@/components/customer/AuthPage";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  return <AuthPage mode="login" next={safeNext((await searchParams).next)} />;
}
