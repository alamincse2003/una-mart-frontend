// Admin API (/v1/admin/*). Kept separate from apiClient so admin code stays
// out of the storefront bundle. Every route needs an admin session (password
// + OTP login); the API enforces it — the UI only redirects.
import { queryString, request } from "./http";
import type { Me, OrderStatus, OtpSent, Page, PaymentMethod, PaymentStatus } from "./types";

export { ApiError } from "./http";

// ---------------------------------------------------------------------------
// Types (money in poisha)
// ---------------------------------------------------------------------------

export interface AdminStats {
  ordersToday: number;
  revenueToday: number;
  pendingConfirmation: number;
  statusCounts: Partial<Record<OrderStatus, number>>;
  lowStockCount: number;
  lowStockThreshold: number;
  lowStock: { variantId: string; productId: string; productName: string; sku: string; stockQty: number }[];
}

export interface AdminOrderRow {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerName: string;
  phone: string;
  phoneVerified: boolean;
  deliveryZone: string;
  itemCount: number;
  total: number;
  placedAt: string;
}

export interface PhoneFlag {
  phone: string;
  codRefusedCount: number;
  codDeliveredCount: number;
  isBlocked: boolean;
  note: string | null;
  updatedAt: string | null;
}

export interface AdminOrderDetail extends AdminOrderRow {
  email: string | null;
  shippingAddress: { line1: string; area?: string; city: string };
  deliveryZoneDetail: { code: string; name: string; etaText: string };
  items: {
    variantId: string;
    productName: string;
    variantLabel: string;
    sku: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  customerNote: string | null;
  adminNote: string | null;
  timeline: {
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    actorType: "customer" | "admin" | "system" | "courier" | "payment";
    actorName: string | null;
    note: string | null;
    at: string;
  }[];
  payments: { provider: string; amount: number; status: string; createdAt: string }[];
  phoneFlag: PhoneFlag;
  allowedTransitions: OrderStatus[];
}

export type ProductStatus = "draft" | "active" | "archived";
export type ProductBadge = "new" | "sale" | "best";

export interface AdminVariant {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stockQty: number;
  isActive: boolean;
}

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  badge: ProductBadge | null;
  category: { id: string; name: string; slug: string };
  price: number | null;
  compareAtPrice: number | null;
  stockTotal: number;
  variantCount: number;
  imageUrl: string | null;
  updatedAt: string;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string | null;
  status: ProductStatus;
  badge: ProductBadge | null;
  freeDelivery: boolean;
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string; sortOrder: number }[];
  variants: AdminVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface VariantInput {
  sku: string;
  options?: Record<string, string>;
  price: number;
  compareAtPrice?: number | null;
  stockQty?: number;
}

export interface ProductInput {
  name: string;
  slug?: string;
  description: string;
  categoryId: string;
  brand?: string | null;
  status?: ProductStatus;
  badge?: ProductBadge | null;
  freeDelivery?: boolean;
  images?: string[];
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
}

export interface AdminZone {
  id: string;
  code: string;
  name: string;
  fee: number;
  etaText: string;
  isActive: boolean;
  sortOrder: number;
}

// ---------------------------------------------------------------------------

const enc = encodeURIComponent;

export const adminApi = {
  // auth
  login: (phone: string, password: string) =>
    request<OtpSent>("/auth/admin/login", { method: "POST", body: { phone, password } }),
  verify: (phone: string, code: string) => request<Me>("/auth/admin/verify", { method: "POST", body: { phone, code } }),
  me: () => request<Me>("/auth/me"),
  logout: () => request<void>("/auth/logout", { method: "POST" }),

  getStats: () => request<AdminStats>("/admin/stats"),

  // orders
  listOrders: (params: { status?: OrderStatus; q?: string; page?: number; pageSize?: number } = {}) =>
    request<Page<AdminOrderRow>>(`/admin/orders${queryString(params)}`),
  getOrder: (orderNumber: string) => request<AdminOrderDetail>(`/admin/orders/${enc(orderNumber)}`),
  transitionOrder: (orderNumber: string, to: OrderStatus, note?: string) =>
    request<AdminOrderDetail>(`/admin/orders/${enc(orderNumber)}/transition`, { method: "POST", body: { to, note } }),
  updateOrderNote: (orderNumber: string, adminNote: string) =>
    request<AdminOrderDetail>(`/admin/orders/${enc(orderNumber)}`, { method: "PATCH", body: { adminNote } }),

  // products
  listProducts: (
    params: { q?: string; status?: ProductStatus; categoryId?: string; page?: number; pageSize?: number } = {}
  ) =>
    request<Page<AdminProductRow>>(`/admin/products${queryString(params)}`),
  getProduct: (id: string) => request<AdminProduct>(`/admin/products/${enc(id)}`),
  createProduct: (input: ProductInput & { variant: VariantInput }) =>
    request<AdminProduct>("/admin/products", { method: "POST", body: input }),
  updateProduct: (id: string, patch: Partial<ProductInput>) =>
    request<AdminProduct>(`/admin/products/${enc(id)}`, { method: "PATCH", body: patch }),
  addVariant: (productId: string, input: VariantInput) =>
    request<AdminProduct>(`/admin/products/${enc(productId)}/variants`, { method: "POST", body: input }),
  updateVariant: (
    variantId: string,
    patch: Partial<Pick<AdminVariant, "sku" | "options" | "price" | "compareAtPrice" | "isActive">>
  ) => request<AdminProduct>(`/admin/variants/${enc(variantId)}`, { method: "PATCH", body: patch }),
  adjustStock: (variantId: string, delta: number, reason: "restock" | "adjustment", note?: string) =>
    request<{ variantId: string; stockQty: number }>(`/admin/variants/${enc(variantId)}/stock`, {
      method: "POST",
      body: { delta, reason, note },
    }),

  // categories
  listCategories: () => request<AdminCategory[]>("/admin/categories"),
  createCategory: (input: { name: string; slug: string; parentId?: string | null; isActive?: boolean }) =>
    request<AdminCategory>("/admin/categories", { method: "POST", body: input }),
  updateCategory: (
    id: string,
    patch: Partial<Pick<AdminCategory, "name" | "slug" | "parentId" | "sortOrder" | "isActive">>
  ) => request<AdminCategory>(`/admin/categories/${enc(id)}`, { method: "PATCH", body: patch }),

  // settings
  listZones: () => request<AdminZone[]>("/admin/delivery-zones"),
  updateZone: (code: string, patch: Partial<Pick<AdminZone, "name" | "fee" | "etaText" | "isActive">>) =>
    request<AdminZone>(`/admin/delivery-zones/${enc(code)}`, { method: "PATCH", body: patch }),
  updatePhoneFlag: (phone: string, patch: { isBlocked?: boolean; note?: string | null }) =>
    request<PhoneFlag>(`/admin/phone-flags/${enc(phone)}`, { method: "PATCH", body: patch }),
};
