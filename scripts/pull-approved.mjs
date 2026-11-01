import "dotenv/config";
import { readJson, writeJson } from "./lib.mjs";
import { getDb, toIso } from "./firebase-admin.mjs";

function normalizeJob(id, data) {
  return {
    ...data,
    id,
    slug: data.slug || id,
    status: "published",
    demo: false,
    createdAt: toIso(data.createdAt) || new Date().toISOString(),
    updatedAt: toIso(data.updatedAt) || new Date().toISOString(),
    approvedAt: toIso(data.approvedAt) || null,
  };
}

async function main() {
  const existing = await readJson("data/jobs.json", []);
  const db = getDb();
  const snapshot = await db.collection("jobs").where("status", "==", "published").get();

  if (snapshot.empty) {
    console.log("No approved jobs in Firestore; keeping existing data/jobs.json.");
    return;
  }

  const jobs = snapshot.docs
    .map((doc) => normalizeJob(doc.id, doc.data()))
    .sort((a, b) => String(b.postDate).localeCompare(String(a.postDate)));

  await writeJson("data/jobs.json", jobs);
  console.log(`Pulled ${jobs.length} approved job(s) from Firestore (replaced ${existing.length}).`);
}

main().catch((error) => {
  console.error(error.message);
  console.error("Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS to pull approved jobs.");
  process.exitCode = 1;
});
