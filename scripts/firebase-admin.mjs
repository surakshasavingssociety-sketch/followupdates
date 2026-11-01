import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function credential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.private_key) parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    return cert(parsed);
  }
  return applicationDefault();
}

export function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: credential(),
      projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    });
  }
  return getFirestore();
}

export function toIso(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
