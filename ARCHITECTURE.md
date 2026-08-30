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
| Database | PostgreSQL | Relational data (sellers→products→orders) fits marketplace shape |
| Cache/session | Redis | Cart and session data without hitting Postgres every request |
| Images | Cloudinary | CDN-served, no local disk storage to scale |
| Payments | bKash, Nagad | Bangladesh market — card-only would miss most customers |
| Hosting | Vercel (frontend), Railway/Render (backend + Postgres + Redis) | Low ops overhead for a two-person team |

## Repo layout

Monorepo, two apps:

```
una-mart/
├── apps/
│   ├── web/                      Next.js frontend
│   │   ├── app/
│   │   │   ├── (customer)/       route group — public storefront
│   │   │   │   ├── page.tsx
│   │   │   │   ├── category/[slug]/
│   │   │   │   ├── product/[slug]/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   └── account/
│   │   │   ├── (seller)/         route group — empty until Phase 2
│   │   │   ├── (admin)/          route group — admin panel
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   └── categories/
│   │   │   └── api/              fake data lives here in Phase 1
│   │   │       ├── products/route.ts
│   │   │       ├── categories/route.ts
│   │   │       └── orders/route.ts
│   │   ├── components/
│   │   │   ├── ui/               buttons, inputs, cards — design-token driven
│   │   │   ├── customer/
│   │   │   └── admin/
│   │   ├── lib/
│   │   │   ├── api-client.ts     single place all fetch calls go through
│   │   │   └── types.ts          shared types matching SYSTEM_DESIGN.md
│   │   └── styles/
│   │       └── tokens.css        navy/coral design tokens
│   │
│   └── api/                      NestJS backend (built in later phase)
│       └── src/
│           ├── products/
│           ├── categories/
│           ├── orders/
│           ├── auth/
│           └── admin/
│
└── packages/
    └── shared-types/              types shared between web and api once
                                   both exist, to avoid drift
```

### Why route groups matter now

`(customer)`, `(seller)`, `(admin)` are separate route groups even though
`(seller)` is empty in Phase 1. Adding seller routes later means adding a
folder, not restructuring what already exists.

### Why `api-client.ts` matters

All frontend data fetching goes through one file. In Phase 1 it points at
`/api/*` (fake). When the NestJS backend is ready, only this file's base
URL changes — components never call `fetch` directly, so they never need
to change.

## Data flow (Phase 1 → Phase 2)

```
Phase 1:  Component → api-client.ts → /app/api/* (fake data, in-memory or JSON)
Phase 2:  Component → api-client.ts → NestJS API → PostgreSQL
```

The contract (request/response shape) is fixed by `SYSTEM_DESIGN.md` from
day one, so this swap changes zero component code.

## Environment / config

- `.env.local` (web): `NEXT_PUBLIC_API_URL` — points at `/api` in Phase 1,
  at the NestJS URL once it exists.
- `.env` (api, once built): `DATABASE_URL`, `REDIS_URL`, `BKASH_*`,
  `NAGAD_*`, `CLOUDINARY_*`.
- Never commit `.env` files. `.env.example` documents required keys.

## Conventions

- TypeScript everywhere, strict mode on.
- One component = one file. Co-locate a component's types with it unless
  shared (then goes in `lib/types.ts` or `packages/shared-types`).
- Tailwind classes only — no separate CSS files per component except
  `styles/tokens.css` for the root design tokens.
- NestJS modules mirror the entities in SYSTEM_DESIGN.md: `products/`,
  `orders/`, `categories/`, `auth/` — one module per bounded concern.
- Auth checks belong in NestJS guards (backend), never trust a frontend
  route guard alone once the real backend exists.

## Deployment (later, not needed for fake-data phase)

- `web` → Vercel, auto-deploy from `main`.
- `api` → Railway/Render, auto-deploy from `main`, separate from web.
- PostgreSQL + Redis → managed instances on the same host as `api`.
