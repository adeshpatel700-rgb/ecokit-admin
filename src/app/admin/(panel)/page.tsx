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
    auth ? auth.listUsers().catch((e) => {
      console.error("Auth listUsers failed:", e.message);
      return { users: [], error: String(e.message) };
    }) : Promise.resolve({ users: [] })
  ]);
  
  const userCount = usersResult.users.length;
  const userLabel = (usersResult as any).error 
    ? `Users (Error: ${(usersResult as any).error})`
    : "Registered Users";

  const stats = [
    { n: enquiries.length, l: "Total Enquiries", href: "/admin/enquiries" },
    { n: userCount, l: userLabel, href: "#" },
  ];

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin__hint">Everything you can change on the site.</p>
        </div>
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
