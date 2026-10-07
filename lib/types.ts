// Types the storefront works with. Shapes follow the NestJS API
// (una-mart-backend, /docs-json); lib/adapters.ts maps API payloads into the
// few UI-friendly shapes below (Product, Category).
//
// MONEY: every amount is integer poisha (৳1 = 100 poisha). Only formatPrice
// (lib/format.ts) converts to taka for display.

export type UserRole = "customer" | "admin" | "seller";

export interface Me {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  /** "admin" only for sessions from the admin (password + OTP) login. */
  scope: "customer" | "admin";
}

export type ProductBadge = "new" | "sale" | "best";

export interface Variant {
  id: string;
  sku: string;
  /** e.g. { size: "M" }; empty for simple products. */
  options: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stockQty: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** Empty on list items; filled on the product page. */
  description: string;
  /** Cheapest active variant (list) or the default variant (detail). */
  price: number;
  /** Was-price, only when discounted. */
  originalPrice?: number;
  /** Units across active variants. */
  stockQty: number;
  categoryId: string;
  images: string[];
  badge: ProductBadge | null;
  freeDelivery: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  /** What a card's "Add to cart" adds (cheapest active variant). */
  defaultVariantId: string;
  /** > 1 means the shopper must pick an option on the product page. */
  variantCount: number;
  /** Product page only. */
  variants?: Variant[];
  categoryPath?: { id: string; name: string; slug: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl?: string | null;
}

export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Cart — the server cart is the source of truth (prices included).
// ---------------------------------------------------------------------------

export interface CartLine {
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  imageUrl: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineTotal: number;
  stockQty: number;
  freeDelivery: boolean;
  /** Set when the line can't be ordered as-is (excluded from subtotal). */
  issue: "unavailable" | "insufficient_stock" | null;
}

export interface Cart {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
}

// ---------------------------------------------------------------------------
// Delivery + orders
// ---------------------------------------------------------------------------

export interface DeliveryZone {
  id: string;
  code: string;
  name: string;
  fee: number;
  etaText: string;
}

export type OrderStatus =
  | "awaiting_payment"
  | "pending_confirmation"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "delivery_failed"
  | "returned_to_warehouse"
  | "cancelled";

export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "partially_refunded" | "refunded";

export interface Address {
  line1: string;
  area?: string;
  city: string;
}

/** Body of POST /orders. Items come from the server cart and are re-priced there. */
export interface CreateOrderRequest {
  customerName: string;
  phone: string;
  email?: string;
  address: Address;
  deliveryZone: string;
  paymentMethod: PaymentMethod;
  note?: string;
  /** Checkout OTP, after the API answered OTP_REQUIRED. */
  otpCode?: string;
}

export interface OrderItem {
  productName: string;
  variantLabel: string;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CustomerOrder {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  placedAt: string;
  customerName: string;
  phone: string;
  email: string | null;
  shippingAddress: Address;
  deliveryZone: { code: string; name: string; etaText: string };
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  timeline: { status: OrderStatus; at: string; note: string | null }[];
  cancellable: boolean;
}

export interface OrderSummary {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  placedAt: string;
  itemCount: number;
  total: number;
  imageUrl: string | null;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface OtpSent {
  expiresInSeconds: number;
  /** Development only (backend SMS_PROVIDER=console). */
  devCode?: string;
}
