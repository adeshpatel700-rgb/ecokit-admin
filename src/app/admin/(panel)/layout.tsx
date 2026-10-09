import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured()) {
    return (
      <main id="main" className="admin-setup">
        <div className="admin-setup__card">
          <h1>Admin is not connected yet</h1>
          <p>
            The admin panel needs Firebase. Add <code>FIREBASE_PROJECT_ID</code>,{" "}
            <code>FIREBASE_CLIENT_EMAIL</code> and <code>FIREBASE_PRIVATE_KEY</code> to your
            environment, then restart the server.
          </p>
          <p>Until then the public site runs on its built-in catalogue and works normally.</p>
          <p><Link href="/" className="btn btn--primary">Back to the site</Link></p>
        </div>
      </main>
    );
  }
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
