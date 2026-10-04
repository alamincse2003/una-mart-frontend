// Admin data access — mirrors SYSTEM_DESIGN's /admin/* endpoints. Points at
// the fake /api/admin/* routes in Phase 1; kept separate from apiClient so
// admin code stays out of the storefront bundle.
import { ApiError } from "./api-client";
import type { ProductInput } from "./fake-data";
import type { AdminOrder, AdminStats, Category, OrderStatus, Product } from "./types";

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "/api"}/admin`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(body?.message ?? "Something went wrong.", res.status);
  }
  return res.json() as Promise<T>;
}

const json = (body: unknown) => JSON.stringify(body);

export type { ProductInput };

export const adminApi = {
  getStats: () => request<AdminStats>("/stats"),

  listOrders(params: { status?: OrderStatus; q?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.q) query.set("q", params.q);
    const qs = query.toString();
    return request<AdminOrder[]>(`/orders${qs ? `?${qs}` : ""}`);
  },
  getOrder: (id: string) => request<AdminOrder>(`/orders/${encodeURIComponent(id)}`),
  transitionOrder: (id: string, to: OrderStatus, note?: string) =>
    request<AdminOrder>(`/orders/${encodeURIComponent(id)}/transition`, {
      method: "POST",
      body: json({ to, note }),
    }),

  listProducts: () => request<Product[]>("/products"),
  getProduct: (id: string) => request<Product>(`/products/${encodeURIComponent(id)}`),
  createProduct: (input: ProductInput) =>
    request<Product>("/products", { method: "POST", body: json(input) }),
  updateProduct: (id: string, patch: Partial<ProductInput>) =>
    request<Product>(`/products/${encodeURIComponent(id)}`, { method: "PATCH", body: json(patch) }),

  listCategories: () => request<Category[]>("/categories"),
  createCategory: (input: { name: string; parentId?: string | null }) =>
    request<Category>("/categories", { method: "POST", body: json(input) }),
  updateCategory: (id: string, patch: { name?: string; parentId?: string | null }) =>
    request<Category>(`/categories/${encodeURIComponent(id)}`, { method: "PATCH", body: json(patch) }),
  deleteCategory: (id: string) =>
    request<{ ok: true }>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
