import "dotenv/config";
import { readJson } from "./lib.mjs";
import { getDb } from "./firebase-admin.mjs";

const MAX_AGE_DAYS = Number(process.env.MAX_AGE_DAYS || 30);

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

  // Remove unreviewed entries that are older than the discovery window so the
  // admin queue stays focused on current notifications. Approved and rejected
  // entries are kept as a review history.
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString().slice(0, 10);
  const stale = existing.docs.filter((doc) => {
    const data = doc.data();
    const status = data.status || "pending";
    const postDate = String(data.postDate || "").slice(0, 10);
    return status === "pending" && postDate && postDate < cutoff;
  });

  for (let index = 0; index < stale.length; index += 400) {
    const batch = db.batch();
    for (const doc of stale.slice(index, index + 400)) batch.delete(doc.ref);
    await batch.commit();
  }

  console.log(
    `Synced ${written} new pending item(s); ${pending.length - missing.length - legacy.length} already known and left untouched.`,
  );
  console.log(`Removed ${stale.length} stale pending item(s) older than ${cutoff}.`);
}

main().catch((error) => {
  console.error(error.message);
  console.error("Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS to sync.");
  process.exitCode = 1;
});
