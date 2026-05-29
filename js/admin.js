import { db } from "./auth.js";
import {
  collection, getDocs, doc, updateDoc, query,
  where, serverTimestamp, addDoc, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Generate invite code ──
export function genInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "INV-";
  for (let i = 0; i < 7; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Approve user: generate invite code and update status ──
export async function approveUser(uid) {
  const code = genInviteCode();
  await updateDoc(doc(db, "users", uid), {
    status: "approved_pending_invite",
    inviteCode: code,
    inviteUsed: false,
    approvedAt: serverTimestamp()
  });
  return code;
}

// ── Reject user ──
export async function rejectUser(uid, reason = "") {
  await updateDoc(doc(db, "users", uid), {
    status: "rejected",
    rejectionReason: reason,
    rejectedAt: serverTimestamp()
  });
}

// ── Ban / Unban ──
export async function banUser(uid) {
  await updateDoc(doc(db, "users", uid), { banned: true, bannedAt: serverTimestamp() });
}
export async function unbanUser(uid) {
  await updateDoc(doc(db, "users", uid), { banned: false });
}

// ── Manual override: grant active member ──
export async function grantAccess(uid) {
  await updateDoc(doc(db, "users", uid), {
    status: "active_member",
    paid: true,
    adminOverride: true,
    activatedAt: serverTimestamp()
  });
}

// ── Set account expiry ──
export async function setExpiry(uid, expiryDate) {
  await updateDoc(doc(db, "users", uid), { accessExpiry: expiryDate });
}

// ── Fetch all users ──
export async function fetchAllUsers() {
  const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Fetch reports ──
export async function fetchReports() {
  const snap = await getDocs(query(collection(db, "reports"), where("status","==","pending"), orderBy("reportedAt","desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Fetch verification calls ──
export async function fetchVerificationCalls() {
  const snap = await getDocs(query(collection(db, "verification_calls"), orderBy("requestedAt","desc"), limit(50)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Schedule a verification call ──
export async function scheduleCall(uid, meetLink, dateTime, contactMethod) {
  await addDoc(collection(db, "verification_calls"), {
    uid, meetLink, dateTime, contactMethod,
    status: "scheduled",
    scheduledAt: serverTimestamp()
  });
}

// ── Resolve report ──
export async function resolveReport(reportId) {
  await updateDoc(doc(db, "reports", reportId), { status: "resolved", resolvedAt: serverTimestamp() });
}
