import type { Job } from "./types";

/**
 * Duplicate detection for government notifications.
 *
 * Notifications are frequently republished under slightly different headlines
 * ("SSC CGL 2026 notification out" vs "SSC CGL 2026 recruitment released") and
 * with tracking parameters on the official link. This module normalises both
 * signals so the admin queue can flag likely duplicates before approval.
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "out",
  "that",
  "the",
  "this",
  "to",
  "was",
  "were",
  "will",
  "with",
  "official",
  "notification",
  "notifications",
  "notice",
  "released",
  "release",
  "published",
  "publish",
  "update",
  "updates",
  "new",
  "now",
  "download",
  "check",
  "here",
]);

const ORG_NOISE = /\b(limited|ltd|pvt|private|corporation|corp|incorporated|inc|company|co)\b/g;

export function normalizeText(value?: string | null): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalUrl(value?: string | null): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    // Tracking parameters never identify a document; keep meaningful ones.
    const keep = new URLSearchParams();
    url.searchParams.forEach((paramValue, key) => {
      if (/^(utm_|fbclid|gclid|ref|source|campaign)/i.test(key)) return;
      keep.append(key, paramValue);
    });
    const search = keep.toString();
    return `${host}${pathname}${search ? `?${search}` : ""}`;
  } catch {
    return normalizeText(raw);
  }
}

export function titleTokens(title?: string | null): Set<string> {
  return new Set(
    normalizeText(title)
      .split(" ")
      .filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
  );
}

export function organizationKey(organization?: string | null): string {
  return normalizeText(organization).replace(ORG_NOISE, " ").replace(/\s+/g, " ").trim();
}

/** 0..1 similarity that tolerates one title adding/removing a few words. */
export function titleSimilarity(a?: string | null, b?: string | null): number {
  const left = titleTokens(a);
  const right = titleTokens(b);
  if (!left.size || !right.size) return 0;

  let intersection = 0;
  left.forEach((token) => {
    if (right.has(token)) intersection += 1;
  });

  const union = left.size + right.size - intersection;
  const jaccard = intersection / union;
  const containment = intersection / Math.min(left.size, right.size);
  return Number((0.45 * jaccard + 0.55 * containment).toFixed(3));
}

function organizationsMatch(a?: string | null, b?: string | null): boolean {
  const left = organizationKey(a);
  const right = organizationKey(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
}

function daysApart(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const left = new Date(a).getTime();
  const right = new Date(b).getTime();
  if (Number.isNaN(left) || Number.isNaN(right)) return null;
  return Math.abs(left - right) / 86_400_000;
}

export type DuplicateMatch = {
  job: Job;
  /** 0..1 confidence that the two entries describe the same notification. */
  score: number;
  reasons: string[];
  /** True when the match is strong enough to warn before publishing. */
  strong: boolean;
};

type DuplicateOptions = {
  /** Minimum score reported. Defaults to 0.6. */
  threshold?: number;
  /** Only compare entries whose post dates are within this many days. */
  maxDaysApart?: number;
};

/**
 * Finds entries that likely describe the same notification.
 *
 * The caller must exclude the job itself (or pass entries that are already
 * filtered); matching by `id` is skipped defensively.
 */
export function findDuplicateJobs(
  job: Pick<Job, "id" | "title" | "organization" | "notificationUrl" | "officialUrl" | "postDate">,
  candidates: Job[],
  options: DuplicateOptions = {},
): DuplicateMatch[] {
  const threshold = options.threshold ?? 0.6;
  const maxDaysApart = options.maxDaysApart ?? 45;
  const jobUrl = canonicalUrl(job.notificationUrl || job.officialUrl);
  const matches: DuplicateMatch[] = [];

  for (const candidate of candidates) {
    if (!candidate || candidate.id === job.id) continue;

    const reasons: string[] = [];
    let score = 0;

    const candidateUrl = canonicalUrl(candidate.notificationUrl || candidate.officialUrl);
    if (jobUrl && candidateUrl && jobUrl === candidateUrl) {
      score = 1;
      reasons.push("Same official notification link");
    } else {
      const similarity = titleSimilarity(job.title, candidate.title);
      const sameOrg = organizationsMatch(job.organization, candidate.organization);
      const gap = daysApart(job.postDate, candidate.postDate);

      if (similarity >= 0.92) {
        score = similarity;
        reasons.push("Near-identical title");
      } else if (sameOrg && similarity >= threshold) {
        score = similarity;
        reasons.push("Similar title from the same organisation");
      }

      if (score > 0 && gap != null && gap > maxDaysApart) {
        score *= 0.7;
        reasons.push(`Posted ${Math.round(gap)} days apart`);
      }
    }

    if (score < threshold) continue;
    matches.push({ job: candidate, score, reasons, strong: score >= 0.75 });
  }

  return matches.sort((a, b) => b.score - a.score);
}

/** Stable key used by ingestion scripts to block exact reposts cheaply. */
export function duplicateKey(job: Pick<Job, "title" | "organization">): string {
  return `${normalizeText(job.title)}|${organizationKey(job.organization)}`;
}
