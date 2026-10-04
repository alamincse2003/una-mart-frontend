// Shared types matching SYSTEM_DESIGN.md's data model exactly.
// Fake data (Next.js API routes) and the future NestJS API must both
// produce payloads shaped like these — that's what makes the swap a
// one-line change instead of a rewrite.

export type UserRole = "customer" | "admin" | "seller";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export type ProductStatus = "active" | "draft" | "out_of_stock";

export type ProductBadge = "new" | "sale" | "best";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQty: number;
  categoryId: string;
  images: string[];
  status: ProductStatus;
  createdAt: string;
  sellerId?: string | null; // P2, nullable in Phase 1

  // Phase 1 display fields — optional, drive storefront card/detail UI.
  rating?: number; // 0-5
  reviewCount?: number;
  originalPrice?: number; // present only when the item is discounted
  badge?: ProductBadge | null;
  freeDelivery?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

// NOTE: "cod" is not in SYSTEM_DESIGN.md's Order.payment_method enum yet
// (bkash | nagad). The storefront offers Cash on Delivery, so the backend
// schema needs it too — flagged for the NestJS Order entity.
export type PaymentMethod = "bkash" | "nagad" | "cod";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  createdAt: string;
}

// Body of POST /orders. The server reads items from the session cart and
// re-prices them — the client never sends prices it expects to be trusted.
export interface CreateOrderRequest {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  deliveryZone: "inside_dhaka" | "outside_dhaka";
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface CreateOrderResponse {
  order: Order;
  items: OrderItem[];
  deliveryFee: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  sellerId?: string | null; // P2, for splitting orders across sellers
}

// Admin views (GET /admin/orders). SYSTEM_DESIGN's OrderStatusEvent —
// every status change is recorded with who made it.
export interface OrderStatusEvent {
  from: OrderStatus | null;
  to: OrderStatus;
  actor: "customer" | "admin" | "system";
  note?: string;
  at: string;
}

export interface AdminOrder extends Order {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  deliveryZone: CreateOrderRequest["deliveryZone"];
  customerNote?: string;
  deliveryFee: number;
  items: OrderItem[];
  history: OrderStatusEvent[];
}

export interface AdminStats {
  ordersToday: number;
  pendingConfirmation: number;
  revenueToday: number;
  lowStockCount: number;
  statusCounts: Record<OrderStatus, number>;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// P2, not built yet — included so migrations aren't destructive later.
export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  verificationStatus: string;
  commissionRate: number;
}
