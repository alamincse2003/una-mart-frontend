"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "./toast-context";

// Guest wishlist: saved product ids in localStorage. SYSTEM_DESIGN.md has
// a /wishlist route but no wishlist API yet — when one lands (e.g.
// GET/POST/DELETE /wishlist), only this provider changes: load from the
// API for signed-in users and merge the local ids on login.
const STORAGE_KEY = "una_mart_wishlist";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface WishlistContextValue {
  ids: string[];
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "[]"
      ) as unknown;
      // Product ids are UUIDs; drops ids saved by the old fake catalog ("p1").
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydrate from storage
      if (Array.isArray(saved)) setIds(saved.filter((id) => typeof id === "string" && UUID.test(id)));
    } catch {
      // Ignore corrupt storage.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Storage disabled — wishlist lasts for this visit only.
    }
  }, [ids, ready]);

  const remove = useCallback((productId: string) => {
    setIds((all) => all.filter((id) => id !== productId));
  }, []);

  const toggle = useCallback(
    (productId: string) => {
      const saved = ids.includes(productId);
      setIds((all) =>
        saved ? all.filter((id) => id !== productId) : [...all, productId]
      );
      toast(saved ? "Removed from wishlist" : "Saved to wishlist");
    },
    [ids, toast]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, ready, has: (id) => ids.includes(id), toggle, remove }),
    [ids, ready, toggle, remove]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
