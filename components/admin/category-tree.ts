interface TreeNode {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CategoryRow<T extends TreeNode> {
  category: T;
  depth: number;
}

/** Depth-first flattening for indented lists and <select> options. */
export function flattenCategories<T extends TreeNode>(categories: T[]): CategoryRow<T>[] {
  const childrenOf = new Map<string | null, T[]>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    childrenOf.set(key, [...(childrenOf.get(key) ?? []), c]);
  }
  const rows: CategoryRow<T>[] = [];
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
export function categoryPathLabel(categories: TreeNode[], categoryId: string): string {
  const names: string[] = [];
  let current = categories.find((c) => c.id === categoryId);
  while (current && names.length < 10) {
    names.unshift(current.name);
    const parentId = current.parentId;
    current = parentId ? categories.find((c) => c.id === parentId) : undefined;
  }
  return names.join(" › ") || "—";
}

/** The category and everything below it — can't be chosen as its new parent. */
export function subtreeIds(categories: TreeNode[], rootId: string): Set<string> {
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
