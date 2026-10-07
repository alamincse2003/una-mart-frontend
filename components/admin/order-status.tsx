import type { OrderStatus } from "@/lib/types";

// Admin wording for each status (SYSTEM_DESIGN.md order lifecycle).
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  pending_confirmation: "Pending confirmation",
  confirmed: "Confirmed",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
  delivery_failed: "Delivery failed",
  returned_to_warehouse: "Returned",
  cancelled: "Cancelled",
};

/** Button text for moving an order INTO a status. */
export const TRANSITION_ACTION_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Await payment",
  pending_confirmation: "Reopen",
  confirmed: "Confirm order",
  processing: "Start packing",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  delivery_failed: "Delivery failed",
  returned_to_warehouse: "Received back in warehouse",
  cancelled: "Cancel order",
};

const TONE: Record<OrderStatus, string> = {
  awaiting_payment: "bg-warning-bg text-warning",
  pending_confirmation: "bg-warning-bg text-warning",
  confirmed: "bg-info-bg text-info",
  processing: "bg-info-bg text-info",
  shipped: "bg-navy-50 text-navy-800",
  delivered: "bg-success-bg text-success",
  delivery_failed: "bg-danger-bg text-danger",
  returned_to_warehouse: "bg-neutral-100 text-neutral-700",
  cancelled: "bg-danger-bg text-danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-semibold ${TONE[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
