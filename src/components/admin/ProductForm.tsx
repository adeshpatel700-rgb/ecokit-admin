"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { CATEGORIES, MATERIALS, type Product } from "@/lib/products";
import ImageField from "@/components/admin/ImageField";

export default function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const isNew = product === null;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg(null);
    const res = await saveProduct(new FormData(e.currentTarget));
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Saved. The site is updating now." });
      if (isNew && res.slug) router.replace(`/admin/products/${res.slug}`);
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.message ?? "Could not save." });
    }
  }

  async function onDelete() {
    if (!product) return;
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await deleteProduct(product.slug);
    setBusy(false);
    if (res.ok) router.push("/admin/products");
    else setMsg({ ok: false, text: res.message ?? "Could not delete." });
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {msg && <div role="status" className={`admin-msg admin-msg--${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}

      <div className="row2">
        <label>
          Name
          <input type="text" name="name" defaultValue={product?.name} required maxLength={120} />
        </label>
        <label>
          Slug (web address)
          <input type="text" name="slug" defaultValue={product?.slug} required readOnly={!isNew}
                 pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="bamboo-comb" />
          <span className="hint">{isNew ? "Lowercase words joined by hyphens." : "Fixed once created, so links keep working."}</span>
        </label>
      </div>

      <label>
        Short description
        <textarea name="description" defaultValue={product?.description} maxLength={400} style={{ minHeight: 80 }} />
        <span className="hint">One or two lines. Shown on the product card.</span>
      </label>

      <div className="row2">
        <label>
          Category
          <select name="category" defaultValue={product?.category ?? CATEGORIES[0].slug}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </label>
        <label>
          Price (₹)
          <input type="number" name="price" min={0} step={1} defaultValue={product?.price ?? ""} placeholder="Leave blank" />
          <span className="hint">Blank shows “Price on request” and sends buyers to the quote form.</span>
        </label>
      </div>

      <ImageField name="image" label="Image" folder="products"
                  defaultValue={product?.image}
                  hint="A path under /images/products/, or upload to replace it." />

      <div className="row2">
        <label>
          Image description (alt text)
          <input type="text" name="imageAlt" defaultValue={product?.imageAlt} maxLength={200} />
        </label>
        <label>
          Badge
          <input type="text" name="badge" defaultValue={product?.badge ?? ""} maxLength={40} placeholder="Bestseller" />
          <span className="hint">Optional corner label.</span>
        </label>
      </div>

      <fieldset style={{ border: 0, padding: 0 }}>
        <legend style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "0.4rem" }}>Materials</legend>
        <div className="checks">
          {MATERIALS.map((m) => (
            <label key={m.slug}>
              <input type="checkbox" name="materials" value={m.slug} defaultChecked={product?.materials.includes(m.slug)} />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="checks">
        <label><input type="checkbox" name="needsPhoto" defaultChecked={product?.needsPhoto ?? true} /> Still using a placeholder photo</label>
        <label><input type="checkbox" name="hidden" /> Hide from the site</label>
      </div>

      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Save product"}</button>
        {!isNew && <button type="button" className="cart-line__remove" onClick={onDelete} disabled={busy}>Delete</button>}
      </div>
    </form>
  );
}
