"use client";

import { useState, type FormEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { adminApi, ApiError, type AdminProduct, type AdminVariant } from "@/lib/admin-api-client";
import { formatPrice, toPoisha, toTaka } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, variantLabel } from "@/lib/product";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";

/** "size=M, color=Navy" ⇄ { size: "M", color: "Navy" } */
function parseOptions(text: string): Record<string, string> {
  return Object.fromEntries(
    text
      .split(",")
      .map((pair) => pair.split("=").map((s) => s.trim()))
      .filter(([k, v]) => k && v)
      .map(([k, v]) => [k.toLowerCase(), v])
  );
}
const optionsText = (options: Record<string, string>) =>
  Object.entries(options)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

// Variants (price, SKU, options) and stock. Stock never changes by typing a
// number: it moves through "add / remove units" so every change lands in the
// stock ledger with a reason (SYSTEM_DESIGN.md → Inventory).
export function ProductVariants({
  product,
  onChange,
}: {
  product: AdminProduct;
  onChange: (product: AdminProduct) => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-bold text-neutral-800">Variants &amp; stock</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Each variant has its own SKU, price and stock. Options are shown to shoppers, e.g. <code>size=M</code>.
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {product.variants.map((variant) => (
          <li key={variant.id}>
            <VariantRow variant={variant} onSaved={onChange} onStock={(stockQty) =>
              onChange({ ...product, variants: product.variants.map((v) => (v.id === variant.id ? { ...v, stockQty } : v)) })
            } />
          </li>
        ))}
      </ul>
      <AddVariant productId={product.id} onAdded={onChange} />
    </Card>
  );
}

function VariantRow({
  variant,
  onSaved,
  onStock,
}: {
  variant: AdminVariant;
  onSaved: (product: AdminProduct) => void;
  onStock: (stockQty: number) => void;
}) {
  const toast = useToast();
  const [sku, setSku] = useState(variant.sku);
  const [options, setOptions] = useState(optionsText(variant.options));
  const [price, setPrice] = useState(String(toTaka(variant.price)));
  const [compare, setCompare] = useState(variant.compareAtPrice ? String(toTaka(variant.compareAtPrice)) : "");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState<"restock" | "adjustment">("restock");
  const [busy, setBusy] = useState<"save" | "stock" | "active" | null>(null);

  const dirty =
    sku !== variant.sku ||
    options !== optionsText(variant.options) ||
    toPoisha(Number(price)) !== variant.price ||
    (compare ? toPoisha(Number(compare)) : null) !== variant.compareAtPrice;

  async function save(patch: Parameters<typeof adminApi.updateVariant>[1], kind: "save" | "active") {
    setBusy(kind);
    try {
      onSaved(await adminApi.updateVariant(variant.id, patch));
      toast(kind === "active" ? (patch.isActive ? "Variant on sale" : "Variant hidden") : "Variant saved");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't save the variant.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function adjust(sign: 1 | -1) {
    const units = Math.floor(Math.abs(Number(delta)));
    if (!units) return;
    setBusy("stock");
    try {
      const result = await adminApi.adjustStock(variant.id, sign * units, sign > 0 ? reason : "adjustment");
      onStock(result.stockQty);
      setDelta("");
      toast(`Stock is now ${result.stockQty}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't change the stock.", "error");
    } finally {
      setBusy(null);
    }
  }

  const low = variant.stockQty <= LOW_STOCK_THRESHOLD;

  return (
    <div className={`rounded-lg border p-4 ${variant.isActive ? "border-neutral-200" : "border-dashed border-neutral-300 bg-neutral-50"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-800">
          {variantLabel(variant.options) || "Default"}{" "}
          <span className="font-mono text-xs font-normal text-neutral-500">{variant.sku}</span>
          {!variant.isActive && <span className="ml-2 text-xs font-semibold text-neutral-500">(hidden)</span>}
        </p>
        <p className="text-sm">
          <span className="text-neutral-600">In stock: </span>
          <span className={`font-bold tabular-nums ${variant.stockQty <= 0 ? "text-danger" : low ? "text-warning" : "text-neutral-800"}`}>
            {variant.stockQty}
          </span>
          <span className="ml-3 text-neutral-600">{formatPrice(variant.price)}</span>
        </p>
      </div>

      <form
        className="mt-3 grid gap-3 sm:grid-cols-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save(
            {
              sku: sku.trim().toUpperCase(),
              options: parseOptions(options),
              price: toPoisha(Number(price)),
              compareAtPrice: compare ? toPoisha(Number(compare)) : null,
            },
            "save"
          );
        }}
      >
        <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} />
        <TextField label="Options" placeholder="size=M" value={options} onChange={(e) => setOptions(e.target.value)} />
        <TextField label="Price (৳)" type="number" inputMode="decimal" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
        <TextField label="Original (৳)" type="number" inputMode="decimal" min={0} value={compare} onChange={(e) => setCompare(e.target.value)} />
        <div className="flex flex-wrap gap-2 sm:col-span-4">
          <Button type="submit" size="sm" disabled={!dirty || busy !== null}>
            {busy === "save" ? "Saving…" : "Save variant"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy !== null}
            onClick={() => save({ isActive: !variant.isActive }, "active")}
          >
            {variant.isActive ? "Hide variant" : "Put on sale"}
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3">
        <TextField
          className="w-28"
          label="Units"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as "restock" | "adjustment")}
            className="input-base min-h-11 py-2"
          >
            <option value="restock">New stock arrived</option>
            <option value="adjustment">Count correction</option>
          </select>
        </label>
        <Button type="button" variant="secondary" size="sm" disabled={busy !== null || !delta} onClick={() => adjust(1)}>
          <Plus aria-hidden width={14} height={14} />
          Add units
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={busy !== null || !delta} onClick={() => adjust(-1)}>
          <Minus aria-hidden width={14} height={14} />
          Remove units
        </Button>
      </div>
    </div>
  );
}

function AddVariant({ productId, onAdded }: { productId: string; onAdded: (product: AdminProduct) => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [options, setOptions] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" size="sm" className="mt-4" onClick={() => setOpen(true)}>
        <Plus aria-hidden width={14} height={14} />
        Add variant
      </Button>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      onAdded(
        await adminApi.addVariant(productId, {
          sku: sku.trim().toUpperCase(),
          options: parseOptions(options),
          price: toPoisha(Number(price)),
          stockQty: Math.max(0, Math.floor(Number(stock) || 0)),
        })
      );
      toast("Variant added");
      setOpen(false);
      setSku("");
      setOptions("");
      setPrice("");
      setStock("0");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't add the variant.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-lg border border-navy-100 bg-navy-50/40 p-4 sm:grid-cols-4">
      <TextField label="SKU" required value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} />
      <TextField label="Options" required placeholder="size=L" value={options} onChange={(e) => setOptions(e.target.value)} />
      <TextField label="Price (৳)" required type="number" inputMode="decimal" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
      <TextField label="Opening stock" type="number" inputMode="numeric" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
      <div className="flex gap-2 sm:col-span-4">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Adding…" : "Add variant"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
