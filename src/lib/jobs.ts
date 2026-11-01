import fs from "node:fs";
import path from "node:path";
import type { Job } from "./types";

const dataFile = path.join(process.cwd(), "data", "jobs.json");

function loadJobs(): Job[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8")) as Job[];
    return parsed
      .filter((job) => job.status === "published")
      .sort((a, b) => String(b.postDate).localeCompare(String(a.postDate)));
  } catch {
    return [];
  }
}

export const jobs = loadJobs();

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function jobsByCategory(category: string): Job[] {
  return jobs.filter((job) => job.category === category);
}

export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatDateShort(value?: string | null): string {
  return formatDate(value, { day: "2-digit", month: "short" });
}

export function daysLeft(value?: string | null): number | null {
  if (!value) return null;
  const end = new Date(value);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function isNew(value?: string | null): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
}

export function categoryCounts(): Record<string, number> {
  return jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.category] = (acc[job.category] || 0) + 1;
    return acc;
  }, {});
}

export function states(): string[] {
  return [...new Set(jobs.map((job) => job.state).filter(Boolean))].sort();
}

export function qualifications(): string[] {
  return [...new Set(jobs.flatMap((job) => job.qualification || []))].sort();
}
