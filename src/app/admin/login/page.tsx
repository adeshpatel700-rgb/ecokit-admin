import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (isFirebaseConfigured() && (await getAdminUser())) redirect("/admin");
  return (
    <main id="main" className="admin-login">
      <div className="admin-login__card">
        <h1>EcoKit admin</h1>
        <p className="admin__hint" style={{ marginBottom: "var(--space-4)" }}>Sign in to manage products and posts.</p>
        <AdminLoginForm configured={isFirebaseConfigured()} />
      </div>
    </main>
  );
}
