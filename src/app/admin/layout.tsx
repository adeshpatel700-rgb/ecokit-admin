import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Shared chrome-free shell. The auth gate lives in (panel)/layout.tsx so that
 *  /admin/login can render without a session. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
