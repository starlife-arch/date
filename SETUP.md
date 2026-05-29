# DateVault — Complete Setup Guide

---

## STEP 1 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `datevault`
3. Disable Google Analytics (optional) → **Create project**

---

## STEP 2 — Enable Firebase Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Under **Sign-in method** → enable **Email/Password**
3. Save

---

## STEP 3 — Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select your region (e.g. `europe-west1` or `us-central1`)
4. **Enable**

---

## STEP 4 — Get Your Firebase Config

1. Firebase Console → **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** → click **</>** (Web)
3. Register app name: `datevault-web`
4. Copy the `firebaseConfig` object — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "datevault-xxxx.firebaseapp.com",
  projectId: "datevault-xxxx",
  storageBucket: "datevault-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Open `js/firebase.js` in your project and paste these values in.

---

## STEP 5 — Deploy Firestore Security Rules

### Option A — Firebase CLI (recommended)

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

### Option B — Manual in Console

1. Firebase Console → **Firestore** → **Rules** tab
2. Copy the contents of `firestore.rules` and paste → **Publish**
3. Firebase Console → **Firestore** → **Indexes** tab
4. Create each index listed in `firestore.indexes.json` manually

---

## STEP 6 — Create the Admin Account

1. Firebase Console → **Authentication** → **Add user**
2. Enter your admin email + password → **Add user**
3. Copy the **UID** shown
4. Firebase Console → **Firestore** → **Data** tab
5. Click **Start collection** → ID: `users`
6. Click **Add document** → Document ID: paste your UID
7. Add these fields:

| Field | Type | Value |
|---|---|---|
| uid | string | your UID |
| email | string | your admin email |
| role | string | `admin` |
| status | string | `active_member` |
| banned | boolean | `false` |
| memberId | string | `MBR-ADMIN1` |

8. Save. This account now has admin access.

---

## STEP 7 — Set Up Cloudinary (Photo Uploads)

1. Go to https://cloudinary.com → Sign up free
2. Dashboard → copy your **Cloud Name**
3. Go to **Settings** → **Upload** tab
4. Scroll to **Upload presets** → click **Add upload preset**
5. Set **Signing Mode** to `Unsigned`
6. Give it a name like `datevault_uploads`
7. Save preset
8. Open `js/firebase.js` and set:

```js
const CLOUDINARY_CLOUD = "your_cloud_name";
const CLOUDINARY_PRESET = "datevault_uploads";
```

---

## STEP 8 — Set Up Stripe (Card Payments)

1. Go to https://dashboard.stripe.com → Sign up
2. Get your **Publishable key** from the Dashboard (starts with `pk_test_...`)
3. Open `js/firebase.js` and set:

```js
const STRIPE_PUBLIC_KEY = "pk_test_your_key_here";
```

**For production Stripe payments** you need a backend to create PaymentIntents.
Options:
- Use **Firebase Cloud Functions** (recommended)
- Use **Vercel serverless functions**
- Any Node.js/Express backend

The payment.html currently marks paid=true after method selection.
For real charges, replace `activateMembership()` with a call to your backend.

A minimal Cloud Function would be:
```js
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  const stripe = require('stripe')(functions.config().stripe.secret);
  const intent = await stripe.paymentIntents.create({
    amount: 2999, // $29.99 in cents
    currency: 'usd',
    metadata: { uid: context.auth.uid }
  });
  return { clientSecret: intent.client_secret };
});
```

---

## STEP 9 — Set Up Pesapal (M-Pesa / Africa Payments)

1. Go to https://www.pesapal.com → Register as merchant
2. Get your **Consumer Key** and **Consumer Secret**
3. For sandbox testing: https://cybqa.pesapal.com/pesapalv3
4. Pesapal requires a **backend callback URL** for IPN (payment notifications)

For production, use a Cloud Function or backend to:
- Create a Pesapal order
- Redirect user to Pesapal payment page
- Handle IPN callback → update Firestore on success

Pesapal docs: https://developer.pesapal.com

---

## STEP 10 — Deploy to Vercel or Netlify

### Vercel

```bash
npm install -g vercel
vercel login
cd your-project-folder
vercel
```

Follow the prompts. Your site will be live at `https://your-project.vercel.app`

### Netlify

1. Go to https://app.netlify.com
2. Drag and drop your project folder onto the Netlify dashboard
   OR connect your GitHub repo → **Deploy site**

### GitHub Pages

```bash
git init
git add .
git commit -m "Initial DateVault build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/datevault.git
git push -u origin main
```

Then in GitHub repo → **Settings** → **Pages** → Source: `main` branch → Save.

---

## STEP 11 — Final Firestore Indexes

Some queries require composite indexes. When you first run the app,
Firebase will show errors in the browser console with a direct link
to create the needed index. Click the link → **Create index** → done.

Key indexes already in `firestore.indexes.json`:
- `users`: status + banned
- `matches`: users (array) + lastMessageAt
- `swipes_index`: theirUID + direction
- `reports`: status + reportedAt

---

## FILE STRUCTURE

```
/datevault
├── index.html           ← Landing page
├── signup.html          ← Create account
├── login.html           ← Sign in
├── verification.html    ← 3-step verification form
├── status.html          ← Pending/rejected status page
├── invite.html          ← Enter invite code
├── payment.html         ← Stripe / Pesapal payment
├── dashboard.html       ← Swipe deck (main app)
├── explore.html         ← Browse all members
├── likes.html           ← Likes + matches
├── chat.html            ← Messaging (list + window)
├── profile.html         ← My profile + edit
├── admin.html           ← Admin dashboard
├── suspended.html       ← Banned account page
│
├── css/
│   └── style.css        ← All styles
│
├── js/
│   ├── firebase.js      ← Config (edit this first)
│   ├── auth.js          ← Auth + routing logic
│   ├── swipe.js         ← Swipe + match logic
│   ├── chat.js          ← Real-time messaging
│   ├── verification.js  ← Cloudinary uploads
│   ├── admin.js         ← Admin operations
│   └── reports.js       ← (placeholder, logic in admin.js)
│
├── firestore.rules      ← Security rules
├── firestore.indexes.json
├── firebase.json        ← Hosting config
└── SETUP.md             ← This file
```

---

## USER FLOW (How It Works)

```
Sign Up → Verification Form → Admin Reviews
                                    ↓
                    Approve → Invite Code Generated
                                    ↓
                         User Enters Invite Code
                                    ↓
                    Payment (Stripe or Pesapal)
                                    ↓
                         Active Member Access
                    (Swipe · Chat · Explore · Profile)
```

---

## ADMIN CAPABILITIES

| Action | How |
|---|---|
| Approve user | Admin panel → Pending Review → Approve |
| Generate invite code | Auto-generated on approval |
| Reject user | Admin panel → Reject |
| Grant access (bypass all) | Admin panel → Grant Access button |
| Ban user | Admin panel → Ban |
| Unban user | Admin panel → Unban |
| Set expiry | Admin panel → Set Expiry |
| View verification docs | Pending Review → ID photos visible |
| Schedule video call | Admin panel → Video Calls section |
| Resolve reports | Admin panel → Reports section |

---

## QUICK TIPS

- Test on mobile by opening your Vercel/Netlify URL on your phone
- Use Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M) for mobile preview
- Check Firebase Console → Firestore to see data being written in real time
- All photos are stored on Cloudinary — you can manage them in the Cloudinary dashboard
- The admin panel is at `/admin.html` — only accessible to users with `role: "admin"`

