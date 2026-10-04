"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, FolderTree, Pencil, Plus, Trash2, X } from "lucide-react";
import { adminApi } from "@/lib/admin-api-client";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { flattenCategories } from "./category-tree";
import { useAdminQuery } from "./useAdminQuery";

type Adding = { parentId: string | null } | null;

export function CategoriesView() {
  const toast = useToast();
  const categories = useAdminQuery(() => adminApi.listCategories());
  const products = useAdminQuery(() => adminApi.listProducts());

  const [adding, setAdding] = useState<Adding>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => flattenCategories(categories.data ?? []), [categories.data]);
  const productCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products.data ?? []) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
    return counts;
  }, [products.data]);
  const hasChildren = (id: string) => (categories.data ?? []).some((c) => c.parentId === id);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      toast(success);
      categories.reload();
      return true;
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitNew(e: FormEvent) {
    e.preventDefault();
    if (!adding) return;
    const ok = await run(
      () => adminApi.createCategory({ name: newName, parentId: adding.parentId }),
      `Added "${newName.trim()}"`
    );
    if (ok) {
      setAdding(null);
      setNewName("");
    }
  }

  async function submitRename(e: FormEvent, id: string) {
    e.preventDefault();
    const ok = await run(() => adminApi.updateCategory(id, { name: editName }), "Category renamed");
    if (ok) setEditingId(null);
  }

  function startAdd(parentId: string | null) {
    setEditingId(null);
    setAdding({ parentId });
    setNewName("");
  }

  const addForm = (depth: number) => (
    <form onSubmit={submitNew} className="flex items-center gap-2 py-2" style={{ paddingLeft: depth * 24 }}>
      <input
        autoFocus
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder={adding?.parentId ? "Subcategory name" : "Category name"}
        aria-label="New category name"
        className="input-base min-h-9 max-w-xs py-1.5"
      />
      <Button type="submit" size="sm" disabled={busy || newName.trim().length < 2}>
        Add
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setAdding(null)}>
        Cancel
      </Button>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Categories"
        description="Organise the catalog. Changes show in the store menu after a refresh."
        actions={
          <Button variant="cta" onClick={() => startAdd(null)}>
            <Plus aria-hidden width={16} height={16} />
            New category
          </Button>
        }
      />

      <Card className="p-2 sm:p-4">
        {adding?.parentId === null && <div className="px-3">{addForm(0)}</div>}

        {categories.error ? (
          <p role="alert" className="p-4 text-sm font-medium text-danger">
            {categories.error}
          </p>
        ) : categories.data && rows.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories yet" description="Create your first category." />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {rows.map(({ category, depth }) => {
              const count = productCount.get(category.id) ?? 0;
              const children = hasChildren(category.id);
              const deleteBlocked = children
                ? "Has subcategories"
                : count > 0
                  ? `Has ${count} product${count === 1 ? "" : "s"}`
                  : null;
              return (
                <li key={category.id} className="px-3">
                  <div className="flex flex-wrap items-center gap-3 py-3" style={{ paddingLeft: depth * 24 }}>
                    {editingId === category.id ? (
                      <form onSubmit={(e) => submitRename(e, category.id)} className="flex flex-1 items-center gap-2">
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          aria-label="Category name"
                          className="input-base min-h-9 max-w-xs py-1.5"
                        />
                        <button
                          type="submit"
                          disabled={busy || editName.trim().length < 2}
                          aria-label="Save name"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-success hover:bg-success-bg disabled:opacity-50"
                        >
                          <Check aria-hidden width={17} height={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          aria-label="Cancel rename"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
                        >
                          <X aria-hidden width={17} height={17} />
                        </button>
                      </form>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <span className={`font-semibold text-neutral-800 ${depth === 0 ? "text-base" : "text-sm"}`}>
                          {depth > 0 && <span className="mr-1.5 text-neutral-300">└</span>}
                          {category.name}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500">
                          /{category.slug} · {count} product{count === 1 ? "" : "s"}
                        </span>
                      </div>
                    )}

                    {editingId !== category.id && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startAdd(category.id)}
                          className="flex h-9 items-center gap-1 rounded-md px-2.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                        >
                          <Plus aria-hidden width={14} height={14} />
                          Sub
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdding(null);
                            setEditingId(category.id);
                            setEditName(category.name);
                          }}
                          aria-label={`Rename ${category.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                        >
                          <Pencil aria-hidden width={15} height={15} />
                        </button>
                        <button
                          type="button"
                          disabled={busy || deleteBlocked !== null}
                          onClick={() => run(() => adminApi.deleteCategory(category.id), `Deleted "${category.name}"`)}
                          aria-label={`Delete ${category.name}`}
                          title={deleteBlocked ? `Can't delete: ${deleteBlocked.toLowerCase()}` : "Delete"}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-danger hover:bg-danger-bg disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                        >
                          <Trash2 aria-hidden width={15} height={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  {adding?.parentId === category.id && addForm(depth + 1)}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
