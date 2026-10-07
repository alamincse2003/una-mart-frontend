// Storefront calls made from the browser (cart, checkout, orders, login).
// Cookies (una_cart, una_session) travel with every request; see lib/http.ts.
import { toProduct, type ApiProductListItem } from "./adapters";
import { productQueryString } from "./catalog";
import { request } from "./http";
import type {
  Cart,
  CreateOrderRequest,
  CustomerOrder,
  DeliveryZone,
  Me,
  OrderSummary,
  OtpSent,
  Page,
  Product,
} from "./types";

export { ApiError } from "./http";

export const apiClient = {
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const page = await request<Page<ApiProductListItem>>(`/products${productQueryString({ ids, pageSize: 100 })}`);
    return page.items.map(toProduct);
  },

  getDeliveryZones: () => request<DeliveryZone[]>("/delivery-zones"),

  // ---- cart ----
  getCart: () => request<Cart>("/cart"),
  addCartItem: (variantId: string, quantity: number) =>
    request<Cart>("/cart/items", { method: "POST", body: { variantId, quantity } }),
  updateCartItem: (itemId: string, quantity: number) =>
    request<Cart>(`/cart/items/${itemId}`, { method: "PATCH", body: { quantity } }),
  removeCartItem: (itemId: string) => request<Cart>(`/cart/items/${itemId}`, { method: "DELETE" }),

  // ---- orders ----
  createOrder: (input: CreateOrderRequest) => request<CustomerOrder>("/orders", { method: "POST", body: input }),
  /** Owner when logged in; guests pass the phone used at checkout. */
  getOrder: (orderNumber: string, phone?: string) =>
    request<CustomerOrder>(
      `/orders/${encodeURIComponent(orderNumber)}${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`
    ),
  cancelOrder: (orderNumber: string, phone?: string) =>
    request<CustomerOrder>(
      `/orders/${encodeURIComponent(orderNumber)}/cancel${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`,
      { method: "POST" }
    ),
  myOrders: (page = 1) => request<Page<OrderSummary>>(`/orders?page=${page}&pageSize=10`),

  // ---- auth ----
  requestOtp: (phone: string, purpose: "login" | "checkout") =>
    request<OtpSent>("/auth/otp/request", { method: "POST", body: { phone, purpose } }),
  verifyOtp: (phone: string, code: string) => request<Me>("/auth/otp/verify", { method: "POST", body: { phone, code } }),
  me: () => request<Me>("/auth/me"),
  updateMe: (patch: { name?: string; email?: string }) => request<Me>("/auth/me", { method: "PATCH", body: patch }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
};
