/**
 * Lightweight regression tests for the shared duplicate-detection and
 * scheduled-publishing rules.
 *
 * Run with: npm run test:core
 */
import assert from "node:assert/strict";
import {
  canonicalUrl,
  duplicateKey,
  findDuplicateJobs,
  titleSimilarity,
} from "../src/lib/duplicates.ts";
import { isJobVisible } from "../src/lib/jobs.ts";

const base = {
  id: "job-1",
  slug: "ssc-cgl-2026",
  title: "SSC CGL 2026 Notification Out",
  organization: "Staff Selection Commission (SSC)",
  category: "Latest Jobs",
  state: "All India",
  qualification: ["Graduate"],
  postDate: "2026-01-05",
  summary: "Summary",
  officialUrl: "https://ssc.gov.in",
  notificationUrl: "https://ssc.gov.in/notice/123?utm_source=newsletter",
  sourceName: "SSC",
  status: "published",
  createdAt: "2026-01-05T00:00:00.000Z",
  updatedAt: "2026-01-05T00:00:00.000Z",
};

// 1. Tracking parameters must not hide an identical notification link.
assert.equal(
  canonicalUrl("https://www.ssc.gov.in/notice/123/?utm_source=x#top"),
  canonicalUrl("https://ssc.gov.in/notice/123"),
);

const urlDuplicate = findDuplicateJobs(base, [
  { ...base, id: "job-2", title: "Different headline", notificationUrl: "https://ssc.gov.in/notice/123" },
]);
assert.equal(urlDuplicate.length, 1, "same notification link should be detected");
assert.equal(urlDuplicate[0].score, 1);
assert.equal(urlDuplicate[0].strong, true);

// 2. Fuzzy headline from the same organisation.
const fuzzyDuplicate = findDuplicateJobs(base, [
  { ...base, id: "job-3", title: "SSC CGL 2026 recruitment released", notificationUrl: "https://ssc.gov.in/other" },
]);
assert.equal(fuzzyDuplicate.length, 1, "near-identical title should be detected");
assert.ok(titleSimilarity(base.title, "SSC CGL 2026 recruitment released") > 0.8);

// 3. Unrelated notifications are not flagged.
const unrelated = findDuplicateJobs(base, [
  { ...base, id: "job-4", title: "UPSC Civil Services 2026 notification", organization: "UPSC", notificationUrl: "https://upsc.gov.in/x" },
]);
assert.equal(unrelated.length, 0);

// 4. The key is stable across casing and punctuation.
assert.equal(
  duplicateKey({ title: "SSC CGL 2026 – Notification!", organization: "Staff Selection Commission" }),
  duplicateKey({ title: "ssc cgl 2026 notification", organization: "staff selection commission" }),
);

// 5. Scheduled publishing rules.
const now = Date.parse("2026-06-01T12:00:00.000Z");
assert.equal(isJobVisible({ ...base, status: "published" }, now), true);
assert.equal(isJobVisible({ ...base, status: "published", publishAt: "2026-06-02T00:00:00.000Z" }, now), false);
assert.equal(isJobVisible({ ...base, status: "scheduled", publishAt: "2026-05-31T00:00:00.000Z" }, now), true);
assert.equal(isJobVisible({ ...base, status: "scheduled", publishAt: "2026-06-02T00:00:00.000Z" }, now), false);
assert.equal(isJobVisible({ ...base, status: "scheduled", publishAt: null }, now), false);
assert.equal(isJobVisible({ ...base, status: "draft" }, now), false);
assert.equal(isJobVisible({ ...base, status: "archived" }, now), false);

console.log("✓ duplicate detection + scheduled publishing tests passed");
