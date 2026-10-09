#!/usr/bin/env node
/**
 * Grant admin access to a Firebase Auth user.
 *
 *   node scripts/make-admin.mjs someone@example.com
 *   node scripts/make-admin.mjs someone@example.com --revoke
 *
 * Admin rights live in a custom claim that only the service account can set, so
 * creating an account on the site can never make somebody an admin.
 * Reads credentials from .env.local (or the current environment).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env.local", ".env"]) {
  const p = join(ROOT, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");
if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/make-admin.mjs <email> [--revoke]");
  process.exit(1);
}

const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail } = process.env;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.");
  console.error("Put them in .env.local first — see .env.example.");
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, revoke ? { admin: false } : { admin: true });
  await auth.revokeRefreshTokens(user.uid); // force a fresh sign-in so the claim applies
  console.log(`${revoke ? "Revoked admin from" : "Granted admin to"} ${email} (${user.uid}).`);
  console.log("They must sign out and back in for it to take effect.");
} catch (err) {
  if (err?.code === "auth/user-not-found") {
    console.error(`No Firebase Auth user with the email ${email}.`);
    console.error("Create them first: Firebase console → Authentication → Users → Add user.");
  } else {
    console.error("Failed:", err?.message ?? err);
  }
  process.exit(1);
}
