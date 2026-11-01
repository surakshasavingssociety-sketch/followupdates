import fs from "node:fs";
import path from "node:path";
import type { Exam, ExamDatabase, ExamPhase, ExamStream } from "./types";

const dataFile = path.join(process.cwd(), "data", "exams.json");

function loadDatabase(): ExamDatabase {
  const empty: ExamDatabase = {
    version: 1,
    updated: "",
    note: "",
    counts: { total: 0, central: 0, state: 0, streams: 0, states: 0 },
    streams: [],
    exams: [],
  };
  try {
    return { ...empty, ...(JSON.parse(fs.readFileSync(dataFile, "utf8")) as ExamDatabase) };
  } catch {
    return empty;
  }
}

export const examDatabase = loadDatabase();
export const exams = examDatabase.exams;
export const examStreams = examDatabase.streams;

export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const PHASES: ExamPhase[] = ["notification", "apply", "exam", "result"];

export const PHASE_META: Record<ExamPhase, { label: string; short: string; tone: string }> = {
  notification: { label: "Notification / apply start", short: "Notification", tone: "blue" },
  apply: { label: "Application window", short: "Apply", tone: "amber" },
  exam: { label: "Exam month", short: "Exam", tone: "violet" },
  result: { label: "Result / answer key", short: "Result", tone: "green" },
};

export function getExam(slug: string): Exam | undefined {
  return exams.find((exam) => exam.slug === slug || exam.id === slug);
}

export function getStream(id: string): ExamStream | undefined {
  return examStreams.find((stream) => stream.id === id);
}

export function examsByStream(streamId: string): Exam[] {
  return exams.filter((exam) => exam.stream === streamId);
}

export function examsByState(stateId: string): Exam[] {
  return exams.filter((exam) => exam.stateId === stateId);
}

export function centralExams(): Exam[] {
  return exams.filter((exam) => exam.scope === "central");
}

export function stateExams(): Exam[] {
  return exams.filter((exam) => exam.scope === "state");
}

export function monthName(month: number): string {
  return MONTHS_SHORT[((month - 1) % 12 + 12) % 12];
}

export function monthLabel(months: number[] = []): string {
  if (!months.length) return "Not published";
  if (months.length === 1) return monthName(months[0]);
  return months.map(monthName).join(" – ");
}

export function hasPhaseInMonth(exam: Exam, phase: ExamPhase, month: number): boolean {
  return (exam.cycle?.[phase] || []).includes(month);
}

export type UpcomingPhase = {
  phase: ExamPhase;
  month: number;
  year: number;
  label: string;
  short: string;
  distance: number;
};

export function nextPhase(exam: Exam, from: Date = new Date()): UpcomingPhase | null {
  const currentMonth = from.getMonth() + 1;
  const currentYear = from.getFullYear();
  let best: UpcomingPhase | null = null;

  PHASES.forEach((phase) => {
    const meta = PHASE_META[phase];
    for (const month of exam.cycle?.[phase] || []) {
      const distance = (month - currentMonth + 12) % 12;
      const year = currentYear + (month < currentMonth ? 1 : 0);
      const candidate: UpcomingPhase = {
        phase,
        month,
        year,
        label: meta.label,
        short: meta.short,
        distance,
      };
      if (
        !best ||
        candidate.distance < best.distance ||
        (candidate.distance === best.distance && PHASES.indexOf(phase) < PHASES.indexOf(best.phase))
      ) {
        best = candidate;
      }
    }
  });

  return best;
}

export function nextPhaseLabel(exam: Exam, from: Date = new Date()): string {
  const next = nextPhase(exam, from);
  if (!next) return "Schedule awaited";
  return `${next.short} · ${monthName(next.month)} ${next.year}`;
}

export function examsInMonth(month: number, phase: ExamPhase, scope?: "central" | "state"): Exam[] {
  return exams.filter((exam) => {
    if (scope && exam.scope !== scope) return false;
    return hasPhaseInMonth(exam, phase, month);
  });
}

export function streamCounts(): Record<string, number> {
  return exams.reduce<Record<string, number>>((acc, exam) => {
    acc[exam.stream] = (acc[exam.stream] || 0) + 1;
    return acc;
  }, {});
}

export function examSearchText(exam: Exam): string {
  return [exam.name, exam.fullName, exam.body, exam.bodyShort, exam.stateName, ...exam.keywords]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function cycleRows(exam: Exam): Array<{ phase: ExamPhase; months: string; note: string }> {
  return PHASES.map((phase) => ({
    phase,
    months: monthLabel(exam.cycle?.[phase]),
    note: PHASE_META[phase].label,
  }));
}
