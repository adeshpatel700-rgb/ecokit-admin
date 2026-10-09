import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const isConfigured = isFirebaseConfigured();
  const user = await getAdminUser();
  if (isConfigured && user) redirect("/admin");
  return (
    <main id="main" className="admin-login">
      <div className="admin-login__card">
        <h1>EcoKit admin</h1>
        <p className="admin__hint" style={{ marginBottom: "var(--space-4)" }}>Sign in to view site analytics and manage enquiries.</p>
        <AdminLoginForm configured={isConfigured} />
      </div>
    </main>
  );
}
