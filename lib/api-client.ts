// Single place all frontend data fetching goes through. In Phase 1 it
// points at /app/api/* (fake). When the NestJS backend is ready, only
// NEXT_PUBLIC_API_URL changes — components never call fetch directly.
import type {
  Cart,
  Category,
  CreateOrderRequest,
  CreateOrderResponse,
  Product,
} from "./types";

const API_PATH = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// Relative URLs only work in the browser. Server components (e.g. the
// homepage) need an absolute URL, so resolve one when running server-side.
function resolveBaseUrl(): string {
  if (typeof window !== "undefined") {
    return API_PATH;
  }
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000";
  return `${origin}${API_PATH}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    // Surface the server's own message (e.g. "Only 3 in stock") so the UI
    // can show it instead of a generic failure.
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(
      body?.message ?? `Request to ${path} failed`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  getProducts(params?: { category?: string; search?: string; ids?: string[] }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.ids) query.set("ids", params.ids.join(","));
    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },

  getProduct(slug: string) {
    return request<Product>(`/products/${slug}`);
  },

  getCategories() {
    return request<Category[]>("/categories");
  },

  getCart() {
    return request<Cart>("/cart");
  },

  addCartItem(productId: string, quantity: number) {
    return request<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateCartItem(itemId: string, quantity: number) {
    return request<Cart>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  removeCartItem(itemId: string) {
    return request<Cart>(`/cart/items/${itemId}`, { method: "DELETE" });
  },

  /** Guest order lookup — phone must match the one used at checkout. */
  getOrder(orderId: string, phone: string) {
    const qs = new URLSearchParams({ phone }).toString();
    return request<CreateOrderResponse>(`/orders/${encodeURIComponent(orderId)}?${qs}`);
  },

  createOrder(input: CreateOrderRequest) {
    return request<CreateOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
