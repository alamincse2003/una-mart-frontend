// Catalog reads for server components (pages, layout, sitemap). Cached with
// ISR: the API is asked at most once a minute per URL, so admin edits show up
// on the storefront within ~60 seconds.
import { cache } from "react";
import { ApiError, queryString, request } from "./http";
import {
  flattenCategories,
  toProduct,
  toProductDetail,
  type ApiCategoryNode,
  type ApiProductDetail,
  type ApiProductListItem,
} from "./adapters";
import type { Category, Page, Product, ProductPage } from "./types";

export const CATALOG_REVALIDATE = 60;

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export interface ProductQuery {
  /** One or more category slugs (any of them, subcategories included). */
  category?: string[];
  q?: string;
  ids?: string[];
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export function productQueryString(query: ProductQuery): string {
  return queryString({
    category: query.category?.join(","),
    q: query.q,
    ids: query.ids?.join(","),
    price_min: query.priceMin,
    price_max: query.priceMax,
    rating_min: query.ratingMin,
    in_stock: query.inStock,
    on_sale: query.onSale,
    sort: query.sort,
    page: query.page,
    pageSize: query.pageSize,
  });
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const tree = await request<ApiCategoryNode[]>("/categories", { revalidate: CATALOG_REVALIDATE });
  return flattenCategories(tree);
});

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const page = await request<Page<ApiProductListItem>>(`/products${productQueryString(query)}`, {
    revalidate: CATALOG_REVALIDATE,
  });
  return { ...page, items: page.items.map(toProduct) };
}

/** Every active product (pages of 100). Fine at today's catalog size. */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const first = await getProducts({ pageSize: 100 });
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) => getProducts({ pageSize: 100, page: i + 2 }))
  );
  return [first, ...rest].flatMap((p) => p.items);
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  try {
    return toProductDetail(
      await request<ApiProductDetail>(`/products/${encodeURIComponent(slug)}`, { revalidate: CATALOG_REVALIDATE })
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

/** Cheapest and dearest price within a scope — the price filter's placeholders. */
export async function getPriceBounds(scope: Pick<ProductQuery, "category" | "q">) {
  const [low, high] = await Promise.all([
    getProducts({ ...scope, sort: "price-asc", pageSize: 1 }),
    getProducts({ ...scope, sort: "price-desc", pageSize: 1 }),
  ]);
  return { min: low.items[0]?.price ?? 0, max: high.items[0]?.price ?? 0 };
}

// ---- category helpers over the flat list ----------------------------------

export function descendantIds(categories: Category[], rootId: string): Set<string> {
  const result = new Set([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const c of categories) {
      if (c.parentId && result.has(c.parentId) && !result.has(c.id)) {
        result.add(c.id);
        added = true;
      }
    }
  }
  return result;
}

export function categoryPath(categories: Category[], id: string): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const path: Category[] = [];
  let current = byId.get(id);
  while (current && !path.includes(current)) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}
