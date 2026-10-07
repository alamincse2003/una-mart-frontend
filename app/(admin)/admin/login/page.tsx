import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin login" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const safe =
    typeof next === "string" && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
  return <AdminLoginForm next={safe} />;
}
