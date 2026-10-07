"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageSearch, Plus, Search } from "lucide-react";
import { adminApi, type ProductStatus } from "@/lib/admin-api-client";
import { formatPrice } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/lib/product";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { categoryPathLabel, flattenCategories } from "./category-tree";
import { useAdminQuery } from "./useAdminQuery";

export const STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

export const STATUS_TONE: Record<ProductStatus, string> = {
  active: "bg-success-bg text-success",
  draft: "bg-neutral-100 text-neutral-600",
  archived: "bg-danger-bg text-danger",
};

const PAGE_SIZE = 25;

export function ProductsView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const categories = useAdminQuery(() => adminApi.listCategories());
  const products = useAdminQuery(
    () =>
      adminApi.listProducts({
        q: q || undefined,
        status: status || undefined,
        categoryId: categoryId || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    `${q}|${status}|${categoryId}|${page}`
  );
  const data = products.data;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Products"
        description={data ? `${data.total} products` : "Your catalog"}
        actions={
          <ButtonLink href="/admin/products/new" variant="cta">
            <Plus aria-hidden width={16} height={16} />
            New product
          </ButtonLink>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <span className="sr-only">Search products</span>
          <Search
            aria-hidden
            width={16}
            height={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU"
            className="input-base min-h-10 rounded-pill py-2 pl-10"
          />
        </label>
        <label className="sm:w-40">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProductStatus | "");
              setPage(1);
            }}
            className="input-base min-h-10 cursor-pointer rounded-pill py-2"
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="sm:w-64">
          <span className="sr-only">Filter by category</span>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="input-base min-h-10 cursor-pointer rounded-pill py-2"
          >
            <option value="">All categories</option>
            {flattenCategories(categories.data ?? []).map(({ category, depth }) => (
              <option key={category.id} value={category.id}>
                {"  ".repeat(depth)}
                {depth > 0 ? "└ " : ""}
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Card className="overflow-hidden">
        {products.error ? (
          <p role="alert" className="p-6 text-sm font-medium text-danger">
            {products.error}
          </p>
        ) : data && data.items.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No products found" description="Try another search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-right">Stock</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(data?.items ?? []).map((product) => {
                  const out = product.stockTotal <= 0;
                  const low = !out && product.stockTotal <= LOW_STOCK_THRESHOLD;
                  return (
                    <tr
                      key={product.id}
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="cursor-pointer transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                            <Image src={product.imageUrl ?? "/products/placeholder.svg"} alt="" fill sizes="44px" className="object-contain p-1" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="line-clamp-2 font-medium text-neutral-800 hover:underline"
                            >
                              {product.name}
                            </Link>
                            {product.variantCount > 1 && (
                              <span className="text-xs text-neutral-500">{product.variantCount} variants</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {categoryPathLabel(categories.data ?? [], product.category.id)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {product.price === null ? (
                          <span className="text-neutral-400">—</span>
                        ) : (
                          <>
                            <span className="font-semibold text-neutral-800">{formatPrice(product.price)}</span>
                            {product.compareAtPrice && (
                              <span className="block text-xs text-neutral-500 line-through">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`font-semibold tabular-nums ${
                            out ? "text-danger" : low ? "text-warning" : "text-neutral-800"
                          }`}
                        >
                          {product.stockTotal}
                        </span>
                        {(out || low) && (
                          <span className={`block text-xs ${out ? "text-danger" : "text-warning"}`}>
                            {out ? "Out" : "Low"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[product.status]}`}
                        >
                          {STATUS_LABEL[product.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {products.loading && !data && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                      Loading products…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-neutral-600">
            Page {data.page} of {data.totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
