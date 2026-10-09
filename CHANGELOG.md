# EcoKit — Change Log

## Round 5 — real catalogue, Firebase, admin panel, blog

### Catalogue
Replaced the old 14 products with the client's 18 (2026-10-05).

- **No prices were supplied.** The ten products that already existed keep their
  previous prices; the eight new ones have `price: null`, which renders as
  **"Price on request"** and routes to the quote form. No price was invented.
  `isPurchasable()` gates this in one place and TypeScript enforces the rest —
  unpriced items cannot enter the cart, and `priceCart()` refuses to price them
  server-side, so one can never reach a paid order.
- Four products are not on the client's list (jute travel bag, canvas slippers,
  conditioner, bamboo shaving kit). Removed from the site but kept in
  `ARCHIVED_PRODUCTS`; restoring one is a copy-paste. Their URLs redirect to
  /products, and renamed products (body-lotion → moisturizer, natural-loofah →
  jute-loofah) redirect permanently.
- Combs moved from Oral Care to Hair Care, where they belong. Added a
  Corporate & Gifting category for the bamboo diary and pen.
- Contact numbers added: +91 74791 01230 (also WhatsApp) and +91 79085 89297.
- Every product now points at `/images/products/<slug>.jpg`, currently a branded
  placeholder. Real photos dropped in at those names need no code change.
  See PRODUCT-PHOTO-PROMPTS.md.

### Firebase
Full integration, entirely env-driven, with the built-in catalogue as fallback.

- Admin SDK server-side only; the browser SDK is used for *one* thing — signing
  an admin in. No product, order or enquiry data is read or written from the
  client, so `firestore.rules` denies all client writes outright.
- `src/lib/content.ts` is the single read path. A Firestore failure logs and
  falls back rather than throwing a 500 at a customer — verified by pointing the
  app at an unreachable project: /products still served all 18.
- Enquiries are now persisted to Firestore as well as sent to the webhook.
- `firestore.rules`, `storage.rules`, `npm run seed`, `npm run make-admin`.

### Admin panel (`/admin`)
- Firebase Auth sign-in → server verifies the ID token **and an `admin` custom
  claim** → httpOnly session cookie, re-verified on every page and every
  mutation. The claim can only be set with the service account, so signing up
  can never grant admin. Nothing trusts the client.
- Products CRUD, blog CRUD with draft/publish, enquiries, site settings,
  image upload to Storage (type and size checked server-side).
- Every mutation re-checks the session, validates input, and revalidates only
  the affected paths.

### Blog
`/blog` and `/blog/[slug]`, 5-minute revalidation, per-post metadata and
JSON-LD. Post bodies are rendered as React nodes, never `dangerouslySetInnerHTML`
— a post cannot inject markup into the page.

### Verified
Lint and typecheck clean; 39 routes build. Zero horizontal overflow at ten
widths from 320 to 1440; zero unrevealed sections; zero contrast failures.
Confirmed by request: a quote-only product is rejected from the order API, the
admin is gated, and the public site survives Firestore being unreachable.

### Not verified
No Firebase credentials were supplied, so nothing has run against a real
project: sign-in, the admin claim, Firestore reads/writes, seeding and image
upload are all written but untested end to end. FIREBASE-SETUP.md is the
step-by-step for switching it on.

## Round 4 — mobile responsiveness (no visual change on laptop)

Swept every route at 320 / 360 / 375 / 390 / 414 / 430 / 768 / 1024 / 1280 /
1440px. The earlier passes only checked 390px, which hid real breakage on
smaller phones.

### Fixed
- **Horizontal overflow on six pages at 320–375px** (home, product detail,
  hospitality, custom kits, contact, quote). Two causes:
  - *Grid blowout.* Single-column media queries used `grid-template-columns: 1fr`.
    Grid items default to `min-width: auto`, so the column refused to shrink
    below its content's intrinsic width — on /contact the collapsed column
    computed to 283px inside a 256px container. All 51 `fr` tracks across both
    stylesheets are now `minmax(0, 1fr)`, which is identical wherever content
    already fits.
  - *Long CTA labels.* `.btn` is `white-space: nowrap` with 2.25rem of side
    padding, so "Our Sustainability Commitment →" measured 352px and pushed the
    page sideways. Below 480px those labels may wrap and are capped at 100%.
- **Touch targets.** The hamburger was 24×31px — the primary mobile control.
  Enlarged to 44px, along with footer links, filter tags, breadcrumbs and
  inline action links. Done with an absolutely-positioned `::after` overlay
  rather than padding, so hit areas grow while every element's size and the
  surrounding layout stay exactly as designed. Insets are tuned so neighbouring
  targets never overlap and steal each other's taps.
- **Quantity field** sat 29px tall inside a 44px stepper; now stretches to fill
  the control it already lives in (the input is transparent — nothing looks
  different).

### Verified
- `overflowX = 0` and no element escaping the viewport on all 13 routes at all
  10 widths.
- **The 1440px rendering is pixel-identical before and after** — all 11 pages
  diffed with animations frozen, zero differing pixels. The laptop view is
  untouched, as asked.
- Reveal, contrast, console, cart, filters, search, sort, FAQ, forms and mobile
  nav all re-checked: no regressions.

### Known, left alone
Inline links inside running text ("Privacy Policy" in the form footnote, the
email address in the legal pages) stay at their text height. Expanding them
would overlap the lines above and below and cause mis-taps; WCAG exempts inline
links in sentences for exactly this reason.

## Round 3 — Citrus Grove palette

The approved palette (ink `#14342B`, primary `#0E9F6E`, marigold `#F4A300`,
terracotta `#E2593B`, leaf `#B7D14B`, sand `#FFF6E5`) now drives the whole site.

### How it is wired
The six palette values are stored exactly as `--palette-*` and are what you see
on fills, bands, badges and graphics. Everything that has to be **read** uses a
`--color-*` token derived from them, because the raw palette values are display
colours, not text colours — measured against the sand base they came in at
primary 3.15, terracotta 3.42, marigold 1.94 and leaf 1.60, and white on
marigold is 2.08. Dropping the raw hexes in as text would have produced exactly
the washed-out result we were trying to avoid.

Key derivations:
- `--color-forest: #0B7C55` — one interactive green that passes AA as text on
  every surface (sand 4.86 / beige 4.61 / card 5.09) *and* as a fill under white
  text (5.21). `--palette-primary` stays for hover and bright fills.
- Marigold fills carry **ink** labels (6.48), never white (2.08). The
  announcement bar is now marigold with ink text — the palette's signature.
- `--color-olive-deep` / `--color-gold-deep` / `--color-terracotta-deep` exist
  for the cases where those hues have to be text on a light surface.
- Shadows and overlays re-tinted from the old espresso brown to ink green
  via `--shadow-tint`.

### Changed
- `:root` rebuilt as palette + semantic layers; ~25 hardcoded hexes tokenised
  (badges, status, buttons, error states, WhatsApp mark).
- About's "Our Mission" band is now an ink band (`.band--ink`, reusable). A light
  warm band could not be both distinct from the sand page background and carry
  AA green label text — every candidate measured 1.04–1.10 against sand, i.e.
  invisible as a band. Ink gives 12.58 with sand text and 7.86 for the leaf label.
- Inner-page hero wash warmed from mint to marigold, with a soft green counter-glow.
- Decorative numerals moved to deep marigold (2.03 → 5.63).
- `themeColor` and the Razorpay checkout accent follow the new palette.

### Fixed (found during the pass, pre-existing)
- `.final-cta .btn--light` had an unscoped `margin-inline: auto` that fought the
  flex row and shoved the second CTA button to the far edge on all four CTA
  sections. Now scoped to `:only-child`.
- `RevealOnScroll` gained a scroll/resize safety sweep that force-reveals
  anything the viewport has already passed. Previously, jumping down the page
  (dragging the scrollbar, an in-page `#anchor`, a restored scroll position)
  skipped elements entirely and left them at `opacity: 0` — a dissolved section.

### Verified
Every route at 1440px and 390px on the production build: 0 unrevealed
`[data-reveal]` nodes, 0 horizontal overflow, 0 contrast failures from a sweep
that walks every rendered text node against its real computed background, and no
console errors. Cart, filters, search, sort, FAQ, forms and mobile nav re-tested.
Remaining flagged items are white-text-over-photograph (hero, category cards),
confirmed by eye.

## Round 2 — nav/logo, hero pages, cart & checkout, polish

### Fixed
- **Nav "dissolving" on Hospitality / Custom Kits:** the nav used white-on-transparent text on routes that have no dark hero. Nav colour now follows the page (`body:has([data-hero="dark"])`), so only the home hero uses light text.
- **Logo not visible:** the 1024px square logo was rendered at 70px with `mix-blend-mode: multiply`, which vanished over dark/image heroes. Added a cropped `logo-trim.jpg` (34 KB) shown on its own cream tile in the nav and footer, plus a proper favicon (`app/icon.png`).
- **8 inner pages had no heading/hero at all** (hero blocks were lost in migration → no `<h1>`, content jammed under the nav). New shared `PageHero` gives every page an h1, label, lead and (where available) an image.
- Cart drawer/legacy CSS collision: removed the old static-site `.cart-drawer` rules that fought the new drawer.
- Homepage: featured products were hand-copied cards with dead Add/wishlist buttons and a product (Hotel Welcome Kit) that isn't in the catalogue → now `HomeFeatured` (real data, working tabs). Kit options are real links to /custom-kits.
- Restored the WhatsApp floating button (styles existed, component was lost).

### Cart & checkout (new)
- Product page: quantity + **Add to cart** primary; **Request a bulk quote** + WhatsApp as the secondary path. Cards: **Add** / **View**.
- Cart is client-side (localStorage, cross-tab, SSR-safe), drawer built on native `<dialog>` (focus trap, Esc), `/cart` page, nav badge, mobile sticky buy bar.
- `/checkout`: **Razorpay** when `RAZORPAY_KEY_ID/SECRET` are set — order created server-side with the amount recomputed from the catalogue (client prices ignored), HMAC-SHA256 signature verified server-side with timing-safe compare, verified orders forwarded to `ORDER_WEBHOOK_URL`. Without keys it runs as an honest **"Send order request"** flow (server re-prices, posts to `ENQUIRY_WEBHOOK_URL`).

### Motion / UX
- Page fade-in, hero slow-zoom + staggered copy, staggered card entrance, button press states, product image hover zoom, cart badge pop, drawer slide, animated FAQ. All transform/opacity only; fully disabled under `prefers-reduced-motion`.
- FAQ/legal content aligned with hero copy; anchor offset for fixed nav.

## Round 1 — stabilisation pass

### Critical fixes
- **Content was invisible.** ~50 sections use `data-reveal` (opacity:0) but the original `main.js` that adds `.revealed` was never ported. Added `RevealOnScroll` (IntersectionObserver, route-aware, honours reduced-motion).
- **~70 CSS classes had no styles** (products layout/filters, contact, quote, about, hospitality, custom kits, FAQ, legal, footer grid, page hero). Added `src/app/pages.css` using existing design tokens only — no palette change.
- **Fixed nav overlapped page headings** on inner pages — hero/legal/FAQ now offset for nav + announcement bar.
- **Dead links**: `product-detail.html`, `quote.html`, `privacy.html`, `contact.html`, `/products#slug` etc. now point to real routes.
- **Forms did nothing** (`action="#"`). New shared `EnquiryForm` with validation, labels, error/loading/success states, honeypot, duplicate-submit guard, and `/api/enquiry` with server-side validation.
- **Fonts**: removed render-blocking Google `@import`; self-hosted Manrope + Instrument Serif via `next/font/local`.

### Product system
- Single typed catalogue in `src/lib/products.ts` (was 14 hand-copied cards).
- `/products`: working search, category + material filters, sorting, empty state, mobile filter toggle, `?category=` deep links.
- New dynamic `/products/[slug]` (static params, metadata, JSON-LD, breadcrumb, related products, not-found). Legacy `/product-detail` redirects to `/products`.

### SEO / a11y / quality
- Metadata template + per-page titles/descriptions/canonicals, OG defaults, `sitemap.xml`, `robots.txt`, viewport theme colour.
- Skip link, `<main id>`, visible focus, accessible FAQ accordion (buttons, `aria-expanded`), mobile nav with Escape/inert, real labels.
- `<img>` → `next/image`; `<a>` → `next/link`; unescaped-entity lint errors fixed (0 lint errors/warnings).
- Removed unused `AuthModal` (contained an `alert()` stub and a "Firebase ready" placeholder).

### Intentionally changed / removed
- Dead **Account / Wishlist / Cart** icons and per-card **Add** / wishlist buttons removed — no cart, auth or checkout exists yet. Cards now offer **Enquire** (prefills the quote form) and **View**.
- Removed the "Best For" filter (no product data behind it) and the unverified footer line "Made with sustainable practices."
- Footer social icons only render when `NEXT_PUBLIC_*_URL` is set (they were `href="#"`).

- Removed the homepage testimonials section (named, unverifiable quotes).

### Not done — needs client decisions (see AUDIT.md)
Firebase, admin dashboard, cart/checkout/Razorpay, orders, inventory, real product photography, 8 missing catalogue products.
