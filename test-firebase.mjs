import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

async function run() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    console.log("ProjectId:", projectId);
    console.log("ClientEmail:", clientEmail);
    console.log("Raw Key exists:", !!rawKey);
    console.log("Raw Key length:", rawKey?.length);

    const privateKey = rawKey?.replace(/\\n/g, "\n");
    
    console.log("Key parsed ok. Last 10 chars:", privateKey?.slice(-10));
    
    const app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    }, 'test-app');

    const auth = getAuth(app);
    console.log("Fetching users...");
    const users = await auth.listUsers();
    console.log("Users:", users.users.length);
    
    console.log("Fetching products...");
    const db = getFirestore(app);
    const snap = await db.collection("products").get();
    console.log("Products:", snap.size);
    
  } catch(e) {
    console.error("ERROR:", e);
  }
}

run();
