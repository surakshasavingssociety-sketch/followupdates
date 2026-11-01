import "dotenv/config";
import { readJson } from "./lib.mjs";
import { getDb } from "./firebase-admin.mjs";

async function main() {
  const pending = await readJson("data/pending.json", []);
  if (!pending.length) {
    console.log("No pending items to sync.");
    return;
  }

  const db = getDb();
  const existing = await db.collection("pending").get();
  const known = new Map(existing.docs.map((doc) => [doc.id, doc.data()]));

  // Create-only: reviewed entries (approved/rejected) and admin edits are never
  // overwritten by the next day's scrape.
  const missing = pending.filter((job) => !known.has(job.id));
  const legacy = pending.filter((job) => known.has(job.id) && !known.get(job.id).status);

  let written = 0;
  for (let index = 0; index < missing.length; index += 400) {
    const batch = db.batch();
    for (const job of missing.slice(index, index + 400)) {
      batch.set(db.collection("pending").doc(job.id), { ...job, status: "pending" });
      written += 1;
    }
    await batch.commit();
  }

  // One-time patch for docs created before the status field existed.
  for (let index = 0; index < legacy.length; index += 400) {
    const batch = db.batch();
    for (const job of legacy.slice(index, index + 400)) {
      batch.set(db.collection("pending").doc(job.id), { status: "pending" }, { merge: true });
      written += 1;
    }
    await batch.commit();
  }

  console.log(
    `Synced ${written} new pending item(s); ${pending.length - missing.length - legacy.length} already known and left untouched.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  console.error("Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS to sync.");
  process.exitCode = 1;
});
