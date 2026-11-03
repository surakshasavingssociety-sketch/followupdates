import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "./firebase";
import type { CareerGoal, EducationLevel, Exam, Institution, Scholarship, UserCategory, UserProfile } from "./types";

export const USER_CATEGORIES: UserCategory[] = [
  "Student",
  "School student",
  "College student",
  "University student",
  "Job aspirant",
  "Competitive exam aspirant",
  "Teacher",
  "Faculty",
  "Research scholar",
  "Educational institution",
  "Coaching institute",
  "School",
  "College",
  "University",
  "Government organisation",
  "Private organisation",
  "Open schooling service provider",
];

export const EDUCATION_LEVELS: EducationLevel[] = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Diploma",
  "Graduate",
  "Postgraduate",
];

export const CAREER_GOALS: CareerGoal[] = [
  "Engineering",
  "Medical",
  "Civil Services",
  "Defence",
  "Banking",
  "Teaching",
  "Law",
  "Management",
  "Railways",
  "State Government",
  "Research",
  "Not decided",
];

const LEVEL_RANK: Record<EducationLevel, number> = {
  "Class 8": 1,
  "Class 9": 2,
  "Class 10": 3,
  "Class 11": 4,
  "Class 12": 5,
  Diploma: 6,
  Graduate: 7,
  Postgraduate: 8,
};

export function levelRank(level?: string | null): number {
  if (!level) return 0;
  return LEVEL_RANK[level as EducationLevel] || 0;
}

/** Best-effort mapping from free-text exam qualification to an education rank. */
export function qualificationRank(qualification: string): number {
  const value = qualification.toLowerCase();
  if (value.includes("post graduate") || value.includes("postgraduate") || value.includes("master")) return 8;
  if (value.includes("graduate") || value.includes("bachelor") || value.includes("b.tech") || value.includes("b.e")) return 7;
  if (value.includes("diploma") || value.includes("polytechnic")) return 6;
  if (value.includes("class 12") || value.includes("10+2") || value.includes("intermediate") || value.includes("12th")) return 5;
  if (value.includes("class 11")) return 4;
  if (value.includes("class 10") || value.includes("matric") || value.includes("10th")) return 3;
  if (value.includes("class 9")) return 2;
  if (value.includes("class 8")) return 1;
  return 0;
}

export type CareerPath = {
  goal: CareerGoal;
  title: string;
  description: string;
  streams: string[];
  institutionTypes: string[];
  stages: Array<{ label: string; detail: string }>;
};

export const CAREER_PATHS: Record<CareerGoal, CareerPath> = {
  Engineering: {
    goal: "Engineering",
    title: "Engineering",
    description: "Take the JEE route into IITs, NITs and IIITs, or a state entrance test into a regional engineering college.",
    streams: ["engineering", "entrance"],
    institutionTypes: ["iit", "nit", "iiit"],
    stages: [
      { label: "Class 11–12", detail: "Take Physics, Chemistry and Mathematics. Aim for 75%+ in Class 12." },
      { label: "JEE Main", detail: "Sit the January and April sessions. The best score counts for NITs and IIITs." },
      { label: "JEE Advanced", detail: "Top JEE Main candidates qualify. This decides IIT admission." },
      { label: "JoSAA counselling", detail: "Fill choices, lock seats and complete document verification." },
    ],
  },
  Medical: {
    goal: "Medical",
    title: "Medical",
    description: "NEET UG is the single gateway to MBBS, BDS, AYUSH and allied health courses across India.",
    streams: ["medical"],
    institutionTypes: ["aiims"],
    stages: [
      { label: "Class 11–12", detail: "Take Biology, Physics and Chemistry." },
      { label: "NEET UG", detail: "One national exam for government and private medical colleges." },
      { label: "MCC / state counselling", detail: "Register for All India Quota and your state quota separately." },
      { label: "Internship", detail: "Complete the compulsory rotating internship after MBBS." },
    ],
  },
  "Civil Services": {
    goal: "Civil Services",
    title: "Civil Services",
    description: "UPSC CSE for IAS, IPS and IFS, with SSC and state PSC exams as strong parallel options.",
    streams: ["upsc", "ssc", "state"],
    institutionTypes: ["central-university", "state-university"],
    stages: [
      { label: "Graduation", detail: "Any bachelor's degree. Start NCERT and newspaper reading early." },
      { label: "UPSC Prelims", detail: "Objective paper held around May–June." },
      { label: "UPSC Mains", detail: "Written papers held around September." },
      { label: "Interview", detail: "Personality test at UPSC Bhavan, usually in the following year." },
    ],
  },
  Defence: {
    goal: "Defence",
    title: "Defence",
    description: "NDA after Class 12, CDS after graduation, and Agniveer entries for soldier-level roles.",
    streams: ["defence"],
    institutionTypes: ["central-university"],
    stages: [
      { label: "NDA (after Class 12)", detail: "Written exam plus SSB interview for Army, Navy and Air Force cadet training." },
      { label: "CDS (after graduation)", detail: "Entry to IMA, OTA, INA and Air Force Academy." },
      { label: "SSB interview", detail: "Five-day assessment covering psychology, group tasks and personal interview." },
      { label: "Medical & merit list", detail: "Medical board clearance followed by the final merit list." },
    ],
  },
  Banking: {
    goal: "Banking",
    title: "Banking",
    description: "IBPS, SBI and RBI recruitment for clerk, probationary officer and specialist officer roles.",
    streams: ["banking", "insurance", "regulatory"],
    institutionTypes: ["central-university", "state-university"],
    stages: [
      { label: "Graduation", detail: "Any degree. Build speed in quantitative aptitude and reasoning." },
      { label: "Prelims", detail: "Qualifying objective test for PO and clerk posts." },
      { label: "Mains", detail: "Sectional and descriptive papers decide the final shortlist." },
      { label: "Interview", detail: "For officer posts, followed by document verification." },
    ],
  },
  Teaching: {
    goal: "Teaching",
    title: "Teaching",
    description: "CTET, state TET and KVS/NVS recruitment for school teaching posts.",
    streams: ["teaching"],
    institutionTypes: ["central-university", "state-university"],
    stages: [
      { label: "Graduation + B.Ed", detail: "A teaching degree is mandatory for most school posts." },
      { label: "CTET / State TET", detail: "Paper I for Classes 1–5, Paper II for Classes 6–8." },
      { label: "Recruitment exam", detail: "KVS, NVS or state teacher recruitment test." },
      { label: "Document verification", detail: "Degree, B.Ed and TET certificates are verified." },
    ],
  },
  Law: {
    goal: "Law",
    title: "Law",
    description: "CLAT for National Law Universities, followed by bar enrolment or judicial services.",
    streams: ["judiciary"],
    institutionTypes: ["nlu"],
    stages: [
      { label: "Class 12", detail: "Any stream is accepted for the five-year BA LLB." },
      { label: "CLAT", detail: "One exam for all National Law Universities." },
      { label: "Counselling", detail: "Seat allotment through the Consortium of NLUs." },
      { label: "Bar / judiciary", detail: "Enrol with the Bar Council, or prepare for state judicial services." },
    ],
  },
  Management: {
    goal: "Management",
    title: "Management",
    description: "CAT for IIMs, with CMAT and state CETs as additional routes into MBA programmes.",
    streams: ["entrance"],
    institutionTypes: ["iim"],
    stages: [
      { label: "Graduation", detail: "Any bachelor's degree with 50% marks." },
      { label: "CAT", detail: "Held in November–December every year." },
      { label: "WAT & PI", detail: "Each IIM runs its own writing test and interview round." },
      { label: "Final merit", detail: "Composite score of CAT, academics and interview." },
    ],
  },
  Railways: {
    goal: "Railways",
    title: "Railways",
    description: "RRB NTPC, Group D, ALP and JE recruitment for Indian Railways.",
    streams: ["railways"],
    institutionTypes: ["central-university", "state-university"],
    stages: [
      { label: "Class 12 / Graduation", detail: "Qualification depends on the post." },
      { label: "CBT 1", detail: "Computer-based screening test." },
      { label: "CBT 2", detail: "Post-specific technical or general paper." },
      { label: "Document verification", detail: "Followed by medical examination." },
    ],
  },
  "State Government": {
    goal: "State Government",
    title: "State Government",
    description: "State PSC, police, and departmental recruitment in your home state.",
    streams: ["state"],
    institutionTypes: ["state-university", "central-university"],
    stages: [
      { label: "Graduation", detail: "Most state PSC posts require a bachelor's degree." },
      { label: "State PSC prelims", detail: "Objective screening test." },
      { label: "State PSC mains", detail: "Descriptive papers." },
      { label: "Interview", detail: "Personality test and document verification." },
    ],
  },
  Research: {
    goal: "Research",
    title: "Research",
    description: "UGC-NET, CSIR-NET and GATE lead to research fellowships and PhD positions.",
    streams: ["entrance"],
    institutionTypes: ["iit", "nit", "central-university"],
    stages: [
      { label: "Postgraduate degree", detail: "Minimum 55% in a relevant master's programme." },
      { label: "UGC-NET / CSIR-NET / GATE", detail: "Qualify to become eligible for fellowships." },
      { label: "PhD admission", detail: "Apply to universities with a research proposal." },
      { label: "Fellowship", detail: "JRF then SRF, subject to annual progress review." },
    ],
  },
  "Not decided": {
    goal: "Not decided",
    title: "Still exploring",
    description: "Start with the exams open to your current class, then narrow down as you discover what fits.",
    streams: [],
    institutionTypes: ["central-university", "state-university"],
    stages: [
      { label: "Explore", detail: "Browse exams open to your current education level." },
      { label: "Shortlist", detail: "Save three or four paths that interest you." },
      { label: "Prepare", detail: "Check the syllabus and start with one exam at a time." },
      { label: "Apply", detail: "Track notification dates so you never miss a deadline." },
    ],
  },
};

export async function loadProfile(user: User): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    if (!snapshot.exists()) return null;
    return { uid: user.uid, ...(snapshot.data() as Omit<UserProfile, "uid">) };
  } catch {
    return null;
  }
}

export async function saveProfile(user: User, profile: Partial<UserProfile>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  await setDoc(
    doc(db, "users", user.uid),
    {
      ...profile,
      uid: user.uid,
      email: profile.email || user.email || "",
      updatedAt: new Date().toISOString(),
      createdAt: profile.createdAt || new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function eligibleExams(profile: UserProfile | null, exams: Exam[]): Exam[] {
  const rank = levelRank(profile?.educationLevel);
  if (!rank) return exams;
  return exams.filter((exam) => {
    const needed = Math.min(
      ...exam.qualification.map(qualificationRank).filter((value) => value > 0),
      99,
    );
    return needed <= rank;
  });
}

export function recommendedExams(profile: UserProfile | null, exams: Exam[]): Exam[] {
  if (!profile) return [];
  const path = CAREER_PATHS[profile.careerGoal || "Not decided"];
  const eligible = eligibleExams(profile, exams);
  if (!path.streams.length) return eligible.slice(0, 8);
  const matching = eligible.filter((exam) => path.streams.includes(exam.stream));
  return (matching.length ? matching : eligible).slice(0, 8);
}

export function recommendedInstitutions(profile: UserProfile | null, institutions: Institution[]): Institution[] {
  if (!profile) return [];
  const path = CAREER_PATHS[profile.careerGoal || "Not decided"];
  const byType = institutions.filter((item) => path.institutionTypes.includes(item.type));
  const local = byType.filter((item) => item.stateId === profile.stateId);
  return (local.length >= 4 ? local : [...local, ...byType.filter((item) => item.stateId !== profile.stateId)]).slice(0, 8);
}

export function recommendedScholarships(profile: UserProfile | null, scholarships: Scholarship[]): Scholarship[] {
  if (!profile) return [];
  const rank = levelRank(profile.educationLevel);
  return scholarships
    .filter((item) => {
      const inState = item.scope === "central" || item.stateId === profile.stateId;
      if (!inState) return false;
      if (!rank) return true;
      const levels = item.level.map((level) => qualificationRank(level));
      return levels.some((value) => value === 0 || value <= rank + 1);
    })
    .slice(0, 8);
}
