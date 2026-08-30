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

export type PaymentMethod = "bkash" | "nagad";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  sellerId?: string | null; // P2, for splitting orders across sellers
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
