import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

/**
 * Admin authentication.
 *
 * Flow: the browser signs in with Firebase Auth and posts the resulting ID token
 * to /api/admin/session. The server verifies that token, checks for an `admin`
 * custom claim, and issues an httpOnly session cookie. Every admin page and
 * mutation re-verifies that cookie on the server.
 *
 * The `admin` claim can only be granted out-of-band with the service account
 * (scripts/make-admin.mjs) — signing up never makes someone an admin, and the
 * browser cannot grant it to itself.
 */

export const SESSION_COOKIE = "ecokit_admin_session";
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export interface AdminUser {
  uid: string;
  email: string;
}

/** Verifies an ID token and returns a session cookie, or null if not an admin. */
export async function createSessionCookie(idToken: string): Promise<string | null> {
  const auth = adminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifyIdToken(idToken, true);
    if (decoded.admin !== true) {
      console.warn("[auth] sign-in refused — no admin claim:", decoded.email);
      return null;
    }
    return await auth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });
  } catch (err) {
    console.error("[auth] token verification failed", err instanceof Error ? err.message : err);
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: FIVE_DAYS_MS / 1000,
  };
}

/** The signed-in admin, or null. Safe to call when Firebase is not configured. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const auth = adminAuth();
  if (!auth) return null;
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    const decoded = await auth.verifySessionCookie(session, true);
    if (decoded.admin !== true) return null;
    return { uid: decoded.uid, email: decoded.email ?? "" };
  } catch {
    return null; // expired or revoked
  }
}

/** Throws if the caller is not an admin. Use at the top of every mutation. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("UNAUTHORISED");
  return user;
}
