# UNA Mart — architecture

This is the reference for HOW the product is built. `SYSTEM_DESIGN.md` covers
WHAT it is (pages, data, API).

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript | SEO-friendly, same language as backend |
| Styling | Tailwind CSS | Fast, consistent with existing design tokens |
| Animation | GSAP | Marketing sections only — see CLAUDE.md rules |
| Backend | Node.js + NestJS, TypeScript | Structured (modules/controllers/services), same language as frontend |
| ORM / migrations | Prisma | Most common with NestJS, best docs and migrations, atomic stock updates |
| Database | PostgreSQL (managed: Railway or Neon) | Relational data (sellers→products→orders) fits marketplace shape |
| Cache/session | **None at launch** — Postgres holds carts and sessions | See decision D2; add Redis only on a measured need |
| Search | Postgres full-text + `pg_trgm` | Typo-tolerant, free, enough for thousands of products |
| Images | Cloudinary (signed uploads from admin) | CDN-served, automatic resizing/WebP |
| Payments | Cash on Delivery + one aggregator (e.g. SSLCommerz) at launch; direct bKash/Nagad later | See decision D5 |
| Delivery | One courier API (Steadfast or Pathao) behind an interface | See decision D6 |
| SMS | Local SMS gateway (OTP + order notifications) | Phone-first auth, Bangladesh market |
| Monitoring | Sentry (web + api) | Errors surface before customers report them |
| Hosting | Vercel (frontend), Railway/Render (API + Postgres) | Low ops overhead for a two-person team |

## Decisions

Short records of choices that are expensive to reverse. To change one,
add a new entry that supersedes it — don't silently edit.

| # | Decision | Why | Revisit when |
|---|---|---|---|
| D1 | **Prisma** for ORM and migrations | Best NestJS docs, safe migrations, type-safe queries; conditional `updateMany` handles the stock race | Hot paths need raw SQL (use `$queryRaw` there, keep Prisma) |
| D2 | **No Redis at launch** | Postgres easily handles carts, sessions and rate-limit counters at our scale; one less service to run and pay for | p95 API latency or DB load shows a measured need |
| D3 | **Phone + OTP auth**, optional password later; admins need OTP + password | How Bangladeshi shoppers expect to log in; verifies phones, which cuts fake COD orders | — |
| D4 | **Server-side sessions** in Postgres via an httpOnly, `Secure`, `SameSite=Lax` cookie; API on `api.unamartbd.com` | Instantly revocable, no token juggling in JS; the shared parent domain keeps cookies first-party between Vercel and Railway | A native mobile app (add token auth alongside) |
| D5 | **COD + one payment aggregator** first; direct bKash/Nagad later | One integration covers bKash, Nagad and cards with faster approval; the `PaymentProvider` interface makes switching a new adapter, not a rewrite | Online volume makes direct-API fees worth it — **DECIDE** after fee quotes |
| D6 | **One courier** at launch behind a `CourierProvider` interface | Steadfast and Pathao both offer APIs and COD settlement; one is enough to launch | Coverage or rates require a second — **DECIDE** courier after rate quotes |
| D7 | **Money as integer poisha**, UUID ids, UTC timestamps, E.164 phones | Avoids float rounding, guessable ids, timezone and phone-format bugs | — |
| D8 | **OpenAPI** generated from NestJS → typed client generated for the web app | Frontend and backend types can't drift; replaces hand-written `lib/types.ts` | — |
| D9 | **Monorepo** (`apps/web`, `apps/api`) with pnpm workspaces, no Turborepo yet | One PR can change API and UI together | CI builds get slow |

## Repo layout

**Current state (Phase 1, frontend-only): flat single Next.js app**, not yet
the monorepo below — there is no `apps/web/` split while the NestJS backend
doesn't exist. The move to the monorepo happens when the `api` app is
started (now, still Phase 1 — the backend is not a Phase 2 feature).

```
una-mart-frontend/                (this repo, root of the Next.js app)
├── app/
│   ├── (customer)/                route group — public storefront
│   │   ├── page.tsx               homepage
│   │   ├── products/, category/[slug]/, search/
│   │   ├── product/[slug]/
│   │   ├── cart/, checkout/       checkout → POST /api/orders
│   │   ├── wishlist/, track-order/, login/, register/
│   │   ├── about/, contact/, faq/, *-policy/, terms/
│   │   ├── not-found.tsx, error.tsx, [...missing]/ (branded 404)
│   │   └── account/               not built yet (needs auth backend)
│   ├── (admin)/                   route group — admin panel, not built yet
│   ├── sitemap.ts, robots.ts
│   └── api/                       fake data lives here in Phase 1
│       ├── products/route.ts      ?category= (incl. subcategories) &search= &ids=
│       ├── products/[slug]/route.ts
│       ├── categories/route.ts
│       ├── cart/route.ts, cart/items/route.ts, cart/items/[id]/route.ts
│       └── orders/route.ts (POST), orders/[id]/route.ts (GET, phone-verified)
├── components/
│   ├── ui/                        design-system primitives: Button/ButtonLink,
│   │                              Field, Drawer, Price, SectionHeader,
│   │                              Breadcrumbs, EmptyState, QuantityStepper…
│   └── customer/                  storefront components (ProductCard is the
│                                  single product card used everywhere)
├── lib/
│   ├── api-client.ts               single place all client fetch calls go through
│   ├── types.ts                    shared types matching SYSTEM_DESIGN.md
│   ├── cart-context.tsx            real cart state + mini-cart drawer state
│   ├── wishlist-context.tsx        guest wishlist (localStorage; no API yet)
│   ├── toast-context.tsx           accessible toast feedback
│   ├── pricing.ts                  subtotal / savings / delivery-fee rules
│   ├── product.ts, format.ts       discount + stock rules, ৳ price formatting
│   ├── site.ts                     contact details, payment labels, site URL
│   ├── seo.tsx                     JSON-LD helpers (Product, Breadcrumb)
│   ├── motion.ts                   prefers-reduced-motion check for GSAP
│   ├── fake-data.ts, fake-cart-store.ts, fake-order-store.ts   Phase 1 in-memory data
│   └── session.ts                  cookie-based session id for the fake cart
└── app/globals.css                 navy/coral design tokens (Tailwind v4 @theme)
                                    + component classes in @layer components
```

### Target state (once the NestJS backend starts)

```
una-mart/
├── apps/
│   ├── web/                      this app, moved here as-is
│   └── api/                      NestJS backend
│       ├── prisma/               schema.prisma, migrations/, seed.ts
│       └── src/
│           ├── auth/             OTP, sessions, role guards
│           ├── users/            profile, addresses
│           ├── catalog/          products, variants, images, categories, search
│           ├── inventory/        stock ledger (StockMovement), the only writer of stock
│           ├── cart/
│           ├── orders/           checkout, lifecycle transition(), status events
│           ├── payments/         PaymentProvider interface + adapters (cod, sslcommerz, bkash…)
│           ├── shipping/         CourierProvider interface + adapters, delivery zones
│           ├── returns/          return requests, refunds
│           ├── reviews/
│           ├── notifications/    SMS (email later)
│           ├── admin/            admin-only controllers, audit log
│           ├── jobs/             payment expiry, reconciliation, cart cleanup
│           └── common/           money, phone, errors, pagination, config
│
└── packages/
    └── api-client/                generated from the API's OpenAPI spec (D8)
```

### Module boundaries that matter

- **Only `inventory/` changes stock**, and only `orders/` changes order
  status (through `transition()`). Everything else calls those services,
  so the overselling and lifecycle rules each live in one place.
- **Providers are adapters:** `payments/` and `shipping/` depend on an
  interface (`createPayment`, `verify`, `refund` / `book`, `track`,
  `cancel`). Adding bKash-direct or a second courier is a new adapter plus
  config, with no change to order logic.

### Why route groups matter now

`(customer)`, `(seller)`, `(admin)` are separate route groups even though
`(seller)` is empty in Phase 1. Adding seller routes later means adding a
folder, not restructuring what already exists.

### Why `api-client.ts` matters

All frontend data fetching goes through one file. In Phase 1 it points at
`/api/*` (fake). When the NestJS backend is ready, only this file's base
URL changes — components never call `fetch` directly, so they never need
to change.

## Data flow (fake API → real API)

```
Now:    Component → api-client.ts → /app/api/* (fake data, in-memory)
Next:   Component → generated client → NestJS API → PostgreSQL
```

Client components change only through `api-client.ts`. Server components
(homepage, category and product pages) switch from importing
`lib/fake-data.ts` to a server-side API fetch, one call site each. The v2
contract changes listed in `SYSTEM_DESIGN.md` (poisha, pagination,
variants) are one-time frontend updates.

## Environment / config

- `.env.local` (web): `NEXT_PUBLIC_API_URL` — points at `/api` in Phase 1,
  at the NestJS URL once it exists.
- `.env` (api, once built): `DATABASE_URL`, `SESSION_SECRET`,
  `PAYMENT_*` (aggregator keys), `COURIER_*`, `SMS_*`, `CLOUDINARY_*`,
  `SENTRY_DSN`, `WEB_ORIGIN` (for CORS).
- Never commit `.env` files. `.env.example` documents required keys.

## Conventions

- TypeScript everywhere, strict mode on.
- One component = one file. Co-locate a component's types with it unless
  shared (then goes in `lib/types.ts` or `packages/shared-types`).
- Tailwind classes only — no separate CSS files per component except
  `app/globals.css` for the root design tokens (Tailwind v4 `@theme`).
- NestJS modules mirror the entities in SYSTEM_DESIGN.md: `products/`,
  `orders/`, `categories/`, `auth/` — one module per bounded concern.
- Auth checks belong in NestJS guards (backend), never trust a frontend
  route guard alone once the real backend exists.

## Deployment

- `web` → Vercel, auto-deploy from `main`; preview deploys per PR.
- `api` → Railway/Render, auto-deploy from `main`; `prisma migrate deploy`
  runs before the new version starts.
- PostgreSQL → managed, **daily backups on, and one tested restore before
  launch**.
- Two environments: `staging` (provider sandboxes, test SMS) and
  `production`. Provider keys are never shared between them.

## Security and operations baseline (before launch)

- Rate limits on OTP request/verify, login, `POST /orders` and guest order
  lookup (counters in Postgres, D2).
- Webhooks verify the provider signature or call back to the provider;
  never trust the payload alone.
- CORS allows only `WEB_ORIGIN`; cookies are `Secure` and `HttpOnly`.
- Every request body is validated with DTOs (`class-validator`).
- Sentry on web and API, structured JSON logs with a request id, and an
  uptime check on `/health`.
- Admin writes create `AuditLog` rows.
