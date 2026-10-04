"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, ImageIcon } from "lucide-react";
import { adminApi, type ProductInput } from "@/lib/admin-api-client";
import { ApiError } from "@/lib/api-client";
import { getDiscountPercent } from "@/lib/product";
import { useToast } from "@/lib/toast-context";
import type { Product, ProductBadge } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { flattenCategories } from "./category-tree";
import { useAdminQuery } from "./useAdminQuery";

interface FormState {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  originalPrice: string;
  stockQty: string;
  status: Product["status"];
  badge: ProductBadge | "";
  freeDelivery: boolean;
  image: string;
}

const EMPTY: FormState = {
  name: "",
  description: "",
  categoryId: "",
  price: "",
  originalPrice: "",
  stockQty: "0",
  status: "active",
  badge: "",
  freeDelivery: false,
  image: "",
};

function fromProduct(p: Product): FormState {
  return {
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    stockQty: String(p.stockQty),
    status: p.status,
    badge: p.badge ?? "",
    freeDelivery: Boolean(p.freeDelivery),
    image: p.images[0] ?? "",
  };
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !productId;

  const categories = useAdminQuery(() => adminApi.listCategories());
  const allProducts = useAdminQuery(() => adminApi.listProducts());
  const product = useAdminQuery(
    () => (productId ? adminApi.getProduct(productId) : Promise.resolve(null)),
    productId ?? "new"
  );

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fill the form once the product arrives (adjusting state during render).
  if (product.data && loadedFor !== product.data.id) {
    setLoadedFor(product.data.id);
    setForm(fromProduct(product.data));
  }

  // A new product defaults to the first category until one is picked.
  const categoryId = form.categoryId || categories.data?.[0]?.id || "";

  // Image library = every image already used in the catalog.
  const imageLibrary = useMemo(
    () => [...new Set((allProducts.data ?? []).flatMap((p) => p.images))],
    [allProducts.data]
  );

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setError(null);
    };

  const priceNum = Number(form.price);
  const originalNum = Number(form.originalPrice);
  const discount =
    form.originalPrice && priceNum > 0
      ? getDiscountPercent({ price: priceNum, originalPrice: originalNum } as Product)
      : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: ProductInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId,
      price: priceNum,
      originalPrice: form.originalPrice ? originalNum : null,
      stockQty: Number(form.stockQty),
      status: form.status,
      badge: form.badge || null,
      freeDelivery: form.freeDelivery,
      images: form.image ? [form.image.trim()] : [],
    };

    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const created = await adminApi.createProduct(input);
        toast(`Created "${created.name}"`);
        router.replace(`/admin/products/${created.id}`);
      } else {
        const updated = await adminApi.updateProduct(productId, input);
        product.setData(updated);
        setForm(fromProduct(updated));
        toast("Product saved");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the product.");
    } finally {
      setSaving(false);
    }
  }

  if (product.error) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <Card className="p-6">
          <p role="alert" className="text-sm font-medium text-danger">
            {product.error}
          </p>
        </Card>
      </div>
    );
  }
  if (!isNew && !product.data) {
    return <div className="h-96 animate-pulse rounded-xl bg-neutral-100" aria-busy="true" />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <BackLink />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
          {isNew ? "New product" : form.name || "Edit product"}
        </h1>
        {!isNew && product.data && product.data.status !== "draft" && (
          <a
            href={`/product/${product.data.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:underline"
          >
            View in store <ExternalLink aria-hidden width={14} height={14} />
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">Details</h2>
            <TextField
              label="Name"
              required
              placeholder="e.g. Wireless Earbuds Pro"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
            />
            <TextAreaField
              label="Description"
              required
              rows={4}
              placeholder="What it is, key features, what's in the box"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
            />
            <SelectField
              label="Category"
              required
              value={categoryId}
              onChange={(e) => set("categoryId")(e.target.value)}
            >
              {flattenCategories(categories.data ?? []).map(({ category, depth }) => (
                <option key={category.id} value={category.id}>
                  {"  ".repeat(depth)}
                  {depth > 0 ? "└ " : ""}
                  {category.name}
                </option>
              ))}
            </SelectField>
          </Card>

          <Card className="flex flex-col gap-4 p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">Pricing &amp; stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Price (৳)"
                required
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="2990"
                value={form.price}
                onChange={(e) => set("price")(e.target.value)}
              />
              <TextField
                label="Original price (৳)"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Leave empty if not on sale"
                value={form.originalPrice}
                onChange={(e) => set("originalPrice")(e.target.value)}
                hint={discount > 0 ? `Shows as ${discount}% off` : undefined}
              />
              <TextField
                label="Stock"
                required
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.stockQty}
                onChange={(e) => set("stockQty")(e.target.value)}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">Image</h2>
            <p className="-mt-2 text-sm text-neutral-600">
              Pick an image already in the catalog or paste a path from <code>/public</code>. Uploads arrive with
              the backend (Cloudinary).
            </p>
            <TextField
              label="Image path"
              required
              placeholder="/products/image1.webp"
              value={form.image}
              onChange={(e) => set("image")(e.target.value)}
              leading={<ImageIcon width={17} height={17} />}
            />
            {imageLibrary.length > 0 && (
              <ul className="grid grid-cols-5 gap-2 sm:grid-cols-7" aria-label="Image library">
                {imageLibrary.map((src) => {
                  const selected = src === form.image;
                  return (
                    <li key={src}>
                      <button
                        type="button"
                        onClick={() => set("image")(src)}
                        aria-pressed={selected}
                        aria-label={`Use ${src}`}
                        className={`relative block aspect-square w-full overflow-hidden rounded-md border-2 bg-neutral-50 transition-colors ${
                          selected ? "border-coral-400" : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <Image src={src} alt="" fill sizes="80px" className="object-contain p-1" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          <Card className="flex flex-col gap-4 p-5">
            <h2 className="text-base font-bold text-neutral-800">Visibility</h2>
            <SelectField
              label="Status"
              value={form.status}
              onChange={(e) => set("status")(e.target.value as Product["status"])}
              hint={form.status === "draft" ? "Hidden from the store." : undefined}
            >
              <option value="active">Active</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="draft">Draft (hidden)</option>
            </SelectField>
            <SelectField
              label="Badge"
              value={form.badge}
              onChange={(e) => set("badge")(e.target.value as ProductBadge | "")}
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="sale">Sale</option>
              <option value="best">Best seller</option>
            </SelectField>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={form.freeDelivery}
                onChange={(e) => set("freeDelivery")(e.target.checked)}
                className="h-4.5 w-4.5 accent-navy-800"
              />
              Free delivery
            </label>
          </Card>

          <Card className="p-5">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-50">
              {form.image.startsWith("/") ? (
                <Image src={form.image} alt="" fill sizes="320px" className="object-contain p-6" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
                  No image yet
                </span>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-4 rounded-md bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="cta" size="lg" disabled={saving} className="mt-4 w-full">
              {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
            </Button>
          </Card>
        </div>
      </div>
    </form>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/products"
      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-navy-600 hover:underline"
    >
      <ArrowLeft aria-hidden width={16} height={16} />
      All products
    </Link>
  );
}
