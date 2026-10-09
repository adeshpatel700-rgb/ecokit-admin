import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Server-side Firebase. Everything that reads or writes real data goes through
 * here, never through the browser SDK — so Firestore rules can deny all client
 * writes and authorisation is enforced on the server rather than assumed.
 *
 * Credentials come from env. If they are absent the whole app falls back to the
 * built-in catalogue in src/lib/products.ts and keeps working; nothing throws.
 */

const APP = "ecokit-admin";

function readServiceAccount(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel stores the key with literal \n sequences.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

let cached: App | null | undefined;

function app(): App | null {
  if (cached !== undefined) return cached;
  const sa = readServiceAccount();
  if (!sa) {
    cached = null;
    return null;
  }
  try {
    cached = getApps().find((a) => a.name === APP) ?? initializeApp(
      { credential: cert(sa), storageBucket: process.env.FIREBASE_STORAGE_BUCKET },
      APP
    );
  } catch (err) {
    console.error("[firebase] admin init failed", err instanceof Error ? err.message : err);
    cached = null;
  }
  return cached;
}

/** True when server-side Firebase credentials are present and valid. */
export function isFirebaseConfigured(): boolean {
  return app() !== null;
}

export function adminDb(): Firestore | null {
  const a = app();
  return a ? getFirestore(a) : null;
}

export function adminAuth(): Auth | null {
  const a = app();
  return a ? getAuth(a) : null;
}

export function adminBucket() {
  const a = app();
  if (!a || !process.env.FIREBASE_STORAGE_BUCKET) return null;
  return getStorage(a).bucket();
}
