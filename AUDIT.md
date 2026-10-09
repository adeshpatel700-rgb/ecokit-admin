# EcoKit — Project Audit

Scope: `Desktop/ecokit` (outer folder) and `ecokit-next/` (the Next.js 16 app). Method: source review, lint/typecheck/build, then production build rendered in Chromium at 1440 px and 390 px with interaction tests.

## 1. What is actually in the repo

| Path | What it is | Verdict |
|---|---|---|
| `ecokit-next/` | Real app: Next 16.3, React 19, Tailwind 4 (installed, effectively unused), 10 static pages | **Keep — the project** |
| Outer `package.json`, `src/`, `tsconfig.json`, `vercel.json`, `next-env.d.ts`, `node_modules/` | Stale earlier attempt: Next 14, Tailwind 3, a *different* palette (forest `#2f4233`), `dev: node server.js` (file doesn't exist), `build: echo "Built…"` | **Dead. Do not deploy from here** |
| `.vercel/project.json` (outer) | Vercel project `ecokit` linked to the *outer* folder | See P0-3 |

The app is a mechanical HTML→JSX conversion of the original static site. There is **no** Firebase, Firestore, Storage, auth, admin, cart, checkout, Razorpay, orders, inventory or enquiry backend anywhere in either folder.

## 2. Findings

### P0 — Critical
| # | Issue | Where / cause | Impact | Status |
|---|---|---|---|---|
| P0-1 | Most page content invisible | `[data-reveal]{opacity:0}` in globals.css; the JS that adds `.revealed` was not migrated. 51 sections on `/` alone | Homepage looked blank below the hero | **Fixed** (`RevealOnScroll`) |
| P0-2 | ~70 CSS classes used but undefined | Page-specific styles from the static site were lost | Filters, contact/quote layout, FAQ, About, Hospitality, Custom Kits, footer grid all collapsed | **Fixed** (`pages.css`) |
| P0-3 | Deployment config points at the wrong project | Outer `vercel.json` (`framework:null`, `buildCommand: echo`, `outputDirectory: "."`) + outer `package.json` | Vercel deploys a static folder, not the Next app | **Open** — in Vercel set *Root Directory* = `ecokit-next` (or move the contents up a level). Not changed automatically because it affects your live project. |
| P0-4 | Forms submit nowhere | `action="#"` on Contact and Quote | Every lead is lost | **Fixed** — `/api/enquiry` + `ENQUIRY_WEBHOOK_URL`. **You must set that env var** (production returns a clear 503 until it is set rather than pretending success). |
| P0-5 | Required commerce/admin stack absent | See §1 | Cannot take payments or manage content | **Partly addressed** — cart + checkout + Razorpay server flow now exist (Round 2). Firebase, admin, orders DB still open (§3b, §4) |

### P1 — High
- Fixed nav overlapped headings on every inner page — **fixed**.
- "View" links went to non-existent `product-detail.html`; `/product-detail` was a placeholder page — **fixed**, dynamic `/products/[slug]`.
- Product filters/sort were decorative (static checkboxes) — **fixed**.
- Dead icon buttons (account, wishlist, cart with "0", per-card Add) — **removed**, see CHANGELOG.
- Footer logo invisible on dark background (`mix-blend-mode:multiply`) — **fixed**.
- Mobile: announcement bar clipped — **fixed**; footer headings wrong font — **fixed**.
- Hard-coded Google Fonts `@import` — **fixed** (self-hosted).
- No `not-found`/`error` pages, no sitemap/robots, identical metadata on all pages — **fixed**.

### P2 — Medium
- 14 product cards copy-pasted (~450 lines) → one typed data module + `ProductCard` — **fixed**.
- `<img>` everywhere, no optimisation; ~750 KB–1 MB PNG/JPG per image. Now `next/image`; **source files are still large** — recompress originals (open).
- Heavy inline `style={{}}` throughout pages (HTML converter output) — **open**; a token/utility pass would reduce it but risks visual regressions.
- Tailwind 4 is installed but nothing uses it (design is plain CSS in `globals.css`, 2.6k lines) — **open**; either adopt or remove the dependency.
- 2.6k-line `globals.css` with some duplicated/unused rules — **open**.
- Contact details are placeholders (`+91 99999 99999`); now centralised in `src/lib/site.ts` — **client to confirm**.

### P3 — Low
- Emoji used as section icons (About → Materials).
- `README.md` is the create-next-app default.
- Home page `product-scroll-mobile` scroller and category cards not re-tested beyond render.

## 3. Content that needs the client to confirm (not changed)
- **Catalogue mismatch.** Brief lists 22 products; the site has 14. Missing: Wheat Straw Brush/Comb (site says *Toothbrush*; comb absent), Wheat Straw Shaving Kit, Wooden Cotton Earbuds, Bamboo Bottle 500 ml, Bamboo Coffee Mug, Bamboo Notepad with Pen, Bamboo Paddle Comb, Bamboo Tumbler with Handle. Category **Hotel Amenities** has no products. Not invented.
- **Product photography.** Only 13 images exist, several reused across unrelated products (e.g. one "tongue cleaner" photo is used for the toothbrushes and shower cap; a hotel-room photo is used for Body Lotion and Conditioner). Needs real shots.
- **Inconsistent business claims** across pages: MOQ (FAQ: 100 standard / 500 custom; Hospitality: custom kits from 50 sets), lead times (Quote: 15-day; Hospitality: 7–10 / 15–20 days), "Over 70% of partner hotels", "₹299 sample pack", "Complimentary custom branding". Left as supplied — please verify.
- Home **testimonials were named, fabricated-looking quotes** (e.g. "Rohan Mehta, GM, Serenity Boutique, Goa"). Removed per the no-fake-testimonials rule; supply real quotes to restore.
- Homepage stats ("200+ properties", "0% plastic", "15 days") and "Made in India"/sustainability claims are unverified — confirm or remove.
- Product prices are "From" prices; no stock/availability data exists.

## 3a. Round 3 — palette note
The Citrus Grove values are preserved exactly as `--palette-*`. Text and
interactive colours are derived (`--color-*`) because the raw palette fails AA
as text. If the palette is ever revised, change `--palette-*` and re-run the
contrast sweep — do not point text tokens straight at palette values.

## 3b. Round 2 additions — decisions still needed
- **Cart price semantics.** Listed prices were "From ₹X". The cart treats the listed price as the **per-unit retail price** and adds **no shipping or GST**. Confirm real retail prices, tax handling and shipping rules before turning on Razorpay.
- **Order persistence.** Verified payments are forwarded to `ORDER_WEBHOOK_URL` only; there is no database, so `verify` is not idempotent and there is no admin/order history. Add Firestore (or similar) + a Razorpay `payment.captured` webhook before launch.
- **Razorpay is implemented but untested against the live API** (no keys in this environment). Signature logic follows Razorpay's documented HMAC scheme; test with test-mode keys.
- No stock data → no "out of stock" behaviour and no `availability` in structured data.

## 4. Decisions needed before building the missing systems
Each of these is a product decision, so I did not build speculative versions:
1. **Do you want online checkout at all?** The site copy and CTAs are B2B/quote-led. Razorpay needs: shipping rules, GST, COD?, refund policy, order statuses.
2. **Firebase**: project credentials, Firestore data model (products, categories, orders, enquiries, settings), Storage buckets, who are the admins (Firebase Auth + custom claims).
3. **Admin scope**: full CRUD for products/categories/orders/enquiries/homepage/settings is a separate build (~routes under `/admin`, server-verified auth, Firestore rules).
4. Where enquiries should land (email, Firestore, CRM).

Recommended order once decided: Firestore catalogue (swap `lib/products.ts` data source) → enquiries to Firestore → Admin auth + product CRUD → cart → Razorpay (server-created orders, HMAC signature verification, webhook, server-side price recalculation).

## 5. Security notes
- No secrets exist in the repo (there are no integrations yet). `.env*` is git-ignored; `.env.example` added.
- Enquiry API validates and length-limits server-side, has a honeypot, times out webhook calls, and never echoes internals. **No rate limiting yet** — add (e.g. Vercel WAF / Upstash) before public launch.
- Product JSON-LD is escaped against `</script>` injection.
- Future payment code must never trust client prices or client "success" state.
