"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { apiClient, ApiError } from "./api-client";
import { priceCartLines, getSubtotal, type PricedLine } from "./pricing";
import { useToast } from "./toast-context";
import type { Cart, Product } from "./types";

const STORAGE_KEY = "una_mart_cart";

type CartAction = { type: "SET_CART"; cart: Cart };

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "SET_CART":
      return action.cart;
    default:
      return state;
  }
}

interface CartContextValue {
  cart: Cart;
  /** "loading" until the server cart has been fetched once. */
  status: "loading" | "ready";
  itemCount: number;
  /** Cart items joined with product data; items whose product hasn't loaded yet are omitted. */
  lines: PricedLine[];
  subtotal: number;
  /** True while products for the current items are still being fetched. */
  linesLoading: boolean;
  /** Resolves true on success. Opens the cart drawer unless openDrawer is false. */
  addItem: (
    productId: string,
    quantity?: number,
    options?: { openDrawer?: boolean }
  ) => Promise<boolean>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  /** Re-fetch the server cart (e.g. after an order empties it). */
  refresh: () => Promise<void>;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const emptyCart: Cart = { id: "", items: [] };

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, emptyCart);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toast = useToast();

  const refresh = useCallback(async () => {
    try {
      dispatch({ type: "SET_CART", cart: await apiClient.getCart() });
    } catch {
      // Keep the cached cart; the next mutation will retry the server.
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);
      if (cached) dispatch({ type: "SET_CART", cart: JSON.parse(cached) as Cart });
    } catch {
      // Corrupt or blocked storage — the server cart below is the truth.
    }
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!cart.id) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or disabled — cart still works for this visit.
    }
  }, [cart]);

  // Fetch product data only for items we haven't priced yet.
  const missingIds = useMemo(
    () =>
      cart.items
        .map((item) => item.productId)
        .filter((id) => !products[id]),
    [cart.items, products]
  );
  const missingKey = missingIds.join(",");

  useEffect(() => {
    if (!missingKey) return;
    let cancelled = false;
    apiClient
      .getProducts({ ids: missingKey.split(",") })
      .then((found) => {
        if (cancelled) return;
        setProducts((prev) => ({
          ...prev,
          ...Object.fromEntries(found.map((p) => [p.id, p])),
        }));
      })
      .catch(() => {
        // Lines stay in their loading state; a later change retries.
      });
    return () => {
      cancelled = true;
    };
  }, [missingKey]);

  const run = useCallback(
    async (action: () => Promise<Cart>): Promise<boolean> => {
      try {
        dispatch({ type: "SET_CART", cart: await action() });
        return true;
      } catch (error) {
        toast(
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.",
          "error"
        );
        return false;
      }
    },
    [toast]
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1, options?: { openDrawer?: boolean }) => {
      const ok = await run(() => apiClient.addCartItem(productId, quantity));
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

  const value = useMemo<CartContextValue>(() => {
    const lines = priceCartLines(cart.items, products);
    return {
      cart,
      status,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      lines,
      subtotal: getSubtotal(lines),
      linesLoading: missingIds.length > 0,
      addItem,
      updateItem,
      removeItem,
      refresh,
      drawerOpen,
      setDrawerOpen,
    };
  }, [cart, status, products, missingIds.length, addItem, updateItem, removeItem, refresh, drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
