# Setup & Deployment Guide — WPU SF-12 Portal

Step-by-step guide to get this project running locally and deployed to production.

---

## 1. Prerequisites

- Node.js 18+ and npm
- A Google account (for Firebase + Apps Script)
- Git

---

## 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Name it (e.g. `wpu-sf12-portal`) and finish creation (Analytics optional).
3. In the left sidebar, go to **Build → Firestore Database → Create database**.
   - Start in **production mode**.
   - Pick a region close to your users (e.g. `asia-southeast1`).
4. Get **client config** (public, used by the browser):
   - **Project Settings (gear icon) → General → Your apps → Web app** (`</>` icon).
   - Register app (no hosting needed).
   - Copy the `firebaseConfig` values into:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Get **Admin SDK credentials** (server-side only):
   - **Project Settings → Service Accounts → Generate new private key**.
   - Downloads a JSON file. From it, copy:
     - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
     - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the `\n` escapes as-is, wrap in quotes)

> Never commit the service account JSON or `.env.local` to git.

### Firestore Security Rules

Since all reads/writes go through server-side API routes (Admin SDK bypasses
rules), lock the collection down to deny direct client access:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 3. Google Apps Script (Sheets export) Setup

1. Create a new Google Sheet (e.g. "WPU SF-12 Responses").
2. **Extensions → Apps Script**.
3. Delete the default code, paste the contents of `gas/Code.gs`.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the requested permissions.
6. Copy the **Web app URL** → `GAS_WEBHOOK_URL`.

Every submission writes a header row (once) plus one row per response with
PCS/MCS scores and band interpretations.

---

## 4. Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Fill in all values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GAS_WEBHOOK_URL=

DASHBOARD_PASSWORD=choose-a-strong-password
```

`DASHBOARD_PASSWORD` doubles as the HMAC signing secret for the dashboard
session cookie — pick something long and random.

---

## 5. Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

- `/` — landing page
- `/assessment` — 12-step SF-12 questionnaire
- `/results` — score results (after submitting)
- `/dashboard` — admin dashboard (redirects to `/dashboard/login` if no session)

### Sanity checks

- `npm run build` — verifies TypeScript + lint pass.
- On dev server start, `lib/sf12Scoring.ts` runs a self-test in the console.
  No `[sf12Scoring self-test] FAILED` line should appear.

---

## 6. Deployment — Vercel (recommended)

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add **all** variables from `.env.local` under **Settings → Environment Variables**
   (Production, and Preview if you want previews to work):
   - All `NEXT_PUBLIC_FIREBASE_*`
   - `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
   - `GAS_WEBHOOK_URL`
   - `DASHBOARD_PASSWORD`
5. Deploy.

For `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel's UI, paste the key including the
literal `\n` sequences (Vercel preserves them as a single env var string —
`lib/firebaseAdmin.ts` converts `\n` to real newlines at runtime).

---

## 7. Deployment — Firebase Hosting (alternative)

1. `npm install -g firebase-tools`
2. `firebase login`
3. `firebase init hosting` → select **web frameworks (Next.js)** experience, or
   use `firebase deploy` with the Next.js adapter per
   [Firebase's Next.js guide](https://firebase.google.com/docs/hosting/frameworks/nextjs).
4. Set the same environment variables via:
   ```bash
   firebase apphosting:secrets:set DASHBOARD_PASSWORD
   firebase apphosting:secrets:set FIREBASE_ADMIN_PRIVATE_KEY
   # ...etc for each secret
   ```

---

## 8. Post-Deployment Checklist

- [ ] Visit `/assessment`, complete all 12 questions, submit — confirm a row
      appears in Firestore (`sf12_responses` collection) and in the Google Sheet.
- [ ] Visit `/dashboard/login`, sign in with `DASHBOARD_PASSWORD`.
- [ ] Confirm KPI cards, charts, and the responses table populate.
- [ ] Test **Export CSV** and **Export PDF** buttons.
- [ ] Confirm `/dashboard` and `/api/dashboard/*`/`/api/export/*` redirect/401
      when not logged in (open in incognito).
- [ ] Confirm `FIREBASE_ADMIN_PRIVATE_KEY` and `DASHBOARD_PASSWORD` are **not**
      present in any client-side bundle (search built `_next/static` output).
