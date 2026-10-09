# Connecting Firebase

The site runs fine without Firebase — it serves the built-in catalogue in
`src/lib/products.ts` and the admin panel shows a "not connected" notice.
These steps switch it over. Nothing in the code changes.

## 1. Create the project

Firebase console → **Add project**. Then enable, from the left sidebar:

- **Build → Firestore Database** → Create database → production mode, region
  `asia-south1` (Mumbai) for the lowest latency in India.
- **Build → Authentication** → Get started → enable **Email/Password**.
- **Build → Storage** → Get started (only needed for uploading images from the
  admin panel).

## 2. Get the two sets of credentials

**Server (secret).** Project settings → **Service accounts** → *Generate new
private key*. You get a JSON file. From it you need `project_id`, `client_email`
and `private_key`.

**Browser (public).** Project settings → **General** → scroll to *Your apps* →
add a Web app if there isn't one → copy the config values.

## 3. Fill in the environment

Copy `.env.example` to `.env.local` and complete the Firebase block:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app

NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:abcdef
```

The private key must stay **in double quotes** with its newlines written as
`\n`. That is the single most common thing to get wrong.

On Vercel, add the same variables under Settings → Environment Variables.

## 4. Publish the security rules

The rules in `firestore.rules` and `storage.rules` make all data **read-only to
the public and unwritable from any browser**. Every write goes through the
server's Admin SDK, which bypasses rules — so authorisation is enforced in the
app, not assumed in the client.

Paste each file's contents into the matching **Rules** tab in the Firebase
console and publish. (Or `firebase deploy --only firestore:rules,storage` if you
use the CLI.)

## 5. Seed the catalogue

```bash
npm run seed            # adds the 18 products; skips any that already exist
npm run seed -- --force # also overwrites existing ones
```

## 6. Create your admin login

1. Firebase console → Authentication → Users → **Add user** (email + password).
2. Grant that account admin rights:

```bash
npm run make-admin -- you@example.com
```

Admin rights are a custom claim only the service account can set, so signing up
on the site can never make someone an admin. To remove access later:

```bash
npm run make-admin -- someone@example.com --revoke
```

3. Go to `/admin/login` and sign in.

## What the admin panel can do

| Section | What you can change |
|---|---|
| Products | Add, edit, delete, hide. Price, category, description, materials, badge, image |
| Blog | Write posts, save as draft, publish, delete |
| Enquiries | Read every contact, quote and order request |
| Settings | Phone numbers, email, WhatsApp, hours, announcement bar |

Leaving a product's price blank shows **"Price on request"** and sends buyers to
the quote form instead of the cart — that is how the eight unpriced products are
handled today.

## How it degrades

| Situation | What visitors see |
|---|---|
| No Firebase configured | Built-in catalogue, blog hidden, admin shows a notice |
| Firestore unreachable | Built-in catalogue; the error is logged, no error page |
| Firestore empty | Built-in catalogue, until you run `npm run seed` |

Enquiries are written to Firestore **and** sent to `ENQUIRY_WEBHOOK_URL` if one
is set. With Firebase connected, a missing webhook is no longer a problem — the
enquiry is still saved.
