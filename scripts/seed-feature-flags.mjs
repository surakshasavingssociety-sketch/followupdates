import "dotenv/config";
import { readJson, writeJson } from "./lib.mjs";
import { getDb } from "./firebase-admin.mjs";

const defaults = [
  { id: "cloud_functions", name: "Cloud Functions", enabled: false, configStatus: "needs_setup", requiredService: "Firebase Blaze", dependencyStatus: "blocked", estimatedCost: "Blaze usage-based" },
  { id: "scheduled_automation", name: "Scheduled Automation", enabled: false, configStatus: "needs_setup", requiredService: "Firebase Blaze", dependencyStatus: "blocked", estimatedCost: "Blaze usage-based" },
  { id: "advanced_ai_processing", name: "Advanced AI Processing", enabled: false, configStatus: "needs_setup", requiredService: "External AI API", dependencyStatus: "pending", estimatedCost: "Per-token API cost" },
  { id: "video_generation", name: "30-second Video Generator", enabled: false, configStatus: "needs_setup", requiredService: "Media processing", dependencyStatus: "pending", estimatedCost: "Compute cost" },
  { id: "automated_social_publishing", name: "Automated Social Publishing", enabled: false, configStatus: "needs_setup", requiredService: "Platform APIs", dependencyStatus: "pending", estimatedCost: "API quota" },
  { id: "advanced_storage", name: "Advanced Storage Operations", enabled: false, configStatus: "needs_setup", requiredService: "Firebase Blaze", dependencyStatus: "blocked", estimatedCost: "Blaze usage-based" },
  { id: "payment_gateway", name: "Payment Gateway", enabled: false, configStatus: "needs_setup", requiredService: "Razorpay/Cashfree/PayU", dependencyStatus: "pending", estimatedCost: "Gateway fees" },
  { id: "feature_flags_runtime", name: "Runtime Feature Flags", enabled: true, configStatus: "configured", requiredService: "Firestore", dependencyStatus: "ready", estimatedCost: "Included" },
];

async function main() {
  const db = getDb();
  if (!db) {
    console.error("Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.");
    process.exitCode = 1;
    return;
  }
  const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase-admin/firestore");
  let created = 0;
  for (const flag of defaults) {
    const ref = doc(db, "featureFlags", flag.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { ...flag, updatedAt: new Date().toISOString(), serverUpdatedAt: serverTimestamp() });
      created++;
    }
  }
  console.log(`Seeded ${created} new feature flag(s) (${defaults.length - created} already existed).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
