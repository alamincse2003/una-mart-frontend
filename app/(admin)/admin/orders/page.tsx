import type { Metadata } from "next";
import { OrdersView } from "@/components/admin/OrdersView";
import { ORDER_STATUS_LABELS } from "@/components/admin/order-status";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { status } = await searchParams;
  const initial = typeof status === "string" && status in ORDER_STATUS_LABELS ? (status as OrderStatus) : undefined;
  return <OrdersView initialStatus={initial} />;
}
