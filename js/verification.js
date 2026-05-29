import { auth, db, onAuthStateChanged } from "./auth.js";
import { CLOUDINARY_CLOUD, CLOUDINARY_PRESET } from "./firebase.js";
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Upload file to Cloudinary ──
export async function uploadToCloudinary(file, folder = "datevault") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  fd.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST", body: fd
  });
  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  throw new Error("Upload failed: " + JSON.stringify(data));
}

// ── Save verification data to Firestore ──
export async function submitVerification(uid, verificationData) {
  await updateDoc(doc(db, "users", uid), {
    ...verificationData,
    status: "pending_admin_review",
    verificationSubmittedAt: serverTimestamp()
  });
}
