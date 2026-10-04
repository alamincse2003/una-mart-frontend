import type { Metadata } from "next";
import { OrderDetailView } from "@/components/admin/OrderDetailView";

export async function generateMetadata({ params }: PageProps<"/admin/orders/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}` };
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
