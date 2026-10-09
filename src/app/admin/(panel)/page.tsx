import Link from "next/link";
import { getEnquiries, getPosts, getProducts } from "@/lib/content";
import { isPurchasable } from "@/lib/products";
import { adminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const auth = adminAuth();
  const [products, posts, enquiries, usersResult] = await Promise.all([
    getProducts(), 
    getPosts({ includeDrafts: true }), 
    getEnquiries(5),
    auth ? auth.listUsers() : Promise.resolve({ users: [] })
  ]);
  
  const unpriced = products.filter((p) => !isPurchasable(p)).length;
  const needPhotos = products.filter((p) => p.needsPhoto).length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const userCount = usersResult.users.length;

  const stats = [
    { n: products.length, l: "Products", href: "/admin/products" },
    { n: unpriced, l: "Awaiting a price", href: "/admin/products" },
    { n: needPhotos, l: "Awaiting a photo", href: "/admin/products" },
    { n: posts.length, l: `Blog posts${drafts ? ` (${drafts} draft)` : ""}`, href: "/admin/blog" },
    { n: userCount, l: "Registered Users", href: "#" },
  ];

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin__hint">Everything you can change on the site.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn--primary btn--sm">Add a product</Link>
      </div>

      <div className="admin-grid" style={{ marginBottom: "var(--space-4)" }}>
        {stats.map((s) => (
          <Link key={s.l} href={s.href} className="admin-card">
            <p className="admin-stat__n">{s.n}</p>
            <p className="admin-stat__l">{s.l}</p>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin__head" style={{ marginBottom: "var(--space-2)" }}>
          <h2 style={{ fontSize: "var(--text-lg)" }}>Latest enquiries</h2>
          <Link href="/admin/enquiries" className="btn btn--secondary btn--sm">See all</Link>
        </div>
        {enquiries.length === 0 ? (
          <p className="admin__hint">Nothing yet. Enquiries from the contact and quote forms land here.</p>
        ) : (
          <table className="admin-table">
            <thead><tr><th>When</th><th>Type</th><th>Name</th><th>Email</th></tr></thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td><span className="admin-pill admin-pill--live">{e.kind}</span></td>
                  <td>{e.values.name ?? "—"}</td>
                  <td>{e.values.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
