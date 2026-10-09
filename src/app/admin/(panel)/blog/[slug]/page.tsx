import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import { getPostBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "new";
  const post = isNew ? null : await getPostBySlug(slug, { includeDrafts: true });
  if (!isNew && !post) notFound();

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>{isNew ? "New post" : post!.title}</h1>
          {!isNew && <p className="admin__hint">/blog/{post!.slug}</p>}
        </div>
      </div>
      <div className="admin-card"><PostForm post={post} /></div>
    </>
  );
}
