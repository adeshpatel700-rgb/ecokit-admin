"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminBucket, adminDb } from "@/lib/firebase/admin";

/**
 * Every mutation in the admin panel. Each one re-verifies the session on the
 * server before touching Firestore — the UI being rendered is never treated as
 * proof of authorisation.
 */

export interface ActionResult { ok: boolean; message?: string; slug?: string; url?: string }

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message: string): ActionResult { return { ok: false, message }; }

function str(form: FormData, key: string, max = 4000): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function guard(): Promise<{ db: FirebaseFirestore.Firestore } | ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return fail("Your session has expired. Please sign in again.");
  }
  const db = adminDb();
  if (!db) return fail("Firebase is not configured on the server.");
  return { db };
}

/* ── Products ───────────────────────────────────────────────────────────── */

export async function saveProduct(form: FormData): Promise<ActionResult> {
  const g = await guard();
  if ("ok" in g) return g;

  const slug = str(form, "slug", 80).toLowerCase();
  if (!SLUG_RE.test(slug)) return fail("Slug must be lowercase words separated by hyphens, e.g. bamboo-comb.");
  const name = str(form, "name", 120);
  if (!name) return fail("Product name is required.");
  const category = str(form, "category", 40);
  if (!category) return fail("Category is required.");

  const rawPrice = str(form, "price", 12);
  let price: number | null = null;
  if (rawPrice !== "") {
    const n = Number(rawPrice);
    if (!Number.isFinite(n) || n < 0) return fail("Price must be a number, or left blank for “Price on request”.");
    price = n > 0 ? Math.round(n) : null;
  }

  const materials = form.getAll("materials").filter((m): m is string => typeof m === "string");

  try {
    await g.db.collection("products").doc(slug).set(
      {
        name,
        category,
        description: str(form, "description", 400),
        price,
        image: str(form, "image", 300) || `/images/products/${slug}.jpg`,
        imageAlt: str(form, "imageAlt", 200) || name,
        badge: str(form, "badge", 40) || null,
        materials,
        hidden: form.get("hidden") === "on",
        needsPhoto: form.get("needsPhoto") === "on",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[admin] saveProduct", err);
    return fail("Could not save the product. Please try again.");
  }

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, slug };
}

export async function deleteProduct(slug: string): Promise<ActionResult> {
  const g = await guard();
  if ("ok" in g) return g;
  if (!SLUG_RE.test(slug)) return fail("Invalid product.");
  try {
    await g.db.collection("products").doc(slug).delete();
  } catch (err) {
    console.error("[admin] deleteProduct", err);
    return fail("Could not delete the product.");
  }
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { ok: true };
}

/* ── Blog ───────────────────────────────────────────────────────────────── */

export async function savePost(form: FormData): Promise<ActionResult> {
  const g = await guard();
  if ("ok" in g) return g;

  const slug = str(form, "slug", 100).toLowerCase();
  if (!SLUG_RE.test(slug)) return fail("Slug must be lowercase words separated by hyphens.");
  const title = str(form, "title", 160);
  if (!title) return fail("Title is required.");
  const body = str(form, "body", 40000);
  if (!body) return fail("The post body is empty.");

  const status = form.get("status") === "published" ? "published" : "draft";
  const tags = str(form, "tags", 200).split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8);
  const now = new Date().toISOString();
  const publishedAt = str(form, "publishedAt", 40) || now;

  try {
    await g.db.collection("posts").doc(slug).set(
      {
        title,
        excerpt: str(form, "excerpt", 320),
        body,
        coverImage: str(form, "coverImage", 300) || null,
        coverAlt: str(form, "coverAlt", 200) || title,
        tags,
        status,
        author: str(form, "author", 80) || "EcoKit",
        publishedAt,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[admin] savePost", err);
    return fail("Could not save the post. Please try again.");
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  return { ok: true, slug };
}

export async function deletePost(slug: string): Promise<ActionResult> {
  const g = await guard();
  if ("ok" in g) return g;
  if (!SLUG_RE.test(slug)) return fail("Invalid post.");
  try {
    await g.db.collection("posts").doc(slug).delete();
  } catch (err) {
    console.error("[admin] deletePost", err);
    return fail("Could not delete the post.");
  }
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok: true };
}

/* ── Settings ───────────────────────────────────────────────────────────── */

export async function saveSettings(form: FormData): Promise<ActionResult> {
  const g = await guard();
  if ("ok" in g) return g;
  try {
    await g.db.collection("settings").doc("site").set(
      {
        phone: str(form, "phone", 40),
        phoneAlt: str(form, "phoneAlt", 40),
        email: str(form, "email", 120),
        whatsapp: str(form, "whatsapp", 40),
        announcement: str(form, "announcement", 160),
        hours: str(form, "hours", 80),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[admin] saveSettings", err);
    return fail("Could not save settings.");
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ── Image upload ───────────────────────────────────────────────────────── */

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadImage(form: FormData): Promise<ActionResult> {
  const g = await guard();
  if ("ok" in g) return g;

  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file was selected.");
  if (!ALLOWED.has(file.type)) return fail("Use a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_BYTES) return fail("That image is larger than 8 MB.");

  const bucket = adminBucket();
  if (!bucket) return fail("Firebase Storage is not configured (set FIREBASE_STORAGE_BUCKET).");

  const folder = str(form, "folder", 40) === "blog" ? "blog" : "products";
  const base = str(form, "name", 80).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") || `img-${Date.now()}`;
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${folder}/${base}-${Date.now().toString(36)}.${ext}`;

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const blob = bucket.file(path);
    await blob.save(buf, { contentType: file.type, resumable: false, metadata: { cacheControl: "public, max-age=31536000, immutable" } });
    await blob.makePublic();
    return { ok: true, url: `https://storage.googleapis.com/${bucket.name}/${path}` };
  } catch (err) {
    console.error("[admin] uploadImage", err);
    return fail("Upload failed. Check the Storage bucket name and permissions.");
  }
}
