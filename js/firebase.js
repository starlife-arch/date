// ── FIREBASE CONFIG ──
// Replace these values with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyAu-jRmUXHvTr63jAiU9EMT4CgHhJdNM70",
  authDomain: "date-ce760.firebaseapp.com",
  projectId: "date-ce760",
  storageBucket: "date-ce760.firebasestorage.app",
  messagingSenderId: "147086773962",
  appId: "1:147086773962:web:4e20b151b6cd7b405cae33",
  measurementId: "G-4BMV27H0MJ"
};

// Cloudinary config
const CLOUDINARY_CLOUD = "YOUR_CLOUDINARY_CLOUD_NAME";
const CLOUDINARY_PRESET = "YOUR_UPLOAD_PRESET"; // unsigned preset

// Stripe config
const STRIPE_PUBLIC_KEY = "YOUR_STRIPE_PUBLIC_KEY";

// Pesapal config
const PESAPAL_CONSUMER_KEY = "YOUR_PESAPAL_KEY";
const PESAPAL_CONSUMER_SECRET = "YOUR_PESAPAL_SECRET";
const PESAPAL_ENV = "sandbox"; // change to "live" for production

// Membership price (USD)
const MEMBERSHIP_PRICE = 29.99;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, CLOUDINARY_CLOUD, CLOUDINARY_PRESET, STRIPE_PUBLIC_KEY, MEMBERSHIP_PRICE };
