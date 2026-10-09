import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "new";
  const product = isNew ? null : await getProductBySlug(slug);
  if (!isNew && !product) notFound();

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>{isNew ? "Add a product" : product!.name}</h1>
          <p className="admin__hint">{isNew ? "It appears on the site as soon as you save." : `/products/${product!.slug}`}</p>
        </div>
      </div>
      <div className="admin-card">
        <ProductForm product={product} />
      </div>
    </>
  );
}
