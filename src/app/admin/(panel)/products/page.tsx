import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/content";
import { getCategoryLabel, isPurchasable, priceLabel } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await getProducts();
  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Products</h1>
          <p className="admin__hint">{products.length} products. Leave a price blank to show “Price on request”.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn--primary btn--sm">Add a product</Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Photo</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug}>
                <td><Image className="admin-thumb" src={p.image} alt="" width={44} height={55} /></td>
                <td><strong>{p.name}</strong><br /><span className="admin__hint">{p.slug}</span></td>
                <td>{getCategoryLabel(p.category)}</td>
                <td>
                  {isPurchasable(p)
                    ? priceLabel(p)
                    : <span className="admin-pill admin-pill--quote">On request</span>}
                </td>
                <td>{p.needsPhoto ? <span className="admin-pill admin-pill--draft">Placeholder</span> : <span className="admin-pill admin-pill--live">Real</span>}</td>
                <td><Link href={`/admin/products/${p.slug}`} className="btn btn--secondary btn--sm">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
