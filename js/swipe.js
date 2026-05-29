import { auth, db } from "./auth.js";
import {
  collection, query, where, getDocs, doc, setDoc,
  getDoc, serverTimestamp, orderBy, limit, startAfter
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Fetch a batch of profiles to swipe ──
export async function fetchProfiles(currentUser, profile, lastDoc = null) {
  const swipedSnap = await getDocs(collection(db, "users", currentUser.uid, "swipes"));
  const swipedUIDs = new Set(swipedSnap.docs.map(d => d.id));
  swipedUIDs.add(currentUser.uid);

  let q = query(
    collection(db, "users"),
    where("status", "==", "active_member"),
    where("banned", "==", false),
    limit(20)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const profiles = [];
  snap.forEach(d => {
    if (!swipedUIDs.has(d.id)) {
      const data = d.data();
      if (profile.interestedIn && profile.interestedIn !== "Everyone") {
        if (profile.interestedIn === "Women" && data.gender !== "Woman") return;
        if (profile.interestedIn === "Men" && data.gender !== "Man") return;
      }
      profiles.push({ id: d.id, ...data, _doc: d });
    }
  });
  return profiles;
}

// ── Record a swipe and check for match ──
export async function recordSwipe(myUID, theirUID, direction) {
  // Save to user subcollection
  await setDoc(doc(db, "users", myUID, "swipes", theirUID), {
    direction, swipedAt: serverTimestamp()
  });

  // Save to top-level swipes_index for reverse lookup ("who liked me")
  await setDoc(doc(db, "swipes_index", `${myUID}_${theirUID}`), {
    myUID,
    theirUID,
    direction,
    swipedAt: serverTimestamp()
  });

  if (direction !== "like" && direction !== "superlike") return false;

  // Check if they liked me back
  const theirSwipe = await getDoc(doc(db, "users", theirUID, "swipes", myUID));
  if (theirSwipe.exists() &&
      (theirSwipe.data().direction === "like" || theirSwipe.data().direction === "superlike")) {
    const matchId = [myUID, theirUID].sort().join("_");
    await setDoc(doc(db, "matches", matchId), {
      users: [myUID, theirUID],
      matchedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: serverTimestamp(),
      [`hasUnread_${myUID}`]: false,
      [`hasUnread_${theirUID}`]: false
    });
    await setDoc(doc(db, "users", myUID, "matches", theirUID), {
      matchId, matchedAt: serverTimestamp()
    });
    await setDoc(doc(db, "users", theirUID, "matches", myUID), {
      matchId, matchedAt: serverTimestamp()
    });
    return true;
  }
  return false;
}
