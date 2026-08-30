# UNA Mart — system design

This is the reference for what the product IS: pages, data, and API surface.
`ARCHITECTURE.md` covers HOW it's built (folders, tooling, deployment).

## Phasing

- **Phase 1 (current)** — single seller (UNA Mart's own catalog), customer
  storefront, simple admin. No outside sellers.
- **Phase 2** — multi-vendor: seller registration, seller dashboard,
  commission, payouts.
- **Phase 3** — supplier import (1688 / AliExpress dropshipping).

Only build what the current phase needs. Entities and routes below are
marked with the phase they belong to.

## Route map

### Customer-facing (public) — Phase 1

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/category/[slug]` | Category listing |
| `/search` | Search results |
| `/product/[slug]` | Product detail |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/login`, `/register` | Auth |
| `/account` | Profile, addresses |
| `/account/orders` | Order history |
| `/wishlist` | Saved items |

### Seller dashboard (protected, role: seller) — Phase 2, not built yet

| Route | Purpose |
|---|---|
| `/seller/dashboard` | Overview |
| `/seller/products` | Product list |
| `/seller/products/new` | Add product |
| `/seller/orders` | Orders for this seller |
| `/seller/earnings` | Earnings |
| `/seller/settings` | Store profile |
| `/seller/onboarding` | Apply to sell (verification) |

### Admin panel (protected, role: admin) — simplified version in Phase 1

| Route | Purpose | Phase |
|---|---|---|
| `/admin/dashboard` | Overview | 1 |
| `/admin/products` | Add/edit/moderate products | 1 |
| `/admin/orders` | All orders | 1 |
| `/admin/categories` | Manage categories | 1 |
| `/admin/sellers` | Approve/reject sellers | 2 |
| `/admin/users` | User management | 2 |
| `/admin/payouts` | Seller commission settlement | 2 |

## Data model

Phase 1 fields only are marked `(P1)`. Fields marked `(P2)` exist in the
schema so migrations aren't destructive later, but aren't used yet.

### User
- id, name, email, password_hash, phone, role (`customer` | `admin` |
  `seller` (P2)), created_at

### Product
- id, name, slug, description, price, stock_qty, category_id, images[],
  status (`active` | `draft` | `out_of_stock`), created_at
- seller_id (P2, nullable in Phase 1 — defaults to UNA Mart's own store)

### Category
- id, name, slug, parent_id (nullable, for subcategories)

### Order
- id, user_id, status (`pending` | `paid` | `shipped` | `delivered` |
  `cancelled`), total_amount, payment_method (`bkash` | `nagad`), shipping_address, created_at

### OrderItem
- id, order_id, product_id, quantity, price_at_purchase
- seller_id (P2, for splitting orders across sellers)

### Cart / CartItem
- Session or user-scoped. cart_id, product_id, quantity

### Review
- id, product_id, user_id, rating, comment, created_at

### Seller (P2, not built yet)
- id, user_id, store_name, verification_status, commission_rate

## API surface (NestJS, Phase 1)

Fake data (Next.js API routes) must return payloads shaped exactly like
these so swapping to the real API later requires no frontend changes.

```
GET    /products              list + filter (category, search, price range)
GET    /products/:slug        product detail
GET    /categories             list categories

POST   /auth/register
POST   /auth/login
GET    /auth/me

GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id

POST   /orders                create order (checkout)
GET    /orders                 current user's orders
GET    /orders/:id

POST   /reviews                add a review

--- admin only (Phase 1) ---
POST   /admin/products
PATCH  /admin/products/:id
DELETE /admin/products/:id
GET    /admin/orders
PATCH  /admin/orders/:id       update status
POST   /admin/categories
```

Phase 2 adds `/seller/*` and `/admin/sellers`, `/admin/payouts` — not part
of Phase 1 scope.

## Auth / roles

Three roles: `customer`, `seller` (P2), `admin`. Phase 1 only needs
`customer` and `admin`. Role check happens in NestJS guards, not just
hidden in the frontend — a hidden route is not the same as a protected one.
