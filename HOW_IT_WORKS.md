# How the UNA Mart frontend works

This document explains how the storefront and admin panel are built and what
happens, step by step, when someone browses, buys, logs in or manages the
shop. Read it before changing the code. The API itself is explained in
`una-mart-backend/HOW_IT_WORKS.md`. Product rules are in `SYSTEM_DESIGN.md`,
and stack decisions are in `ARCHITECTURE.md`.

---

## 1. The big picture

```
                    ┌──────────── Next.js 16 (this repo) ────────────┐
Shopper's browser ──┤ storefront pages      admin pages (/admin)      │
                    │ server components ──► lib/catalog.ts ──┐        │
                    │ client components ──► lib/api-client.ts ├─► NestJS API /v1 ─► PostgreSQL
                    │ admin components ───► lib/admin-api-client.ts ┘  │
                    └─────────────────────────────────────────────────┘
```

- **Next.js 16** (App Router, React 19, Tailwind v4, navy/coral design
  tokens in `app/globals.css`).
- **All data comes from the NestJS API** (`NEXT_PUBLIC_API_URL`, e.g.
  `http://localhost:4000/v1`). There is no fake data or `/api` route in this
  repo any more.
- **The browser calls the API directly** with cookies
  (`credentials: "include"`). It does not go through a Next.js proxy, because
  then every shopper would look like the same IP to the API's rate limits.
  The web site and the API must be **same-site** (`localhost:3000` ↔
  `localhost:4000`; later `unamartbd.com` ↔ `api.unamartbd.com`) so the
  `SameSite=Lax` cookies are sent.
- **Money is integer poisha everywhere** (৳1 = 100 poisha). Only
  `formatPrice()` in `lib/format.ts` turns it into "৳2,450". Price inputs in
  the admin are typed in taka and converted with `toPoisha()`.
- **Business rules live in the API** (prices, stock, who must verify a phone,
  who is admin). The frontend shows previews and reacts to the API's error
  `code`.

---

## 2. Folder map

```
app/
├── layout.tsx                 root: fonts, metadata, providers (Toast → Cart → Auth → Wishlist)
├── (customer)/                public storefront (header, footer, cart drawer)
│   ├── layout.tsx             loads categories + menu products for the header
│   ├── page.tsx               homepage
│   ├── products/, category/[slug]/, search/    listings (filters in the URL)
│   ├── product/[slug]/        product detail
│   ├── cart/, checkout/, track-order/, wishlist/
│   ├── login/, register/, account/
│   └── about/, contact/, faq/, policies, terms, 404 pages
├── (admin)/admin/             admin panel (login, overview, orders, products,
│                              categories, settings)
├── sitemap.ts, robots.ts
components/
├── ui/                        design-system pieces (Button, Field, Drawer, Price…)
├── customer/                  storefront components
└── admin/                     admin components
lib/
├── http.ts                    THE fetch wrapper: base URL, cookies, ApiError
├── catalog.ts                 catalog reads for server components (cached 60 s)
├── api-client.ts              storefront calls from the browser
├── admin-api-client.ts        admin calls + admin types
├── adapters.ts                API payload → UI Product / Category
├── listing.ts                 listing filters ⇄ URL ⇄ API query
├── types.ts                   shared types
├── cart-context.tsx           server cart state + cart drawer
├── auth-context.tsx           who is logged in, OTP login, logout
├── wishlist-context.tsx       wishlist (browser storage only)
├── pricing.ts                 delivery-fee / savings previews
├── product.ts, format.ts      stock & discount rules, money/date formatting
├── seo.tsx, site.ts           JSON-LD helpers, shop details
proxy.ts                       adds noindex + no-store headers to /admin
```

---

## 3. The data layer

| File | Used by | What it does |
|---|---|---|
| `lib/http.ts` | everything | `request()` adds the base URL and cookies, sends JSON, and turns errors into `ApiError(message, status, code)`. A network failure gives code `NETWORK` with the message "We can't reach UNA Mart right now…" |
| `lib/catalog.ts` | server components | `getCategories`, `getProducts(query)`, `getAllProducts`, `getProduct(slug)`, `getPriceBounds`. Responses are cached with **ISR for 60 seconds**, so admin edits appear in the store within about a minute. |
| `lib/api-client.ts` | client components | cart, checkout, order lookup/cancel, my orders, OTP login, me, logout, products by ids (wishlist), delivery zones |
| `lib/admin-api-client.ts` | admin components | admin login, stats, orders, products, variants, stock, categories, zones, phone flags |
| `lib/adapters.ts` | catalog + api-client | maps the API's product/category shapes to the UI's `Product` / `Category`, so components don't depend on raw API fields |

On the server, `API_URL` can point to a private API address. It falls back
to `NEXT_PUBLIC_API_URL`.

**Rule:** components never call `fetch` themselves. Add a function to one of
these files instead.

---

## 4. Server vs client components

- **Server components** (pages, header data, product page body) fetch the
  catalog during rendering. The HTML arrives with products already in it,
  which is good for speed and SEO.
- **Client components** (`"use client"`) handle anything personal or
  interactive: cart, checkout, login, account, wishlist, filters, the whole
  admin panel. They call the API from the browser with cookies.

Global state comes from providers in `app/layout.tsx`:

| Provider | Holds | Loads from |
|---|---|---|
| `ToastProvider` | small pop-up messages | — |
| `CartProvider` | the server cart, item count, drawer open/closed | `GET /cart` on page load and after every change |
| `AuthProvider` | current user (`null` = guest) | `GET /auth/me` on page load |
| `WishlistProvider` | saved product ids | browser `localStorage` |

---

## 5. Browsing

### Header and menu
`app/(customer)/layout.tsx` loads categories and up to 5 products per
category (for the mega menu) on the server. These are cached for 60 s.

### Homepage
Categories, deals (discounted, in stock), best sellers (most ratings) and new
arrivals (`sort=newest`) come from the API.

### Listings (`/products`, `/category/[slug]`, `/search?q=`)
Filters, sort and page live **in the URL**, so a filtered page can be shared
or bookmarked:

| URL param | Meaning | API param |
|---|---|---|
| `cat=mens-wear,womens-wear` | category checkboxes | `category=` |
| `stock=1` | in stock only | `in_stock=true` |
| `sale=1` | on sale | `on_sale=true` |
| `min=500&max=2000` | price in **taka** | `price_min/price_max` in **poisha** |
| `rating=4` | 4★ & up | `rating_min=4` |
| `sort=price-asc` | sorting | `sort=` |
| `page=2` | page (24 per page) | `page=` |

How a filter click works:

1. `ProductListingPage` (client) builds the new URL with `lib/listing.ts` and
   calls `router.push()`. The grid dims while loading.
2. The page (server) reads the URL with `parseListing()`, turns it into an API
   query with `listingQuery()`, and fetches exactly that page.
3. The price boxes apply on blur or Enter, not on every keystroke.

### Product page
The server loads the product (with variants), categories, related products
and delivery fees. `ProductPurchasePanel` (client) shows the price, an
**option picker when there is more than one variant**, quantity, "Add to
cart" and "Buy now". The price and stock follow the chosen variant. Product
cards for multi-variant products show "Choose options" instead of "Add to
cart".

---

## 6. Cart

1. "Add to cart" calls `cart.addItem(variantId, qty)` →
   `POST /v1/cart/items`. A guest's first add makes the API set the
   `una_cart` cookie.
2. The API returns the whole cart with **current** names, images, prices and
   stock. The context stores it, the header badge updates, and the drawer
   opens.
3. Lines with a problem have `issue = "unavailable"` or
   `"insufficient_stock"`. The row shows a red message, and checkout is
   blocked until it's fixed.
4. The cart page shows "Delivery calculated at checkout". The fee depends on
   the zone chosen there.

---

## 7. Checkout — step by step

`components/customer/CheckoutView.tsx`

1. Loads delivery zones (`GET /delivery-zones`). Each zone card shows its fee
   for this cart ("Free" when every item has free delivery).
2. A logged-in customer gets name, phone and email filled in.
3. The form checks name, phone (Bangladeshi mobile), address and city before
   sending.
4. Only **Cash on Delivery** can be chosen. bKash and Nagad show "Coming
   soon".
5. "Place order" → `POST /orders`.
   - **Success** → confirmation screen with the `UM-…` number. It says
     "confirmed" if the phone was verified, otherwise "we'll call you". The
     cart is refreshed (now empty).
   - **`OTP_REQUIRED`** (first-time phone, big order, past refusals) → the
     page asks the API to text a code (`purpose: "checkout"`) and shows a
     **"Verify your phone"** box with a 6-digit field and "Resend code"
     (60 s cooldown). "Verify & place order" sends the same order again with
     `otpCode`.
   - **`OTP_INVALID` / `OTP_LOCKED`** → message shown. A locked code needs a
     resend.
   - **`OUT_OF_STOCK`, `ITEM_UNAVAILABLE`, `CART_EMPTY`** → message shown and
     the cart reloaded.
   - **`COD_BLOCKED`** → message shown.
6. In development the code also appears on screen as "Dev mode code" (the API
   returns it while SMS goes to the console).

---

## 8. Login, sign up and account

- **`/login`:** phone → "Send code" → 6-digit code → "Verify & log in".
  **`/register`** is the same plus a name, saved with `PATCH /auth/me` after
  login.
- On success: `AuthProvider` stores the user, the **cart is reloaded** (the
  API merged the guest cart into the account), and the page goes to `?next=`
  (only paths on this site) or `/account`.
- The header shows the first name and links to `/account`. The mobile menu
  shows "My account".
- **`/account`:** greeting, my orders (paged, each links to Track Order),
  profile (name, email), log out. Guests are sent to
  `/login?next=/account`.

---

## 9. Track order

`/track-order?number=UM-10231&phone=017…`

- Guests enter the order number and phone. Logged-in customers can leave the
  phone empty for their own orders.
- Links from the confirmation screen and the account page arrive pre-filled
  and look up automatically.
- Steps shown: Order placed → Confirmed → Packed → On the way → Delivered.
  Cancelled, delivery failed and returned orders show a notice instead.
- Items, totals, address and payment are shown. **"Cancel this order"**
  appears only while the API says the order is still cancellable.

---

## 10. Admin panel

### Access
- `AdminShell` (`components/admin/AdminShell.tsx`) calls `GET /auth/me`.
  Unless the user is role `admin` **with an admin session**, it redirects to
  `/admin/login?next=…`.
- `/admin/login`: phone + password → code (shown as "Dev mode code" in
  development) → admin session (12 hours).
- If any admin request returns 401/403 (e.g. the session expired),
  `useAdminQuery` sends the admin back to the login page.
- **Real protection is the API.** The UI redirect only avoids showing an
  empty shell. `proxy.ts` adds `noindex` and `no-store` headers.

### Pages

| Page | What you can do |
|---|---|
| Overview | today's orders and value, pending confirmations, low stock, recent orders |
| Orders | status tabs with counts, search (number / phone / name), pages |
| Order detail | items, totals, history (who did what), **only the valid next-step buttons** (Confirm, Start packing, Mark as shipped, Mark as delivered, Delivery failed, Received back, Cancel), internal note, customer COD history, block/unblock phone |
| Products | search (name / SKU), status and category filters, pages |
| New product | details, category, first variant (SKU, price, original price, opening stock), images (site paths or pick from the library), status, badge, free delivery |
| Edit product | same details + **Variants & stock**: edit SKU/options/prices, hide a variant, add a variant, **Add units / Remove units** with a reason |
| Categories | tree; add, add subcategory, rename + move, hide/show (no delete) |
| Settings | delivery zones: name, fee, delivery time, on/off |

Every change in the admin is written to the API's audit log.

---

## 11. Wishlist

The heart button saves product ids in `localStorage`. `/wishlist` fetches
those products with `GET /products?ids=…`. It does not follow the shopper to
other devices yet.

---

## 12. SEO

- Product and category pages set titles, descriptions and canonical URLs.
- JSON-LD: Product (price in BDT), BreadcrumbList, WebSite search.
- `sitemap.xml` is built from the API (all categories and products) and
  refreshed hourly.
- Login, account, search and admin pages are `noindex`.

---

## 13. Configuration

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
# API_URL=            optional private URL for server components
# NEXT_PUBLIC_SITE_URL=https://www.unamartbd.com
```

The backend's `WEB_ORIGIN` must include this site's address
(`http://localhost:3000`), or the browser's requests are blocked.

---

## 14. Running

```bash
# 1. Docker Desktop running
# 2. backend:  cd ../una-mart-backend && npm run db:up && npm run start:dev
# 3. frontend:
npm run dev            # http://localhost:3000
npm run lint
npm run build          # needs the API running — pages are pre-rendered from it
```

If the site shows "We can't reach UNA Mart right now", the API on port 4000
is not running (or Docker is off).

---

## 15. Adding something new — the usual path

1. Add the API call to `lib/api-client.ts` (or `admin-api-client.ts`, or
   `catalog.ts` for server-rendered catalog data). Add the types to
   `lib/types.ts`.
2. If the API shape differs from what the UI needs, map it in
   `lib/adapters.ts`.
3. Show amounts with `formatPrice()`. Never divide by 100 anywhere else.
4. Handle the API's error `code`s you expect, and show `error.message` for
   the rest.
5. Follow the design rules in `CLAUDE.md` (tokens, accessibility, no GSAP on
   listing screens).
6. Run `npm run lint`, `npx tsc --noEmit` and `npm run build`.

---

## 16. Not built yet

SMS (codes only show in development), online payment, courier tracking,
image uploads (images must be `/…` paths in `public/`), saved addresses,
returns, reviews, wishlist on the account, admin customers list and audit-log
page, deployment.
