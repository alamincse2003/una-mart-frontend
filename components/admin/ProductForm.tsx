"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, ImageIcon, X } from "lucide-react";
import {
  adminApi,
  ApiError,
  type AdminProduct,
  type ProductBadge,
  type ProductInput,
  type ProductStatus,
} from "@/lib/admin-api-client";
import { discountPercent } from "@/lib/product";
import { toPoisha } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { flattenCategories } from "./category-tree";
import { ProductVariants } from "./ProductVariants";
import { useAdminQuery } from "./useAdminQuery";

interface FormState {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  brand: string;
  status: ProductStatus;
  badge: ProductBadge | "";
  freeDelivery: boolean;
  images: string[];
}

/** First variant, only when creating. Prices in taka as typed. */
interface VariantDraft {
  sku: string;
  price: string;
  compareAtPrice: string;
  stockQty: string;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  brand: "",
  status: "draft",
  badge: "",
  freeDelivery: false,
  images: [],
};

// Images are site paths for now (files in /public). Cloudinary uploads come
// later; arbitrary URLs aren't allowed because next/image would have to
// proxy any host.
const IMAGE_PATH = /^\/[\w\-./() ]+\.(webp|png|jpe?g|avif|svg)$/i;

function fromProduct(p: AdminProduct): FormState {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description,
    categoryId: p.category.id,
    brand: p.brand ?? "",
    status: p.status,
    badge: p.badge ?? "",
    freeDelivery: p.freeDelivery,
    images: p.images.map((img) => img.url),
  };
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !productId;

  const categories = useAdminQuery(() => adminApi.listCategories());
  const library = useAdminQuery(() => adminApi.listProducts({ pageSize: 100 }));
  const product = useAdminQuery(
    () => (productId ? adminApi.getProduct(productId) : Promise.resolve(null)),
    productId ?? "new"
  );

  const [form, setForm] = useState<FormState>(EMPTY);
  const [variant, setVariant] = useState<VariantDraft>({ sku: "", price: "", compareAtPrice: "", stockQty: "0" });
  const [newImage, setNewImage] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fill the form once the product arrives (adjusting state during render).
  if (product.data && loadedFor !== product.data.updatedAt) {
    setLoadedFor(product.data.updatedAt);
    setForm(fromProduct(product.data));
  }

  const categoryId = form.categoryId || categories.data?.[0]?.id || "";

  // Image library = every image already used in the catalog.
  const imageLibrary = useMemo(
    () => [...new Set((library.data?.items ?? []).map((p) => p.imageUrl).filter((src): src is string => !!src))],
    [library.data]
  );

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setError(null);
    };

  const addImage = (src: string) => {
    const path = src.trim();
    if (!IMAGE_PATH.test(path)) {
      setError("Image must be a site path like /products/photo.webp");
      return;
    }
    if (!form.images.includes(path)) set("images")([...form.images, path].slice(0, 10));
    setNewImage("");
  };

  const priceNum = Number(variant.price);
  const discount = variant.compareAtPrice ? discountPercent(priceNum, Number(variant.compareAtPrice)) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: ProductInput = {
      name: form.name.trim(),
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      description: form.description.trim(),
      categoryId,
      brand: form.brand.trim() || null,
      status: form.status,
      badge: form.badge || null,
      freeDelivery: form.freeDelivery,
      images: form.images,
    };

    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        if (!(priceNum > 0)) throw new ApiError("Enter a price for the product.", 400, "VALIDATION_FAILED");
        const created = await adminApi.createProduct({
          ...input,
          variant: {
            sku: variant.sku.trim().toUpperCase(),
            price: toPoisha(priceNum),
            compareAtPrice: variant.compareAtPrice ? toPoisha(Number(variant.compareAtPrice)) : null,
            stockQty: Math.max(0, Math.floor(Number(variant.stockQty) || 0)),
          },
        });
        toast(`Created "${created.name}"`);
        router.replace(`/admin/products/${created.id}`);
      } else {
        const updated = await adminApi.updateProduct(productId, input);
        product.setData(updated);
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
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <BackLink />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            {isNew ? "New product" : form.name || "Edit product"}
          </h1>
          {!isNew && product.data?.status === "active" && (
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
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="URL slug"
                  placeholder={isNew ? "Made from the name if empty" : undefined}
                  value={form.slug}
                  onChange={(e) => set("slug")(e.target.value.toLowerCase())}
                  hint="Lowercase words joined by dashes."
                />
                <TextField label="Brand (optional)" value={form.brand} onChange={(e) => set("brand")(e.target.value)} />
              </div>
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
                    {"  ".repeat(depth)}
                    {depth > 0 ? "└ " : ""}
                    {category.name}
                    {category.isActive ? "" : " (hidden)"}
                  </option>
                ))}
              </SelectField>
            </Card>

            {isNew && (
              <Card className="flex flex-col gap-4 p-5 sm:p-6">
                <h2 className="text-base font-bold text-neutral-800">Price &amp; stock</h2>
                <p className="-mt-2 text-sm text-neutral-600">
                  Sizes or colours can be added as extra variants after saving.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="SKU"
                    required
                    placeholder="UM-EARBUDS-PRO"
                    value={variant.sku}
                    onChange={(e) => setVariant((v) => ({ ...v, sku: e.target.value.toUpperCase() }))}
                    hint="Uppercase letters, digits, dashes."
                  />
                  <TextField
                    label="Opening stock"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={variant.stockQty}
                    onChange={(e) => setVariant((v) => ({ ...v, stockQty: e.target.value }))}
                  />
                  <TextField
                    label="Price (৳)"
                    required
                    type="number"
                    inputMode="decimal"
                    min={1}
                    placeholder="2990"
                    value={variant.price}
                    onChange={(e) => setVariant((v) => ({ ...v, price: e.target.value }))}
                  />
                  <TextField
                    label="Original price (৳)"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="Leave empty if not on sale"
                    value={variant.compareAtPrice}
                    onChange={(e) => setVariant((v) => ({ ...v, compareAtPrice: e.target.value }))}
                    hint={discount > 0 ? `Shows as ${discount}% off` : undefined}
                  />
                </div>
              </Card>
            )}

            <Card className="flex flex-col gap-4 p-5 sm:p-6">
              <h2 className="text-base font-bold text-neutral-800">Images</h2>
              <p className="-mt-2 text-sm text-neutral-600">
                First image is the main one. Use a path from <code>/public</code> or pick from the library.
              </p>
              {form.images.length > 0 && (
                <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {form.images.map((src, i) => (
                    <li key={src} className="relative">
                      <div className={`relative aspect-square overflow-hidden rounded-md border-2 bg-neutral-50 ${i === 0 ? "border-coral-400" : "border-neutral-200"}`}>
                        <Image src={src} alt="" fill sizes="96px" className="object-contain p-1" />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove image ${src}`}
                        onClick={() => set("images")(form.images.filter((s) => s !== src))}
                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-neutral-0"
                      >
                        <X aria-hidden width={13} height={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <TextField
                  className="flex-1"
                  label="Add image path"
                  placeholder="/products/image1.webp"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  leading={<ImageIcon width={17} height={17} />}
                />
                <Button type="button" variant="secondary" className="self-end" onClick={() => addImage(newImage)}>
                  Add image
                </Button>
              </div>
              {imageLibrary.length > 0 && (
                <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8" aria-label="Image library">
                  {imageLibrary.map((src) => {
                    const selected = form.images.includes(src);
                    return (
                      <li key={src}>
                        <button
                          type="button"
                          onClick={() => (selected ? set("images")(form.images.filter((s) => s !== src)) : addImage(src))}
                          aria-pressed={selected}
                          aria-label={`${selected ? "Remove" : "Use"} ${src}`}
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
                onChange={(e) => set("status")(e.target.value as ProductStatus)}
                hint={form.status === "active" ? "Shown in the store." : "Hidden from the store."}
              >
                <option value="active">Active</option>
                <option value="draft">Draft (hidden)</option>
                <option value="archived">Archived (hidden)</option>
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
              {error && (
                <p role="alert" className="rounded-md bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" variant="cta" size="lg" disabled={saving} className="w-full">
                {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
              </Button>
            </Card>
          </div>
        </div>
      </form>

      {!isNew && product.data && (
        <ProductVariants product={product.data} onChange={(updated) => product.setData(updated)} />
      )}
    </div>
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
