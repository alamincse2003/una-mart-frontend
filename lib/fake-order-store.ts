// In-memory orders for Phase 1, created by POST /api/orders. The NestJS
// OrdersService replaces this — same request/response shape.
import type { CreateOrderRequest, CreateOrderResponse, Order } from "./types";
import { getProductById } from "./fake-data";
import { clearCart, getCart } from "./fake-cart-store";
import { getDeliveryFee, getSubtotal, priceCartLines } from "./pricing";

// Phone is kept alongside so guest order lookup can verify the caller.
const orders = new Map<string, { phone: string; response: CreateOrderResponse }>();
let sequence = 10230;

export class OrderError extends Error {}

export function createOrder(
  sessionId: string,
  input: CreateOrderRequest
): CreateOrderResponse {
  const cart = getCart(sessionId);
  if (cart.items.length === 0) throw new OrderError("Your cart is empty.");

  const products = Object.fromEntries(
    cart.items.flatMap((item) => {
      const product = getProductById(item.productId);
      return product ? [[product.id, product]] : [];
    })
  );
  const lines = priceCartLines(cart.items, products);

  for (const { product, item } of lines) {
    if (product.status === "out_of_stock" || item.quantity > product.stockQty) {
      throw new OrderError(`${product.name} doesn't have enough stock.`);
    }
  }

  const deliveryFee = getDeliveryFee(input.deliveryZone, lines);
  const orderId = `UM-${++sequence}`;
  const order: Order = {
    id: orderId,
    userId: sessionId, // guest checkout — becomes the real user id with auth
    status: "pending", // bKash/Nagad flip to "paid" via payment callback
    totalAmount: getSubtotal(lines) + deliveryFee,
    paymentMethod: input.paymentMethod,
    shippingAddress: `${input.address}, ${input.city}`,
    createdAt: new Date().toISOString(),
  };
  const response: CreateOrderResponse = {
    order,
    deliveryFee,
    items: lines.map(({ item, product }, i) => ({
      id: `${orderId}-${i + 1}`,
      orderId,
      productId: product.id,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    })),
  };

  orders.set(orderId, { phone: input.phone, response });
  clearCart(sessionId);
  return response;
}

const normalizePhone = (phone: string) => phone.replace(/[\s-]/g, "").replace(/^\+?88/, "");

/** Guest lookup: requires the phone number the order was placed with. */
export function findOrder(orderId: string, phone: string): CreateOrderResponse | null {
  const record = orders.get(orderId.trim().toUpperCase());
  if (!record || normalizePhone(record.phone) !== normalizePhone(phone)) return null;
  return record.response;
}
