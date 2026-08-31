# UNA Mart — project instructions for Claude Code

Read `SYSTEM_DESIGN.md` and `ARCHITECTURE.md` before starting any task. Follow
them exactly. If a request conflicts with either file, point out the conflict
before writing code instead of silently picking one side.

## What this project is

UNA Mart is a multi-category e-commerce marketplace (gadgets, groceries, and
more categories over time) built by two founders: Al Amin (frontend
developer, building both frontend and backend) and Unib (co-founder). Target
market is Bangladesh. Tagline: "Everything you need, in one place."

## Current phase: MVP, single-seller

We are in Phase 1. Build ONLY single-seller features right now:
- One store (UNA Mart's own products), no outside sellers yet
- Customer-facing storefront + a simple admin panel
- No seller dashboard, no seller onboarding, no commission/payout logic

Do not build multi-vendor features (seller registration, seller dashboard,
commission splitting, payout admin) until explicitly asked to start Phase 2.
If a task seems to call for one of these, ask first rather than adding it.

## Stack (do not substitute without asking)

- Frontend: Next.js (App Router) + Tailwind CSS + GSAP for animation
- Backend: Node.js + NestJS
- Database: PostgreSQL
- Cache/session: Redis
- Images: Cloudinary
- Payments (Bangladesh): bKash, Nagad — build the payment layer so a new
  provider can be added without touching order logic
- Hosting: Vercel (frontend), Railway or Render (backend + DB)

## Frontend-first workflow

Right now the frontend is being built against fake data, not the real
backend. Rules for this phase:

- Fake data must live behind Next.js API routes (e.g.
  `/app/api/products/route.ts`), never hardcoded directly inside components.
- Client components (anything `"use client"`, e.g. cart actions) call
  `/api/*` through `lib/api-client.ts`, not a local import — this is what
  lets us swap fake data for the real NestJS API later by editing only
  `api-client.ts`'s base URL, not the components.
- Server components (pages doing SSR data fetching, e.g. the homepage,
  category page, product page) import the data helpers from
  `lib/fake-data.ts` directly (`getProducts`, `getCategories`,
  `getProductBySlug`) instead of going through `api-client.ts`. A server
  component calling its own `/api/*` route via HTTP is a self-fetch that
  Vercel's deployment protection (and similar edge auth) can 401 — importing
  the data functions directly avoids that request entirely. When the real
  backend is ready, these call sites switch from the `fake-data` import to
  an authenticated server-side fetch to the NestJS API — expect to touch
  each server component, not just one config value.
- Fake data shape must match `SYSTEM_DESIGN.md`'s data model exactly, so the
  swap to the real API stays a small, mechanical change per call site.
- Cart, login, and checkout state must be real (React state/context), not
  static mockups — only the data source is fake, the behavior is not.

## Animation rules (GSAP)

- Allowed: homepage hero, category showcase, promotional banners, hover
  micro-interactions on marketing sections.
- Not allowed: product listing grids, search results, checkout flow, any
  seller/admin dashboard screen. Use plain Tailwind `transition` classes
  there instead. These screens are judged on speed, not flair — Bangladesh's
  mobile-heavy, often slower connections make this a real constraint, not a
  style preference.

## Design tokens

Color and spacing tokens are already decided — see `una-mart-tokens.css` /
`tailwind.config.js` if present in the repo. Use the existing navy/coral
scale and the documented button contrast rules (coral-400 background pairs
with navy-800 text, not white — this is a deliberate accessibility choice,
not an oversight). Don't introduce new brand colors without asking.

## General rules

- Prefer editing existing files over creating new ones.
- Keep seller-facing and customer-facing routes in separate route groups
  from the start, even while seller routes are unused, so Phase 2 doesn't
  require restructuring — see ARCHITECTURE.md for the folder layout.
- Ask before adding a new major dependency.
- Write in TypeScript, not plain JavaScript, on both frontend and backend.
