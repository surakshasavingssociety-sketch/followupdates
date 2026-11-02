import fs from "node:fs";
import path from "node:path";
import type { Institution, InstitutionDatabase, InstitutionType } from "./types";

const dataFile = path.join(process.cwd(), "data", "institutions.json");

const empty: InstitutionDatabase = {
  version: 1,
  updated: "",
  note: "",
  counts: { total: 0, byType: {}, states: 0 },
  types: [],
  institutions: [],
};

function loadDatabase(): InstitutionDatabase {
  try {
    return { ...empty, ...(JSON.parse(fs.readFileSync(dataFile, "utf8")) as InstitutionDatabase) };
  } catch {
    return empty;
  }
}

export const institutionDatabase = loadDatabase();
export const institutions = institutionDatabase.institutions;

export function getInstitution(slug: string): Institution | undefined {
  return institutions.find((item) => item.slug === slug || item.id === slug);
}

export function institutionsByType(type: InstitutionType): Institution[] {
  return institutions.filter((item) => item.type === type);
}

export function institutionsByState(stateId: string): Institution[] {
  return institutions.filter((item) => item.stateId === stateId);
}

export function institutionsByExam(examId: string): Institution[] {
  return institutions.filter((item) => item.exams.includes(examId));
}

export function institutionTypeName(type: string): string {
  return institutionDatabase.types.find((item) => item.id === type)?.typeName || type;
}
