"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, FolderTree, Pencil, Plus, X } from "lucide-react";
import { adminApi, ApiError } from "@/lib/admin-api-client";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { flattenCategories, subtreeIds } from "./category-tree";
import { useAdminQuery } from "./useAdminQuery";

type Adding = { parentId: string | null } | null;

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

// Categories are hidden, never deleted: products and old links keep working
// (SYSTEM_DESIGN.md: archive instead of delete).
export function CategoriesView() {
  const toast = useToast();
  const categories = useAdminQuery(() => adminApi.listCategories());

  const [adding, setAdding] = useState<Adding>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParent, setEditParent] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const all = useMemo(() => categories.data ?? [], [categories.data]);
  const rows = useMemo(() => flattenCategories(all), [all]);
  const parentOf = (id: string) => all.find((c) => c.id === id);

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
    const name = newName.trim();
    // Subcategory slugs are prefixed with the parent ("mens-summer") to stay unique.
    const parent = adding.parentId ? parentOf(adding.parentId) : undefined;
    const slug = slugify(parent ? `${parent.slug}-${name}` : name);
    const ok = await run(
      () => adminApi.createCategory({ name, slug, parentId: adding.parentId }),
      `Added "${name}"`
    );
    if (ok) {
      setAdding(null);
      setNewName("");
    }
  }

  async function submitEdit(e: FormEvent, id: string) {
    e.preventDefault();
    const current = parentOf(id);
    const parentId = editParent || null;
    const ok = await run(
      () =>
        adminApi.updateCategory(id, {
          name: editName.trim(),
          ...(parentId !== (current?.parentId ?? null) ? { parentId } : {}),
        }),
      "Category saved"
    );
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
        description="Organise the catalog. The store menu updates within a minute."
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
              const count = category.productCount;
              const blockedParents = editingId === category.id ? subtreeIds(all, category.id) : new Set<string>();
              return (
                <li key={category.id} className="px-3">
                  <div className="flex flex-wrap items-center gap-3 py-3" style={{ paddingLeft: depth * 24 }}>
                    {editingId === category.id ? (
                      <form onSubmit={(e) => submitEdit(e, category.id)} className="flex flex-1 flex-wrap items-center gap-2">
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          aria-label="Category name"
                          className="input-base min-h-9 max-w-xs py-1.5"
                        />
                        <select
                          value={editParent}
                          onChange={(e) => setEditParent(e.target.value)}
                          aria-label="Parent category"
                          className="input-base min-h-9 max-w-56 py-1.5"
                        >
                          <option value="">Top level</option>
                          {rows
                            .filter(({ category: c }) => !blockedParents.has(c.id))
                            .map(({ category: c, depth: d }) => (
                              <option key={c.id} value={c.id}>
                                {"  ".repeat(d)}
                                {d > 0 ? "└ " : ""}
                                {c.name}
                              </option>
                            ))}
                        </select>
                        <button
                          type="submit"
                          disabled={busy || editName.trim().length < 2}
                          aria-label="Save"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-success hover:bg-success-bg disabled:opacity-50"
                        >
                          <Check aria-hidden width={17} height={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          aria-label="Cancel"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
                        >
                          <X aria-hidden width={17} height={17} />
                        </button>
                      </form>
                    ) : (
                      <div className={`min-w-0 flex-1 ${category.isActive ? "" : "opacity-60"}`}>
                        <span className={`font-semibold text-neutral-800 ${depth === 0 ? "text-base" : "text-sm"}`}>
                          {depth > 0 && <span className="mr-1.5 text-neutral-300">└</span>}
                          {category.name}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500">
                          /{category.slug} · {count} product{count === 1 ? "" : "s"}
                        </span>
                        {!category.isActive && (
                          <span className="ml-2 rounded-pill bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
                            Hidden
                          </span>
                        )}
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
                            setEditParent(category.parentId ?? "");
                          }}
                          aria-label={`Edit ${category.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                        >
                          <Pencil aria-hidden width={15} height={15} />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => adminApi.updateCategory(category.id, { isActive: !category.isActive }),
                              category.isActive ? `"${category.name}" hidden from the store` : `"${category.name}" shown in the store`
                            )
                          }
                          aria-label={category.isActive ? `Hide ${category.name}` : `Show ${category.name}`}
                          title={category.isActive ? "Hide from store" : "Show in store"}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
                        >
                          {category.isActive ? <EyeOff aria-hidden width={15} height={15} /> : <Eye aria-hidden width={15} height={15} />}
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
