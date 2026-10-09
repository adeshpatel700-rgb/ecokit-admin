import { NextResponse } from "next/server";
import { createSessionCookie, sessionCookieOptions } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/** Exchange a Firebase ID token for an httpOnly admin session cookie. */
export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ ok: false, message: "Firebase is not configured on the server." }, { status: 503 });
  }
  let idToken: unknown;
  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
  if (typeof idToken !== "string" || idToken.length < 20) {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const session = await createSessionCookie(idToken);
  if (!session) {
    // Deliberately vague: do not reveal whether the account exists or merely lacks the claim.
    return NextResponse.json({ ok: false, message: "This account does not have admin access." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...sessionCookieOptions(), value: session });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
  return res;
}
