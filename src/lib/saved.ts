import { deleteDoc, doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth, getFirebaseDb } from "./firebase";

const LOCAL_KEY = "followexam:saved";

export function getLocalSaved(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function setLocalSaved(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...new Set(ids)]));
}

export function watchUser(callback: (user: User | null) => void) {
  if (!firebaseConfigured) {
    callback(null);
    return () => {};
  }
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function getSavedIds(user: User | null): Promise<string[]> {
  if (!user) return getLocalSaved();
  const db = getFirebaseDb();
  if (!db) return getLocalSaved();
  try {
    const snapshot = await getDocs(collection(db, "users", user.uid, "saved"));
    return snapshot.docs.map((item) => item.id);
  } catch {
    return getLocalSaved();
  }
}

export async function isJobSaved(jobId: string, user: User | null): Promise<boolean> {
  if (!user) return getLocalSaved().includes(jobId);
  const db = getFirebaseDb();
  if (!db) return getLocalSaved().includes(jobId);
  try {
    const snapshot = await getDoc(doc(db, "users", user.uid, "saved", jobId));
    return snapshot.exists();
  } catch {
    return false;
  }
}

export async function toggleJobSaved(jobId: string, user: User | null): Promise<boolean> {
  if (!user) {
    const ids = getLocalSaved();
    const exists = ids.includes(jobId);
    setLocalSaved(exists ? ids.filter((id) => id !== jobId) : [...ids, jobId]);
    return !exists;
  }

  const db = getFirebaseDb();
  if (!db) {
    const ids = getLocalSaved();
    const exists = ids.includes(jobId);
    setLocalSaved(exists ? ids.filter((id) => id !== jobId) : [...ids, jobId]);
    return !exists;
  }

  const reference = doc(db, "users", user.uid, "saved", jobId);
  const snapshot = await getDoc(reference);
  if (snapshot.exists()) {
    await deleteDoc(reference);
    return false;
  }
  await setDoc(reference, { jobId, savedAt: new Date().toISOString() });
  return true;
}
