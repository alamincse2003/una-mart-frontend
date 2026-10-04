"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageSearch, Plus, Search } from "lucide-react";
import { adminApi } from "@/lib/admin-api-client";
import { formatPrice } from "@/lib/format";
import { isLowStock, isOutOfStock } from "@/lib/product";
import type { Product } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { categoryPathLabel, flattenCategories } from "./category-tree";
import { useAdminQuery } from "./useAdminQuery";

const STATUS_LABEL: Record<Product["status"], string> = {
  active: "Active",
  draft: "Draft",
  out_of_stock: "Out of stock",
};

const STATUS_TONE: Record<Product["status"], string> = {
  active: "bg-success-bg text-success",
  draft: "bg-neutral-100 text-neutral-600",
  out_of_stock: "bg-danger-bg text-danger",
};

export function ProductsView() {
  const router = useRouter();
  const products = useAdminQuery(() => adminApi.listProducts());
  const categories = useAdminQuery(() => adminApi.listCategories());
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const visible = useMemo(() => {
    const all = categories.data ?? [];
    // Selecting a parent category also shows its subcategories' products.
    const allowed = new Set<string>();
    if (categoryId) {
      const stack = [categoryId];
      while (stack.length) {
        const id = stack.pop()!;
        allowed.add(id);
        stack.push(...all.filter((c) => c.parentId === id).map((c) => c.id));
      }
    }
    const term = search.trim().toLowerCase();
    return (products.data ?? [])
      .filter((p) => !categoryId || allowed.has(p.categoryId))
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.slug.includes(term));
  }, [products.data, categories.data, categoryId, search]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Products"
        description={products.data ? `${products.data.length} products in the catalog` : "Your catalog"}
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
            placeholder="Search by name"
            className="input-base min-h-10 rounded-pill py-2 pl-10"
          />
        </label>
        <label className="sm:w-64">
          <span className="sr-only">Filter by category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input-base min-h-10 cursor-pointer rounded-pill py-2"
          >
            <option value="">All categories</option>
            {flattenCategories(categories.data ?? []).map(({ category, depth }) => (
              <option key={category.id} value={category.id}>
                {"  ".repeat(depth)}
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
        ) : products.data && visible.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No products found" description="Try another search or category." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
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
                {visible.map((product) => {
                  const out = isOutOfStock(product);
                  const low = isLowStock(product);
                  return (
                    <tr
                      key={product.id}
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="cursor-pointer transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                            {product.images[0] && (
                              <Image src={product.images[0]} alt="" fill sizes="44px" className="object-contain p-1" />
                            )}
                          </div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="line-clamp-2 font-medium text-neutral-800 hover:underline"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {categoryPathLabel(categories.data ?? [], product.categoryId)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        <span className="font-semibold text-neutral-800">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="block text-xs text-neutral-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`font-semibold tabular-nums ${
                            out ? "text-danger" : low ? "text-warning" : "text-neutral-800"
                          }`}
                        >
                          {product.stockQty}
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
                {products.loading && !products.data && (
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
    </div>
  );
}
