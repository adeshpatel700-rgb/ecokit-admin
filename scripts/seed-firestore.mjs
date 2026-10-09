#!/usr/bin/env node
/**
 * Push the built-in catalogue into Firestore.
 *
 *   node scripts/seed-firestore.mjs            # add products that don't exist yet
 *   node scripts/seed-firestore.mjs --force    # also overwrite existing ones
 *
 * Safe to re-run: without --force it never touches a product you have edited in
 * the admin panel.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env.local", ".env"]) {
  const p = join(ROOT, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail } = process.env;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase credentials — see .env.example.");
  process.exit(1);
}

// Parse the catalogue out of the TypeScript source so there is one source of truth.
const src = readFileSync(join(ROOT, "src/lib/products.ts"), "utf8");
const body = src.slice(src.indexOf("export const products: Product[] = ["), src.indexOf("export const ARCHIVED_PRODUCTS"));
const products = [];
for (const chunk of body.split(/\n  \{/).slice(1)) {
  const get = (k) => (chunk.match(new RegExp(`${k}: "((?:[^"\\\\]|\\\\.)*)"`)) ?? [])[1];
  const slug = get("slug");
  if (!slug) continue;
  const priceM = chunk.match(/price: (null|\d+)/);
  const materials = [...(chunk.match(/materials: \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  products.push({
    slug,
    name: get("name"),
    category: get("category"),
    description: get("description") ?? "",
    price: priceM && priceM[1] !== "null" ? Number(priceM[1]) : null,
    image: `/images/products/${slug}.jpg`,
    imageAlt: get("imageAlt") ?? get("name"),
    badge: get("badge") ?? null,
    materials,
    hidden: false,
    needsPhoto: /needsPhoto: true/.test(chunk),
  });
}

if (products.length === 0) {
  console.error("Parsed 0 products — aborting rather than writing an empty catalogue.");
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();
const force = process.argv.includes("--force");
let added = 0, skipped = 0;

for (const p of products) {
  const ref = db.collection("products").doc(p.slug);
  if (!force && (await ref.get()).exists) { skipped++; continue; }
  await ref.set({ ...p, updatedAt: new Date().toISOString() }, { merge: true });
  added++;
}

console.log(`Seeded ${added} product(s) into ${projectId}.${skipped ? ` Skipped ${skipped} that already existed (use --force to overwrite).` : ""}`);
