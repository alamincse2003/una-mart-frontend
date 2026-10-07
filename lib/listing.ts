// Product listing state lives in the URL (?cat=&min=&max=&rating=&stock=1
// &sale=1&sort=&page=) so filtered views are shareable and the server
// fetches exactly the page shown. Prices in the URL are taka (readable);
// the API gets poisha.
import { toPoisha } from "./format";
import type { ProductQuery, ProductSort } from "./catalog";

export interface FilterState {
  categorySlugs: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  /** Taka, as typed by the shopper. */
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
}

export const EMPTY_FILTERS: FilterState = {
  categorySlugs: [],
  inStockOnly: false,
  onSaleOnly: false,
  minPrice: null,
  maxPrice: null,
  minRating: null,
};

export const SORTS: ProductSort[] = ["featured", "newest", "price-asc", "price-desc", "rating"];
export const LISTING_PAGE_SIZE = 24;

type Params = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const num = (value: string | string[] | undefined) => {
  const n = Number(one(value));
  return one(value) !== undefined && Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseListing(params: Params) {
  const filters: FilterState = {
    categorySlugs: (one(params.cat) ?? "").split(",").filter(Boolean).slice(0, 20),
    inStockOnly: one(params.stock) === "1",
    onSaleOnly: one(params.sale) === "1",
    minPrice: num(params.min),
    maxPrice: num(params.max),
    minRating: num(params.rating),
  };
  const sortParam = one(params.sort) as ProductSort | undefined;
  const sort: ProductSort = sortParam && SORTS.includes(sortParam) ? sortParam : "featured";
  const page = Math.max(1, Math.floor(num(params.page) ?? 1));
  return { filters, sort, page };
}

/** API query for the listing; `scope` is the page's own category or search. */
export function listingQuery(
  { filters, sort, page }: ReturnType<typeof parseListing>,
  scope: { category?: string[]; q?: string }
): ProductQuery {
  return {
    category: filters.categorySlugs.length > 0 ? filters.categorySlugs : scope.category,
    q: scope.q,
    inStock: filters.inStockOnly || undefined,
    onSale: filters.onSaleOnly || undefined,
    priceMin: filters.minPrice !== null ? toPoisha(filters.minPrice) : undefined,
    priceMax: filters.maxPrice !== null ? toPoisha(filters.maxPrice) : undefined,
    ratingMin: filters.minRating ?? undefined,
    sort,
    page,
    pageSize: LISTING_PAGE_SIZE,
  };
}

/** URL search string for a listing state; keeps unrelated params (e.g. ?q=). */
export function listingSearch(
  current: URLSearchParams,
  filters: FilterState,
  sort: ProductSort,
  page = 1
): string {
  const next = new URLSearchParams(current);
  const set = (key: string, value: string | null) => (value ? next.set(key, value) : next.delete(key));
  set("cat", filters.categorySlugs.join(",") || null);
  set("stock", filters.inStockOnly ? "1" : null);
  set("sale", filters.onSaleOnly ? "1" : null);
  set("min", filters.minPrice !== null ? String(filters.minPrice) : null);
  set("max", filters.maxPrice !== null ? String(filters.maxPrice) : null);
  set("rating", filters.minRating !== null ? String(filters.minRating) : null);
  set("sort", sort === "featured" ? null : sort);
  set("page", page > 1 ? String(page) : null);
  const qs = next.toString();
  return qs ? `?${qs}` : "";
}
