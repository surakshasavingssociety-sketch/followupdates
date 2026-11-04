import fs from "node:fs";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./firebase-admin.mjs";

const command = process.argv[2] || "pick";
const db = getDb();

function setOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  fs.appendFileSync(file, `${name}=${value}\n`);
}

if (command === "pick") {
  const snapshot = await db.collection("automationRuns").where("status", "==", "queued").limit(1).get();
  if (snapshot.empty) {
    console.log("No queued automation run.");
    setOutput("queued", "false");
    process.exit(0);
  }

  const doc = snapshot.docs[0];
  await doc.ref.update({
    status: "running",
    startedAt: new Date().toISOString(),
    serverStartedAt: FieldValue.serverTimestamp(),
  });
  console.log(`Picked run ${doc.id} requested by ${doc.data().requestedBy || "admin"}.`);
  setOutput("queued", "true");
  setOutput("runId", doc.id);
  process.exit(0);
}

if (command === "finish") {
  const runId = process.env.AUTOMATION_RUN_ID;
  if (!runId) {
    console.log("No AUTOMATION_RUN_ID set; nothing to finish.");
    process.exit(0);
  }
  const status = process.env.AUTOMATION_STATUS || "completed";
  await db.collection("automationRuns").doc(runId).update({
    status,
    finishedAt: new Date().toISOString(),
    serverFinishedAt: FieldValue.serverTimestamp(),
    message: process.env.AUTOMATION_MESSAGE || "",
  });
  console.log(`Run ${runId} marked ${status}.`);
  process.exit(0);
}

console.log(`Unknown command "${command}". Use pick or finish.`);
process.exit(1);
