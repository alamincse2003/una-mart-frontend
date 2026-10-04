// In-memory orders for Phase 1, created by POST /api/orders and managed by
// /api/admin/orders. The NestJS OrdersService replaces this — same
// request/response shapes.
import type {
  AdminOrder,
  AdminStats,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
} from "./types";
import { adjustStock, getProductById, products } from "./fake-data";
import { clearCart, getCart } from "./fake-cart-store";
import { DELIVERY_FEE, getDeliveryFee, getSubtotal, priceCartLines } from "./pricing";
import { isLowStock, isOutOfStock } from "./product";
import { ORDER_TRANSITIONS } from "./order-transitions";

export { ORDER_TRANSITIONS };

const orders = new Map<string, AdminOrder>();
let sequence = 10230;

export class OrderError extends Error {}


const normalizePhone = (phone: string) => phone.replace(/[\s-]/g, "").replace(/^\+?88/, "");

function toResponse(record: AdminOrder): CreateOrderResponse {
  const { id, userId, status, totalAmount, paymentMethod, shippingAddress, createdAt } = record;
  const order: Order = { id, userId, status, totalAmount, paymentMethod, shippingAddress, createdAt };
  return { order, items: record.items, deliveryFee: record.deliveryFee };
}

export function createOrder(
  sessionId: string,
  input: CreateOrderRequest
): CreateOrderResponse {
  const cart = getCart(sessionId);
  if (cart.items.length === 0) throw new OrderError("Your cart is empty.");

  const productMap = Object.fromEntries(
    cart.items.flatMap((item) => {
      const product = getProductById(item.productId);
      return product ? [[product.id, product]] : [];
    })
  );
  const lines = priceCartLines(cart.items, productMap);

  for (const { product, item } of lines) {
    if (product.status === "out_of_stock" || item.quantity > product.stockQty) {
      throw new OrderError(`${product.name} doesn't have enough stock.`);
    }
  }

  const deliveryFee = getDeliveryFee(input.deliveryZone, lines);
  const orderId = `UM-${++sequence}`;
  const createdAt = new Date().toISOString();
  const record: AdminOrder = {
    id: orderId,
    userId: sessionId, // guest checkout — becomes the real user id with auth
    status: "pending",
    totalAmount: getSubtotal(lines) + deliveryFee,
    paymentMethod: input.paymentMethod,
    shippingAddress: `${input.address}, ${input.city}`,
    createdAt,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    deliveryZone: input.deliveryZone,
    customerNote: input.note,
    deliveryFee,
    items: lines.map(({ item, product }, i) => ({
      id: `${orderId}-${i + 1}`,
      orderId,
      productId: product.id,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    })),
    history: [{ from: null, to: "pending", actor: "customer", at: createdAt }],
  };

  // Stock leaves on order creation (SYSTEM_DESIGN "Order lifecycle").
  for (const item of record.items) adjustStock(item.productId, -item.quantity);

  orders.set(orderId, record);
  clearCart(sessionId);
  return toResponse(record);
}

/** Guest lookup: requires the phone number the order was placed with. */
export function findOrder(orderId: string, phone: string): CreateOrderResponse | null {
  const record = orders.get(orderId.trim().toUpperCase());
  if (!record || normalizePhone(record.phone) !== normalizePhone(phone)) return null;
  return toResponse(record);
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export function listOrders(params: { status?: OrderStatus; q?: string } = {}): AdminOrder[] {
  const q = params.q?.trim().toLowerCase();
  const qPhone = q ? normalizePhone(q) : "";
  return [...orders.values()]
    .filter((o) => !params.status || o.status === params.status)
    .filter(
      (o) =>
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (qPhone.length >= 3 && normalizePhone(o.phone).includes(qPhone))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAdminOrder(orderId: string): AdminOrder | null {
  return orders.get(orderId.trim().toUpperCase()) ?? null;
}

export function transitionOrder(orderId: string, to: OrderStatus, note?: string): AdminOrder {
  const record = getAdminOrder(orderId);
  if (!record) throw new OrderError("Order not found.");
  if (!ORDER_TRANSITIONS[record.status].includes(to)) {
    throw new OrderError(`An order that is "${record.status}" can't move to "${to}".`);
  }

  const event: OrderStatusEvent = {
    from: record.status,
    to,
    actor: "admin",
    note: note?.trim() || undefined,
    at: new Date().toISOString(),
  };
  record.status = to;
  record.history.push(event);

  // Cancelled orders put their stock back.
  if (to === "cancelled") {
    for (const item of record.items) adjustStock(item.productId, item.quantity);
  }
  return record;
}

const isSameDay = (iso: string, day: Date) => new Date(iso).toDateString() === day.toDateString();

export function getOrderStats(): AdminStats {
  const today = new Date();
  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  let ordersToday = 0;
  let revenueToday = 0;

  for (const order of orders.values()) {
    statusCounts[order.status]++;
    if (isSameDay(order.createdAt, today)) {
      ordersToday++;
      if (order.status !== "cancelled") revenueToday += order.totalAmount;
    }
  }

  const lowStockCount = products.filter(
    (p) => p.status !== "draft" && (isLowStock(p) || isOutOfStock(p))
  ).length;

  return {
    ordersToday,
    pendingConfirmation: statusCounts.pending,
    revenueToday,
    lowStockCount,
    statusCounts,
  };
}

// ---------------------------------------------------------------------------
// DEMO DATA: a few historical orders so the admin isn't empty on a fresh
// dev server. They don't move stock. Remove once orders come from the API.
// ---------------------------------------------------------------------------

function seedOrder(seed: {
  hoursAgo: number;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  zone: AdminOrder["deliveryZone"];
  paymentMethod: AdminOrder["paymentMethod"];
  items: { productId: string; quantity: number }[];
  path: OrderStatus[];
}) {
  const id = `UM-${++sequence}`;
  const createdAtMs = Date.now() - seed.hoursAgo * 3_600_000;
  const items: OrderItem[] = seed.items.flatMap((line, i) => {
    const product = getProductById(line.productId);
    return product
      ? [{ id: `${id}-${i + 1}`, orderId: id, productId: product.id, quantity: line.quantity, priceAtPurchase: product.price }]
      : [];
  });
  const subtotal = items.reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0);
  const deliveryFee = DELIVERY_FEE[seed.zone];

  const history: OrderStatusEvent[] = [];
  let previous: OrderStatus | null = null;
  seed.path.forEach((status, step) => {
    history.push({
      from: previous,
      to: status,
      actor: step === 0 ? "customer" : "admin",
      at: new Date(createdAtMs + step * 2 * 3_600_000).toISOString(),
    });
    previous = status;
  });

  orders.set(id, {
    id,
    userId: "demo",
    status: seed.path[seed.path.length - 1],
    totalAmount: subtotal + deliveryFee,
    paymentMethod: seed.paymentMethod,
    shippingAddress: `${seed.address}, ${seed.city}`,
    createdAt: new Date(createdAtMs).toISOString(),
    customerName: seed.customerName,
    phone: seed.phone,
    address: seed.address,
    city: seed.city,
    deliveryZone: seed.zone,
    deliveryFee,
    items,
    history,
  });
}

seedOrder({
  hoursAgo: 1,
  customerName: "Nusrat Jahan",
  phone: "01712345678",
  city: "Dhaka",
  address: "House 12, Road 5, Dhanmondi",
  zone: "inside_dhaka",
  paymentMethod: "cod",
  items: [{ productId: "prod-1", quantity: 1 }],
  path: ["pending"],
});
seedOrder({
  hoursAgo: 3,
  customerName: "Tanvir Ahmed",
  phone: "01811223344",
  city: "Chattogram",
  address: "Flat 4B, GEC Circle",
  zone: "outside_dhaka",
  paymentMethod: "bkash",
  items: [
    { productId: "prod-3", quantity: 1 },
    { productId: "prod-5", quantity: 1 },
  ],
  path: ["pending", "paid"],
});
seedOrder({
  hoursAgo: 26,
  customerName: "Rafiul Islam",
  phone: "01922334455",
  city: "Dhaka",
  address: "Block C, Bashundhara R/A",
  zone: "inside_dhaka",
  paymentMethod: "cod",
  items: [{ productId: "prod-12", quantity: 1 }],
  path: ["pending", "paid", "shipped"],
});
seedOrder({
  hoursAgo: 30,
  customerName: "Sadia Rahman",
  phone: "01633445566",
  city: "Sylhet",
  address: "Zindabazar, 2nd floor",
  zone: "outside_dhaka",
  paymentMethod: "nagad",
  items: [{ productId: "prod-14", quantity: 2 }],
  path: ["pending", "cancelled"],
});
seedOrder({
  hoursAgo: 72,
  customerName: "Mahmudul Hasan",
  phone: "01555667788",
  city: "Dhaka",
  address: "Sector 7, Uttara",
  zone: "inside_dhaka",
  paymentMethod: "cod",
  items: [
    { productId: "prod-2", quantity: 1 },
    { productId: "prod-17", quantity: 1 },
  ],
  path: ["pending", "paid", "shipped", "delivered"],
});
seedOrder({
  hoursAgo: 96,
  customerName: "Farhana Akter",
  phone: "01344556677",
  city: "Rajshahi",
  address: "Shaheb Bazar",
  zone: "outside_dhaka",
  paymentMethod: "bkash",
  items: [{ productId: "prod-13", quantity: 3 }],
  path: ["pending", "paid", "shipped", "delivered"],
});
