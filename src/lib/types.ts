import type { CategorySlug, MaterialSlug, Product } from "@/lib/products";

export type { Product, CategorySlug, MaterialSlug };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-ish body. Rendered as paragraphs + headings, not raw HTML. */
  body: string;
  coverImage: string | null;
  coverAlt: string;
  tags: string[];
  status: "draft" | "published";
  /** ISO date string */
  publishedAt: string;
  updatedAt: string;
  author: string;
}

export interface SiteSettings {
  phone: string;
  phoneAlt: string;
  email: string;
  whatsapp: string;
  announcement: string;
  hours: string;
}

export interface EnquiryRecord {
  id: string;
  kind: "contact" | "quote" | "order";
  values: Record<string, string>;
  orderLines?: string;
  orderTotal?: number;
  createdAt: string;
  status: "new" | "read" | "done";
}
