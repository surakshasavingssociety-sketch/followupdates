import { readJson, writeJson } from "./lib.mjs";

const jobs = await readJson("data/jobs.json", []);
const real = jobs.filter((job) => job.demo !== true);
const removed = jobs.length - real.length;

if (!removed) {
  console.log("No demo entries found. Nothing to remove.");
} else {
  await writeJson("data/jobs.json", real);
  console.log(`Removed ${removed} demo entr${removed === 1 ? "y" : "ies"}. ${real.length} real job(s) left.`);
  console.log("Ab `npm run validate && npm run build` chalayein.");
}
