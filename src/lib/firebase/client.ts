"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Browser Firebase — used for ONE thing: signing an admin in so we can hand the
 * resulting ID token to the server, which verifies it and issues a session
 * cookie. No product, order or enquiry data is read or written from the client.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isClientFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId);
}

let cachedApp: FirebaseApp | null = null;

export function clientAuth(): Auth | null {
  if (!isClientFirebaseConfigured()) return null;
  cachedApp ??= getApps().length ? getApp() : initializeApp(config as Required<typeof config>);
  return getAuth(cachedApp);
}
