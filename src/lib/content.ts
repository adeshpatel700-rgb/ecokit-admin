import "server-only";
import { cache } from "react";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { products as STATIC_PRODUCTS, type Product } from "@/lib/products";
import type { BlogPost, EnquiryRecord } from "@/lib/types";

/**
 * The single read path for catalogue and blog content.
 *
 * Firestore is the source of truth when it is configured; otherwise the built-in
 * catalogue in src/lib/products.ts is served. That fallback is what keeps the
 * site fully working before Firebase credentials exist, and what keeps it up if
 * Firestore is ever unreachable — a failed read logs and falls back rather than
 * throwing a 500 at a customer.
 *
 * `cache()` dedupes repeat reads inside a single render. Pages set their own
 * `revalidate`, so a published page is served from the Next cache between
 * revalidations rather than hitting Firestore per request.
 */

function toProduct(id: string, d: FirebaseFirestore.DocumentData): Product | null {
  if (typeof d.name !== "string" || typeof d.category !== "string") return null;
  return {
    slug: id,
    name: d.name,
    category: d.category,
    description: typeof d.description === "string" ? d.description : "",
    price: typeof d.price === "number" && d.price > 0 ? d.price : null,
    image: typeof d.image === "string" && d.image ? d.image : `/images/products/${id}.jpg`,
    imageAlt: typeof d.imageAlt === "string" ? d.imageAlt : d.name,
    badge: typeof d.badge === "string" && d.badge ? d.badge : undefined,
    materials: Array.isArray(d.materials) ? d.materials.filter((m: unknown) => typeof m === "string") : [],
    needsPhoto: d.needsPhoto === true,
  } as Product;
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const db = adminDb();
  if (!db) return STATIC_PRODUCTS;
  try {
    const snap = await db.collection("products").where("hidden", "!=", true).get();
    if (snap.empty) return STATIC_PRODUCTS;
    const list = snap.docs
      .map((doc) => toProduct(doc.id, doc.data()))
      .filter((p): p is Product => p !== null);
    return list.length ? list : STATIC_PRODUCTS;
  } catch (err) {
    console.error("[content] products read failed, serving built-in catalogue", err instanceof Error ? err.message : err);
    return STATIC_PRODUCTS;
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
});

/* ── Blog ───────────────────────────────────────────────────────────────── */

function toPost(id: string, d: FirebaseFirestore.DocumentData): BlogPost | null {
  if (typeof d.title !== "string") return null;
  const iso = (v: unknown): string => {
    if (typeof v === "string") return v;
    if (v && typeof v === "object" && "toDate" in v) {
      try { return (v as { toDate(): Date }).toDate().toISOString(); } catch { /* ignore */ }
    }
    return new Date().toISOString();
  };
  return {
    slug: id,
    title: d.title,
    excerpt: typeof d.excerpt === "string" ? d.excerpt : "",
    body: typeof d.body === "string" ? d.body : "",
    coverImage: typeof d.coverImage === "string" && d.coverImage ? d.coverImage : null,
    coverAlt: typeof d.coverAlt === "string" ? d.coverAlt : d.title,
    tags: Array.isArray(d.tags) ? d.tags.filter((t: unknown) => typeof t === "string") : [],
    status: d.status === "published" ? "published" : "draft",
    publishedAt: iso(d.publishedAt),
    updatedAt: iso(d.updatedAt),
    author: typeof d.author === "string" ? d.author : "EcoKit",
  };
}

export const getPosts = cache(async (opts?: { includeDrafts?: boolean }): Promise<BlogPost[]> => {
  const db = adminDb();
  if (!db) return [];
  try {
    const snap = await db.collection("posts").get();
    return snap.docs
      .map((doc) => toPost(doc.id, doc.data()))
      .filter((p): p is BlogPost => p !== null)
      .filter((p) => opts?.includeDrafts || p.status === "published")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } catch (err) {
    console.error("[content] posts read failed", err instanceof Error ? err.message : err);
    return [];
  }
});

export const getPostBySlug = cache(async (slug: string, opts?: { includeDrafts?: boolean }): Promise<BlogPost | null> => {
  const db = adminDb();
  if (!db) return null;
  try {
    const doc = await db.collection("posts").doc(slug).get();
    if (!doc.exists) return null;
    const post = toPost(doc.id, doc.data()!);
    if (!post) return null;
    if (post.status !== "published" && !opts?.includeDrafts) return null;
    return post;
  } catch (err) {
    console.error("[content] post read failed", err instanceof Error ? err.message : err);
    return null;
  }
});

/** True when the blog has anything to show — used to hide empty nav links. */
export async function blogIsLive(): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const posts = await getPosts();
  return posts.length > 0;
}

/* ── Enquiries (admin reads only) ───────────────────────────────────────── */

export async function getEnquiries(limit = 100): Promise<EnquiryRecord[]> {
  const db = adminDb();
  if (!db) return [];
  try {
    const snap = await db.collection("enquiries").orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        kind: d.kind ?? "contact",
        values: d.values ?? {},
        orderLines: d.orderLines,
        orderTotal: d.orderTotal,
        createdAt: typeof d.createdAt === "string" ? d.createdAt : new Date().toISOString(),
        status: d.status ?? "new",
      } as EnquiryRecord;
    });
  } catch (err) {
    console.error("[content] enquiries read failed", err instanceof Error ? err.message : err);
    return [];
  }
}

/** Store an enquiry. Best-effort: never blocks the customer's submission. */
export async function saveEnquiry(record: Omit<EnquiryRecord, "id" | "status">): Promise<void> {
  const db = adminDb();
  if (!db) return;
  try {
    await db.collection("enquiries").add({ ...record, status: "new" });
  } catch (err) {
    console.error("[content] enquiry save failed", err instanceof Error ? err.message : err);
  }
}
