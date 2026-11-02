import fs from "node:fs";
import path from "node:path";
import type { Scholarship, ScholarshipDatabase } from "./types";

const dataFile = path.join(process.cwd(), "data", "scholarships.json");

const empty: ScholarshipDatabase = {
  version: 1,
  updated: "",
  note: "",
  counts: { total: 0, central: 0, state: 0, states: 0 },
  scholarships: [],
};

function loadDatabase(): ScholarshipDatabase {
  try {
    return { ...empty, ...(JSON.parse(fs.readFileSync(dataFile, "utf8")) as ScholarshipDatabase) };
  } catch {
    return empty;
  }
}

export const scholarshipDatabase = loadDatabase();
export const scholarships = scholarshipDatabase.scholarships;

export function getScholarship(slug: string): Scholarship | undefined {
  return scholarships.find((item) => item.slug === slug || item.id === slug);
}

export function centralScholarships(): Scholarship[] {
  return scholarships.filter((item) => item.scope === "central");
}

export function scholarshipsByState(stateId: string): Scholarship[] {
  return scholarships.filter((item) => item.stateId === stateId);
}

export function scholarshipLevels(): string[] {
  return [...new Set(scholarships.flatMap((item) => item.level))].sort();
}

export function scholarshipCategories(): string[] {
  return [...new Set(scholarships.flatMap((item) => item.categories))].sort();
}
