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
- Cache/session: Postgres at launch; Redis only on a measured need (ARCHITECTURE.md D2)
- ORM: Prisma
- Images: Cloudinary
- Payments (Bangladesh): Cash on Delivery + one aggregator at launch,
  direct bKash/Nagad later (ARCHITECTURE.md D5) — build the payment layer
  so a new provider can be added without touching order logic
- Hosting: Vercel (frontend), Railway or Render (backend + DB)

## Data access (real API since Oct 2026)

The storefront and admin use the NestJS API (`una-mart-backend`, `/v1`).
There is no fake data any more. Rules:

- Components never call `fetch` directly. Server components use
  `lib/catalog.ts` (cached, ISR 60 s); client components use
  `lib/api-client.ts` (storefront) or `lib/admin-api-client.ts` (admin).
  All of them go through `lib/http.ts`.
- API payloads are mapped to UI shapes in `lib/adapters.ts`; keep API field
  names out of components where an adapter already exists.
- Money is integer poisha everywhere; only `formatPrice` converts to taka.
- Business rules (prices, stock, COD risk, permissions) live in the API.
  The frontend shows previews and handles the API's error `code`s
  (`OUT_OF_STOCK`, `OTP_REQUIRED`, …); it never decides them.
- The admin UI redirects to `/admin/login`, but protection is the API's
  admin guard — never rely on a hidden route.
- Running locally needs the backend up (`npm run db:up` + `npm run
  start:dev` in `una-mart-backend`); `npm run build` needs it too.

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
