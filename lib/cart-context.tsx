"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient, ApiError } from "./api-client";
import { useToast } from "./toast-context";
import type { Cart, CartLine } from "./types";

interface CartContextValue {
  cart: Cart;
  /** "loading" until the server cart has been fetched once. */
  status: "loading" | "ready";
  itemCount: number;
  lines: CartLine[];
  /** Orderable lines only (poisha). */
  subtotal: number;
  /** Resolves true on success. Opens the cart drawer unless openDrawer is false. */
  addItem: (variantId: string, quantity?: number, options?: { openDrawer?: boolean }) => Promise<boolean>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  /** Re-fetch the server cart (after an order, login or logout). */
  refresh: () => Promise<void>;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const EMPTY_CART: Cart = { items: [], itemCount: 0, subtotal: 0 };

// The server cart (guest cookie or logged-in user) is the only truth: it
// carries names, images, current prices and stock, so nothing is cached here.
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toast = useToast();

  const refresh = useCallback(async () => {
    try {
      setCart(await apiClient.getCart());
    } catch {
      // Keep what we have; the next action retries the server.
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load of the server cart
    void refresh();
  }, [refresh]);

  const run = useCallback(
    async (action: () => Promise<Cart>): Promise<boolean> => {
      try {
        setCart(await action());
        return true;
      } catch (error) {
        toast(error instanceof ApiError ? error.message : "Something went wrong. Please try again.", "error");
        return false;
      }
    },
    [toast]
  );

  const addItem = useCallback(
    async (variantId: string, quantity = 1, options?: { openDrawer?: boolean }) => {
      const ok = await run(() => apiClient.addCartItem(variantId, quantity));
      if (ok && options?.openDrawer !== false) setDrawerOpen(true);
      return ok;
    },
    [run]
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      await run(() => apiClient.updateCartItem(itemId, quantity));
    },
    [run]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await run(() => apiClient.removeCartItem(itemId));
    },
    [run]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      status,
      itemCount: cart.itemCount,
      lines: cart.items,
      subtotal: cart.subtotal,
      addItem,
      updateItem,
      removeItem,
      refresh,
      drawerOpen,
      setDrawerOpen,
    }),
    [cart, status, addItem, updateItem, removeItem, refresh, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
