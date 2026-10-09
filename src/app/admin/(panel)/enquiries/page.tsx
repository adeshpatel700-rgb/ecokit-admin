import { getEnquiries } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminEnquiries() {
  const enquiries = await getEnquiries(200);
  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Enquiries</h1>
          <p className="admin__hint">Contact, quote and order requests from the site.</p>
        </div>
      </div>
      <div className="admin-card">
        {enquiries.length === 0 ? (
          <div className="admin-empty">
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No enquiries yet</p>
            <p>Submissions appear here once Firebase is connected.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>When</th><th>Type</th><th>From</th><th>Details</th></tr></thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td><span className="admin-pill admin-pill--live">{e.kind}</span></td>
                  <td>
                    <strong>{e.values.name ?? "—"}</strong><br />
                    <span className="admin__hint">{e.values.email ?? ""} {e.values.phone ?? ""}</span>
                  </td>
                  <td style={{ maxWidth: 420 }}>
                    {e.values.business && <div><strong>{e.values.business}</strong></div>}
                    {e.orderLines && <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem", margin: "0.25rem 0" }}>{e.orderLines}</pre>}
                    {e.values.message && <div className="admin__hint">{e.values.message}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
