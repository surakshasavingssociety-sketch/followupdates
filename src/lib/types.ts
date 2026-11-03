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

/** One dated milestone shown in the "Important dates" table. */
export type ImportantDate = {
  label: string;
  date?: string | null;
  note?: string;
};

/** A link to an official page or PDF (notification, apply form, result, syllabus). */
export type OfficialLink = {
  label: string;
  url: string;
};

/** One post included in a recruitment, with its own vacancy count. */
export type PostDetail = {
  name: string;
  vacancies?: number | null;
  qualification?: string;
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
  /** Landing page of the recruiting body. */
  officialUrl: string;
  /** Direct link to the official notification / PDF. Required for every published post. */
  notificationUrl: string;
  sourceName: string;
  sourceUrl?: string;
  status: "draft" | "pending_approval" | "approved" | "published" | "scheduled" | "rejected" | "archived" | "pending";
  featured?: boolean;
  demo?: boolean;
  examId?: string | null;
  examName?: string | null;
  examStream?: string | null;
  examScope?: "central" | "state" | null;
  stateId?: string | null;

  /* --- Notification analysis (all optional so older entries stay valid) --- */
  /** Short bullet highlights extracted from the notification. */
  highlights?: string[];
  /** Full important-dates table. Falls back to applyStart/applyEnd/examDate. */
  importantDates?: ImportantDate[];
  /** Post-wise vacancy breakdown. */
  posts?: PostDetail[];
  /** Selection stages in order. */
  selectionProcess?: string[];
  /** Step-by-step application instructions specific to this notification. */
  howToApply?: string[];
  /** Documents the candidate must keep ready. */
  documents?: string[];
  /** Eligibility in full sentences. */
  eligibility?: string[];
  /** Every official link (notification, apply, syllabus, result, admit card). */
  officialLinks?: OfficialLink[];

  /* --- CMS fields (all optional for backward compatibility) --- */
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  /** ISO date for scheduled publishing. */
  publishAt?: string | null;
  archivedAt?: string | null;

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

/* ------------------------------- Institutions ------------------------------ */

export type InstitutionType =
  | "iit"
  | "nit"
  | "iiit"
  | "aiims"
  | "iim"
  | "nlu"
  | "central-university"
  | "state-university";

export type Institution = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  type: InstitutionType;
  typeName: string;
  stateId: string;
  stateName: string;
  region: string;
  city: string;
  website: string;
  admissionPortal: string;
  exams: string[];
  streams: string[];
  level: string;
  summary: string;
  verificationStatus?: "verified" | "pending" | "failed" | "not_applicable";
  verificationSource?: string;
};

export type InstitutionDatabase = {
  version: number;
  updated: string;
  note: string;
  counts: {
    total: number;
    byType: Record<string, number>;
    states: number;
  };
  types: Array<{ id: InstitutionType; name: string; typeName: string }>;
  institutions: Institution[];
};

/* ------------------------------- Scholarships ------------------------------ */

export type Scholarship = {
  id: string;
  slug: string;
  name: string;
  provider: string;
  scope: "central" | "state";
  stateId: string | null;
  stateName: string | null;
  level: string[];
  categories: string[];
  amount: string;
  summary: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  process: string[];
  cycleMonths: number[];
  deadlineText: string;
  portalUrl: string;
  officialUrl: string;
  tags: string[];
};

export type ScholarshipDatabase = {
  version: number;
  updated: string;
  note: string;
  counts: {
    total: number;
    central: number;
    state: number;
    states: number;
  };
  scholarships: Scholarship[];
};

/* --------------------------------- Profile -------------------------------- */

export type EducationLevel =
  | "Class 8"
  | "Class 9"
  | "Class 10"
  | "Class 11"
  | "Class 12"
  | "Diploma"
  | "Graduate"
  | "Postgraduate";

export type CareerGoal =
  | "Engineering"
  | "Medical"
  | "Civil Services"
  | "Defence"
  | "Banking"
  | "Teaching"
  | "Law"
  | "Management"
  | "Railways"
  | "State Government"
  | "Research"
  | "Not decided";

export type UserCategory =
  | "Student"
  | "School student"
  | "College student"
  | "University student"
  | "Job aspirant"
  | "Competitive exam aspirant"
  | "Teacher"
  | "Faculty"
  | "Research scholar"
  | "Educational institution"
  | "Coaching institute"
  | "School"
  | "College"
  | "University"
  | "Government organisation"
  | "Private organisation"
  | "Open schooling service provider";

export type FeatureFlag = {
  id: string;
  name: string;
  enabled: boolean;
  configStatus: "configured" | "needs_setup" | "disabled";
  requiredService: string;
  dependencyStatus: "ready" | "pending" | "blocked";
  estimatedCost?: string;
  updatedAt?: string;
};

export type UserStatus =
  | "Student"
  | "Job aspirant"
  | "Teacher"
  | "Faculty"
  | "Research scholar"
  | "School"
  | "College"
  | "University"
  | "Coaching institute"
  | "Educational organisation"
  | "Government organisation"
  | "Private organisation"
  | "Open schooling provider";

export type UserProfile = {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  userStatus?: UserStatus;
  userCategory?: UserCategory;
  stateId?: string;
  stateName?: string;
  educationLevel?: EducationLevel;
  stream?: string;
  dateOfBirth?: string;
  careerGoal?: CareerGoal;
  interests?: string[];
  organizationName?: string;
  organizationWebsite?: string;
  organizationAbout?: string;
  organizationType?: "government" | "private" | "autonomous" | "deemed";
  organizationAccreditation?: string;
  organizationRanking?: string;
  organizationApproved?: boolean;
  portfolio?: string;
  resumeUrl?: string;
  cvUrl?: string;
  skills?: string[];
  achievements?: string[];
  emailAlerts?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type InstitutionInquiry = {
  id: string;
  institutionId: string;
  institutionName: string;
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  consent: boolean;
  status: "new" | "contacted" | "closed" | "spam";
  source?: string;
  createdAt: string;
  updatedAt?: string;
};
