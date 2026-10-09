"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  const current = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="admin">
      <aside className="admin__side">
        <p className="admin__brand">Eco<span>Kit</span> admin</p>
        <nav className="admin__nav" aria-label="Admin sections">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="admin__link" aria-current={current(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="admin__foot">
          <span>{email}</span>
          <Link href="/" className="admin__link" style={{ padding: "0.4rem 0" }}>View site →</Link>
          <button type="button" className="btn btn--secondary btn--sm" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main id="main" className="admin__main">{children}</main>
    </div>
  );
}
