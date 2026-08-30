// Single place all frontend data fetching goes through. In Phase 1 it
// points at /app/api/* (fake). When the NestJS backend is ready, only
// NEXT_PUBLIC_API_URL changes — components never call fetch directly.
import type { Cart, Category, Product } from "./types";

const API_PATH = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// Relative URLs only work in the browser. Server components (e.g. the
// homepage) need an absolute URL, so resolve one when running server-side.
function resolveBaseUrl(): string {
  if (typeof window !== "undefined") {
    return API_PATH;
  }
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${origin}${API_PATH}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  getProducts(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
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
};
