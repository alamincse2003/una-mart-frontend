// Request-body checks for the fake /api/admin/* routes. The NestJS DTOs
// (class-validator) take over these rules later.
import type { ProductInput } from "./fake-data";
import type { ProductBadge, ProductStatus } from "./types";

const STATUSES: ProductStatus[] = ["active", "draft", "out_of_stock"];
const BADGES: ProductBadge[] = ["new", "sale", "best"];

const isMoney = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;
const isCount = (v: unknown) => Number.isInteger(v) && (v as number) >= 0;

/**
 * Returns an error message, or null if valid. `partial` allows PATCH bodies
 * that only include the fields being changed.
 */
export function validateProductInput(
  body: Partial<ProductInput>,
  partial = false
): string | null {
  const has = (key: keyof ProductInput) => body[key] !== undefined;
  const need = (key: keyof ProductInput) => !partial || has(key);

  if (need("name") && (typeof body.name !== "string" || body.name.trim().length < 2))
    return "Product name must be at least 2 characters.";
  if (need("description") && typeof body.description !== "string")
    return "Description is required.";
  if (need("categoryId") && typeof body.categoryId !== "string")
    return "Choose a category.";
  if (need("price") && (!isMoney(body.price) || body.price === 0))
    return "Price must be more than 0.";
  if (has("originalPrice") && body.originalPrice !== null) {
    if (!isMoney(body.originalPrice)) return "Original price must be a number.";
    if (isMoney(body.price) && body.originalPrice! <= body.price!)
      return "Original price must be higher than the selling price (or left empty).";
  }
  if (need("stockQty") && !isCount(body.stockQty))
    return "Stock must be a whole number, 0 or more.";
  if (need("status") && !STATUSES.includes(body.status as ProductStatus))
    return "Invalid status.";
  if (has("badge") && body.badge !== null && !BADGES.includes(body.badge as ProductBadge))
    return "Invalid badge.";
  if (
    need("images") &&
    (!Array.isArray(body.images) ||
      body.images.length === 0 ||
      body.images.some((src) => typeof src !== "string" || !src.startsWith("/")))
  )
    return "Add at least one image path (starting with /).";
  return null;
}
