"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { apiClient } from "./api-client";
import type { Cart } from "./types";

const STORAGE_KEY = "una_mart_cart";

type CartState = Cart;

type CartAction = { type: "SET_CART"; cart: Cart };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART":
      return action.cart;
    default:
      return state;
  }
}

interface CartContextValue {
  cart: Cart;
  itemCount: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const emptyCart: Cart = { id: "", items: [] };

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, emptyCart);

  useEffect(() => {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (cached) {
      dispatch({ type: "SET_CART", cart: JSON.parse(cached) as Cart });
    }
    apiClient.getCart().then((serverCart) => {
      dispatch({ type: "SET_CART", cart: serverCart });
    });
  }, []);

  useEffect(() => {
    if (cart.id) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const addItem = async (productId: string, quantity = 1) => {
    const updated = await apiClient.addCartItem(productId, quantity);
    dispatch({ type: "SET_CART", cart: updated });
  };

  const updateItem = async (itemId: string, quantity: number) => {
    const updated = await apiClient.updateCartItem(itemId, quantity);
    dispatch({ type: "SET_CART", cart: updated });
  };

  const removeItem = async (itemId: string) => {
    const updated = await apiClient.removeCartItem(itemId);
    dispatch({ type: "SET_CART", cart: updated });
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, addItem, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
