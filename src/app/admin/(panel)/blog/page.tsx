import Link from "next/link";
import { getPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  const posts = await getPosts({ includeDrafts: true });
  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Blog</h1>
          <p className="admin__hint">Drafts stay private until you publish them.</p>
        </div>
        <Link href="/admin/blog/new" className="btn btn--primary btn--sm">Write a post</Link>
      </div>

      <div className="admin-card">
        {posts.length === 0 ? (
          <div className="admin-empty">
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No posts yet</p>
            <p style={{ marginBottom: "1rem" }}>The blog section stays hidden on the site until the first post is published.</p>
            <Link href="/admin/blog/new" className="btn btn--primary">Write the first post</Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug}>
                  <td><strong>{p.title}</strong><br /><span className="admin__hint">{p.slug}</span></td>
                  <td>
                    <span className={`admin-pill admin-pill--${p.status === "published" ? "live" : "draft"}`}>
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td><Link href={`/admin/blog/${p.slug}`} className="btn btn--secondary btn--sm">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
