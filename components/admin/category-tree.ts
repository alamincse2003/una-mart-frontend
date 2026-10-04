import type { Category } from "@/lib/types";

export interface CategoryRow {
  category: Category;
  depth: number;
}

/** Depth-first flattening for indented lists and <select> options. */
export function flattenCategories(categories: Category[]): CategoryRow[] {
  const childrenOf = new Map<string | null, Category[]>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    childrenOf.set(key, [...(childrenOf.get(key) ?? []), c]);
  }
  const rows: CategoryRow[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const category of childrenOf.get(parentId) ?? []) {
      rows.push({ category, depth });
      walk(category.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

/** "Fashion › Men's Wear › Summer" */
export function categoryPathLabel(categories: Category[], categoryId: string): string {
  const names: string[] = [];
  let current = categories.find((c) => c.id === categoryId);
  while (current) {
    names.unshift(current.name);
    const parentId: string | null | undefined = current.parentId;
    current = parentId ? categories.find((c) => c.id === parentId) : undefined;
  }
  return names.join(" › ") || "—";
}
