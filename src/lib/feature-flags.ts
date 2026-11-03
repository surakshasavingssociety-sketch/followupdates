import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { FeatureFlag } from "./types";

export async function loadFeatureFlags(): Promise<Record<string, FeatureFlag>> {
  const db = getFirebaseDb();
  const result: Record<string, FeatureFlag> = {};
  if (!db) return result;
  try {
    const snapshot = await getDocs(collection(db, "featureFlags"));
    snapshot.docs.forEach((doc) => {
      result[doc.id] = { id: doc.id, ...(doc.data() as Omit<FeatureFlag, "id">) };
    });
  } catch {
    // Feature flags are optional; fail silently.
  }
  return result;
}

export async function isFeatureEnabled(flagId: string): Promise<boolean> {
  const flags = await loadFeatureFlags();
  return Boolean(flags[flagId]?.enabled);
}
