import type { Metadata } from "next";
import { AuthPage, safeNext } from "@/components/customer/AuthPage";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  return <AuthPage mode="register" next={safeNext((await searchParams).next)} />;
}
