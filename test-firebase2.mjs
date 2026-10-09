import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

async function run() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;

    const privateKey = rawKey?.replace(/\\n/g, "\n");
    
    const app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    }, 'test-app');

    const db = getFirestore(app);
    console.log("Fetching enquiries...");
    const snap = await db.collection("enquiries").orderBy("createdAt", "desc").limit(5).get();
    console.log("Enquiries:", snap.size);
    
    console.log("Fetching posts...");
    const posts = await db.collection("posts").get();
    console.log("Posts:", posts.size);
  } catch(e) {
    console.error("ERROR:", e);
  }
}

run();
