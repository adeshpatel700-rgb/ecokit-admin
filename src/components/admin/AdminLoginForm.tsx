"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clientAuth, isClientFirebaseConfigured } from "@/lib/firebase/client";

export default function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!configured || !isClientFirebaseConfigured()) {
    return (
      <div className="admin-msg admin-msg--err">
        Firebase is not configured. Add the <code>NEXT_PUBLIC_FIREBASE_*</code> and{" "}
        <code>FIREBASE_*</code> variables to your environment, then restart.
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const auth = clientAuth();
      if (!auth) throw new Error("Firebase is not available in this browser session.");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken();

      // The server verifies the token and the admin claim before issuing a cookie.
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      await auth.signOut(); // the session cookie is the credential from here on
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Could not sign you in.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(
        code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")
          ? "That email and password don't match an account."
          : code.includes("too-many-requests")
            ? "Too many attempts. Wait a minute and try again."
            : err instanceof Error ? err.message : "Could not sign you in."
      );
      setBusy(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit} noValidate>
      {error && <div role="alert" className="admin-msg admin-msg--err">{error}</div>}
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </label>
      <button type="submit" className="btn btn--primary btn--lg" disabled={busy} style={{ justifyContent: "center" }}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
