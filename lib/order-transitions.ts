import type { OrderStatus } from "./types";

// Allowed status moves on the current OrderStatus. SYSTEM_DESIGN's fuller
// lifecycle (pending_confirmation, processing, delivery_failed, separate
// payment_status) lands with the backend; until then this is the single
// place that decides which transitions are legal — the API enforces it and
// the admin UI only offers these.
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
