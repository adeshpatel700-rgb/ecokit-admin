import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content";
import { products } from "@/lib/products";
import { SITE } from "@/lib/site";

const STATIC_ROUTES = ["", "/products", "/hospitality", "/custom-kits", "/about", "/contact", "/quote", "/faq", "/blog", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPosts();
  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${SITE.url}${path}`, lastModified: now, priority: path === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${SITE.url}/products/${p.slug}`, lastModified: now, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: new Date(p.updatedAt), priority: 0.5 })),
  ];
}
