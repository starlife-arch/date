import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Generate Member ID ──
function genMemberId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "MBR-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// ── Route user based on their status ──
export async function routeUser(user) {
  if (!user) { window.location.href = "login.html"; return; }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) { window.location.href = "verification.html"; return; }
  const data = snap.data();

  if (data.role === "admin") { window.location.href = "admin.html"; return; }
  if (data.banned) { window.location.href = "suspended.html"; return; }

  switch (data.status) {
    case "pending_verification":
    case "pending_admin_review":
      window.location.href = "status.html"; return;
    case "rejected":
      window.location.href = "status.html"; return;
    case "approved_pending_invite":
      window.location.href = "invite.html"; return;
    case "approved_pending_payment":
      window.location.href = "payment.html"; return;
    case "active_member":
      window.location.href = "dashboard.html"; return;
    default:
      window.location.href = "verification.html";
  }
}

// ── Require active member or redirect ──
export async function requireMember() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "login.html"; return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().status !== "active_member" || snap.data().banned) {
        await routeUser(user); return;
      }
      resolve({ user, profile: snap.data() });
    });
  });
}

// ── Require admin ──
export async function requireAdmin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "login.html"; return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        window.location.href = "login.html"; return;
      }
      resolve({ user, profile: snap.data() });
    });
  });
}

// ── Signup ──
export async function signup(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const memberId = genMemberId();
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    memberId,
    email,
    status: "pending_verification",
    role: "user",
    banned: false,
    paid: false,
    createdAt: serverTimestamp(),
    photos: [],
    interests: []
  });
  return cred.user;
}

// ── Login ──
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Logout ──
export async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}

// ── Get current user profile ──
export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export { auth, db, onAuthStateChanged };
