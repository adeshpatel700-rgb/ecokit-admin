# EcoKit

Premium eco-friendly hospitality and personal-care products — marketing site,
product catalogue, cart and enquiry/quote flows.

Next.js (App Router) · React · TypeScript · deployed on Vercel.

## Run it locally

**Windows — just double-click a file in the `ecokit` folder:**

| File | What it does |
|---|---|
| `run.bat` | Dev server with hot reload, opens your browser. **Use this one day to day.** |
| `run-production.bat` | Builds the real production bundle and serves that — what Vercel will show. |
| `run-on-phone.bat` | Same as `run.bat` but also prints an address you can open on your phone (same Wi-Fi). |

First run installs dependencies and takes a few minutes. After that it starts in
a second or two. Press `Ctrl+C` in the black window to stop the server.

**macOS / Linux:** `./run.sh`, `./run.sh --prod`, `./run.sh --lan`

**From a terminal, inside `ecokit-next/`:**

```bash
npm run dev:open     # dev server + open browser
npm run preview      # production build + serve + open browser
npm run dev          # plain Next.js dev server, no browser
npm run build        # production build only
npm run lint         # ESLint
```

The launcher installs dependencies if they're missing, picks the next free port
if 3000 is taken, waits until the server actually answers before opening the
browser, and shuts down cleanly on `Ctrl+C`. Flags: `--port=4000`, `--no-open`,
`--lan`, `--prod`.

Requires **Node.js 20 or newer** (get the LTS build from <https://nodejs.org>).

## Configuration

Copy `.env.example` to `.env.local` and fill in what you need:

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, structured data |
| `ENQUIRY_WEBHOOK_URL` | Where contact / quote / order-request submissions are delivered |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Online card payments at checkout |
| `ORDER_WEBHOOK_URL` | Where verified paid orders are sent |
| `NEXT_PUBLIC_INSTAGRAM_URL` etc. | Footer social icons (hidden when unset) |

Without Razorpay keys, checkout runs as an **order request** flow instead of
taking payment — it never pretends a payment succeeded.

## Where things live

```
src/app/            routes (App Router)
  globals.css       design tokens + component styles
  pages.css         page-level styles added after the migration
src/components/     UI components
src/lib/
  products.ts       the product catalogue (single source of truth)
  enquiry.ts        form definitions + shared validation
  order.ts          server-side cart pricing
  razorpay.ts       payment helpers (server only)
scripts/dev-open.mjs  the local launcher
```

## Colour

The approved **Citrus Grove** palette lives in `globals.css` as `--palette-*`
(exact brand values). Anything that has to be *read* uses a derived `--color-*`
token, because the raw palette values do not meet contrast requirements as text.
If the palette changes, edit `--palette-*` and re-check contrast — don't point
text tokens straight at palette values. See `CHANGELOG.md` for the reasoning.

## Project docs

- `AUDIT.md` — findings, what's still open, and what needs client input
- `CHANGELOG.md` — what changed and why
