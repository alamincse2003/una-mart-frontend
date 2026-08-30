// In-memory cart storage for Phase 1, keyed by session id (a cookie).
// Real backend will replace this with Redis-backed cart storage — same
// shape, so /app/api/cart/* routes don't change their contract.
import type { Cart, CartItem } from "./types";

const carts = new Map<string, Cart>();

function getOrCreateCart(sessionId: string): Cart {
  let cart = carts.get(sessionId);
  if (!cart) {
    cart = { id: sessionId, items: [] };
    carts.set(sessionId, cart);
  }
  return cart;
}

export function getCart(sessionId: string): Cart {
  return getOrCreateCart(sessionId);
}

export function addCartItem(
  sessionId: string,
  productId: string,
  quantity: number
): Cart {
  const cart = getOrCreateCart(sessionId);
  const existing = cart.items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    const newItem: CartItem = {
      id: `${sessionId}-${productId}`,
      productId,
      quantity,
    };
    cart.items.push(newItem);
  }

  return cart;
}

export function updateCartItem(
  sessionId: string,
  itemId: string,
  quantity: number
): Cart {
  const cart = getOrCreateCart(sessionId);
  const item = cart.items.find((i) => i.id === itemId);
  if (item) {
    item.quantity = quantity;
  }
  return cart;
}

export function removeCartItem(sessionId: string, itemId: string): Cart {
  const cart = getOrCreateCart(sessionId);
  cart.items = cart.items.filter((i) => i.id !== itemId);
  return cart;
}
