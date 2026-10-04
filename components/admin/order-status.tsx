import type { OrderStatus } from "@/lib/types";

// Admin wording for each status — matches the Track Order timeline
// ("pending" = placed, awaiting the confirmation call; "paid" = confirmed).
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending confirmation",
  paid: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Button text for moving an order INTO a status. */
export const TRANSITION_ACTION_LABELS: Record<OrderStatus, string> = {
  pending: "Reopen",
  paid: "Confirm order",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order",
};

const TONE: Record<OrderStatus, string> = {
  pending: "bg-warning-bg text-warning",
  paid: "bg-info-bg text-info",
  shipped: "bg-navy-50 text-navy-800",
  delivered: "bg-success-bg text-success",
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
