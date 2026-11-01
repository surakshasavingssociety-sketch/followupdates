export const CATEGORIES = [
  "Latest Jobs",
  "Results",
  "Admit Card",
  "Answer Key",
  "Exam Date",
  "Admission",
  "Syllabus",
  "Scholarship",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type FeeDetails = {
  general?: number;
  obc?: number;
  scSt?: number;
  female?: number;
  paymentMode?: string;
};

export type AgeLimit = {
  min?: number;
  max?: number;
  note?: string;
};

export type Job = {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: Category;
  state: string;
  qualification: string[];
  vacancies?: number | null;
  postDate: string;
  applyStart?: string | null;
  applyEnd?: string | null;
  examDate?: string | null;
  fee?: FeeDetails;
  age?: AgeLimit;
  salary?: string;
  summary: string;
  officialUrl: string;
  notificationUrl?: string;
  sourceName: string;
  sourceUrl?: string;
  status: "published" | "pending" | "rejected";
  featured?: boolean;
  demo?: boolean;
  examId?: string | null;
  examName?: string | null;
  examStream?: string | null;
  examScope?: "central" | "state" | null;
  stateId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PendingJob = Job & {
  status: "pending";
  discoveredAt: string;
  discoveryUrl?: string;
  rawTitle?: string;
};

export type ExamPhase = "notification" | "apply" | "exam" | "result";

export type ExamCycle = Record<ExamPhase, number[]>;

export type Exam = {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  stream: string;
  streamName: string;
  streamIcon: string;
  scope: "central" | "state";
  stateId: string | null;
  stateName: string | null;
  region: string;
  body: string;
  bodyShort: string;
  level: string;
  qualification: string[];
  age: string;
  officialUrl: string;
  frequency: string;
  aliases: string[];
  cycle: ExamCycle;
  cycleNote: string;
  keywords: string[];
  searchTerms: string[];
  verified: boolean;
};

export type ExamStream = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type ExamDatabase = {
  version: number;
  updated: string;
  note: string;
  counts: {
    total: number;
    central: number;
    state: number;
    streams: number;
    states: number;
  };
  streams: ExamStream[];
  exams: Exam[];
};

export type StateBody = [string, string, string];

export type StateInfo = {
  id: string;
  name: string;
  type: "state" | "ut";
  capital: string;
  region: string;
  portal: string;
  psc: StateBody | null;
  police: StateBody | null;
  board: StateBody | null;
  labels: Record<string, string>;
  cycle?: Record<string, Partial<ExamCycle>>;
  keywords: string[];
};
