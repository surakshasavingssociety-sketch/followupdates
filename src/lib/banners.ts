import { userCategoryForStatus } from "./profile";
import type { UserCategory, UserProfile } from "./types";

export type BannerLink = { label: string; href: string };

export type CategoryBanner = {
  category: UserCategory;
  /** Short chip shown next to the live dashboard eyebrow. */
  label: string;
  /** One-line promise shown above the greeting. */
  kicker: string;
  subtitle: string;
  /** Highlight colour used for the name, kicker and chips. */
  accent: string;
  glow1: string;
  glow2: string;
  from: string;
  via: string;
  to: string;
  primary: BannerLink;
  secondary: BannerLink;
  ghost: BannerLink;
};

/**
 * One banner per user category. Copy, CTA and palette change with the profile,
 * so a school student, a teacher and a university see different dashboards.
 */
export const CATEGORY_BANNERS: Record<UserCategory, CategoryBanner> = {
  Student: {
    category: "Student",
    label: "Student",
    kicker: "Your study and exam command centre",
    subtitle:
      "Board dates, entrance exams, scholarships and admission windows picked for your class — all in one place.",
    accent: "#ffc45c",
    glow1: "rgba(245, 158, 11, 0.28)",
    glow2: "rgba(73, 160, 255, 0.3)",
    from: "#071a33",
    via: "#0b3f78",
    to: "#0b4f9c",
    primary: { label: "Find your exams", href: "/exams/" },
    secondary: { label: "Scholarships", href: "/scholarships/" },
    ghost: { label: "Update profile", href: "/profile/" },
  },
  "School student": {
    category: "School student",
    label: "School student",
    kicker: "Board exams and early pathways",
    subtitle:
      "Class 8–12 board dates, olympiads, scholarships and stream selection guidance — filtered for school students.",
    accent: "#8ee7c0",
    glow1: "rgba(16, 185, 129, 0.28)",
    glow2: "rgba(96, 165, 250, 0.3)",
    from: "#05221f",
    via: "#075e52",
    to: "#0b7a5f",
    primary: { label: "Board exam hub", href: "/exams/" },
    secondary: { label: "Scholarships", href: "/scholarships/" },
    ghost: { label: "Career roadmap", href: "/career/" },
  },
  "College student": {
    category: "College student",
    label: "College student",
    kicker: "Internships, entrance exams and funding",
    subtitle:
      "Postgraduate entrance tests, campus recruitment, internships and scholarships matched to your degree.",
    accent: "#9ad7ff",
    glow1: "rgba(56, 189, 248, 0.3)",
    glow2: "rgba(129, 140, 248, 0.28)",
    from: "#071c33",
    via: "#0a4b80",
    to: "#0b5fa5",
    primary: { label: "Explore exams", href: "/exams/" },
    secondary: { label: "Scholarships", href: "/scholarships/" },
    ghost: { label: "Career roadmap", href: "/career/" },
  },
  "University student": {
    category: "University student",
    label: "University student",
    kicker: "Higher studies, research and campus opportunities",
    subtitle:
      "PG, PhD and fellowship notifications, university admissions and research funding curated for your field.",
    accent: "#c7b3ff",
    glow1: "rgba(139, 92, 246, 0.3)",
    glow2: "rgba(56, 189, 248, 0.26)",
    from: "#140b33",
    via: "#3b2a86",
    to: "#4c35a8",
    primary: { label: "Higher study exams", href: "/exams/" },
    secondary: { label: "Institutions", href: "/institutions/" },
    ghost: { label: "Update profile", href: "/profile/" },
  },
  "Job aspirant": {
    category: "Job aspirant",
    label: "Job aspirant",
    kicker: "Your next government notification, tracked",
    subtitle:
      "Live central and state vacancies, admit cards, results and closing dates matched to your education.",
    accent: "#ffc45c",
    glow1: "rgba(245, 158, 11, 0.3)",
    glow2: "rgba(34, 197, 94, 0.26)",
    from: "#081d2e",
    via: "#0a3f66",
    to: "#0a5580",
    primary: { label: "Latest government jobs", href: "/jobs/" },
    secondary: { label: "Exam calendar", href: "/calendar/" },
    ghost: { label: "Edit profile", href: "/profile/" },
  },
  "Competitive exam aspirant": {
    category: "Competitive exam aspirant",
    label: "Exam aspirant",
    kicker: "Syllabus to result date, one thread",
    subtitle:
      "UPSC, SSC, banking, railways, defence and state PSC updates with notification dates, syllabus and cut-offs.",
    accent: "#ffd166",
    glow1: "rgba(250, 204, 21, 0.3)",
    glow2: "rgba(239, 68, 68, 0.22)",
    from: "#241305",
    via: "#6b3d0c",
    to: "#8a4f0f",
    primary: { label: "Open exam calendar", href: "/calendar/" },
    secondary: { label: "Browse exams", href: "/exams/" },
    ghost: { label: "Latest jobs", href: "/jobs/" },
  },
  Teacher: {
    category: "Teacher",
    label: "Teacher",
    kicker: "Teaching jobs, TET and classroom resources",
    subtitle:
      "TET/CTET dates, teacher recruitment, school vacancies and verified institution openings in your state.",
    accent: "#a5f3d0",
    glow1: "rgba(16, 185, 129, 0.3)",
    glow2: "rgba(59, 130, 246, 0.24)",
    from: "#06231c",
    via: "#0a5744",
    to: "#0b6b52",
    primary: { label: "Teaching updates", href: "/jobs/" },
    secondary: { label: "TET / CTET exams", href: "/exams/" },
    ghost: { label: "Edit profile", href: "/profile/" },
  },
  Faculty: {
    category: "Faculty",
    label: "Faculty",
    kicker: "Academic careers and research openings",
    subtitle:
      "UGC-NET, faculty recruitment, university vacancies and research grants for lecturers and professors.",
    accent: "#c9b6ff",
    glow1: "rgba(139, 92, 246, 0.3)",
    glow2: "rgba(236, 72, 153, 0.22)",
    from: "#160b30",
    via: "#43267e",
    to: "#5733a0",
    primary: { label: "Academic openings", href: "/jobs/" },
    secondary: { label: "UGC-NET & exams", href: "/exams/" },
    ghost: { label: "Institutions", href: "/institutions/" },
  },
  "Research scholar": {
    category: "Research scholar",
    label: "Research scholar",
    kicker: "Fellowships, funding and PhD alerts",
    subtitle:
      "Research fellowships, PhD admissions, grant calls and conference deadlines collected for scholars.",
    accent: "#9fe8ff",
    glow1: "rgba(14, 165, 233, 0.3)",
    glow2: "rgba(139, 92, 246, 0.26)",
    from: "#051e2b",
    via: "#0a4a63",
    to: "#0b5c7a",
    primary: { label: "Research fellowships", href: "/scholarships/" },
    secondary: { label: "PhD & PG exams", href: "/exams/" },
    ghost: { label: "Update profile", href: "/profile/" },
  },
  "Educational institution": {
    category: "Educational institution",
    label: "Institution",
    kicker: "Admissions, verification and student reach",
    subtitle:
      "Publish verified institution details, manage enquiries and reach students exploring admissions.",
    accent: "#a7f3d0",
    glow1: "rgba(16, 185, 129, 0.3)",
    glow2: "rgba(20, 184, 166, 0.28)",
    from: "#04231d",
    via: "#075747",
    to: "#0a6b57",
    primary: { label: "Institution directory", href: "/institutions/" },
    secondary: { label: "Public portfolio", href: "/portfolio/" },
    ghost: { label: "Complete profile", href: "/profile/" },
  },
  "Coaching institute": {
    category: "Coaching institute",
    label: "Coaching institute",
    kicker: "Batch announcements and verified listings",
    subtitle:
      "Show your courses, verification status and contact details to students searching for coaching nearby.",
    accent: "#ffd08a",
    glow1: "rgba(245, 158, 11, 0.3)",
    glow2: "rgba(16, 185, 129, 0.24)",
    from: "#241a05",
    via: "#5c410b",
    to: "#75520d",
    primary: { label: "Student enquiries", href: "/profile/" },
    secondary: { label: "Public portfolio", href: "/portfolio/" },
    ghost: { label: "Institutions", href: "/institutions/" },
  },
  School: {
    category: "School",
    label: "School",
    kicker: "Board updates and admission enquiries",
    subtitle:
      "Track board notifications, admission cycles and parent enquiries for your school in one dashboard.",
    accent: "#9ad7ff",
    glow1: "rgba(56, 189, 248, 0.3)",
    glow2: "rgba(16, 185, 129, 0.24)",
    from: "#08202e",
    via: "#0a4a66",
    to: "#0b5c7d",
    primary: { label: "Board & school updates", href: "/exams/" },
    secondary: { label: "Open schooling", href: "/open-schooling/" },
    ghost: { label: "Complete profile", href: "/profile/" },
  },
  College: {
    category: "College",
    label: "College",
    kicker: "Admissions, exams and campus visibility",
    subtitle:
      "University admissions, semester exam alerts and verified college details for prospective students.",
    accent: "#b9c8ff",
    glow1: "rgba(99, 102, 241, 0.3)",
    glow2: "rgba(56, 189, 248, 0.26)",
    from: "#0b1230",
    via: "#2b2f78",
    to: "#373f96",
    primary: { label: "Admission updates", href: "/institutions/" },
    secondary: { label: "Exam alerts", href: "/exams/" },
    ghost: { label: "Institution profile", href: "/profile/" },
  },
  University: {
    category: "University",
    label: "University",
    kicker: "Admissions, research and verified profile",
    subtitle:
      "PG and PhD admissions, research funding, ranking updates and verified university information.",
    accent: "#c9b6ff",
    glow1: "rgba(139, 92, 246, 0.3)",
    glow2: "rgba(14, 165, 233, 0.26)",
    from: "#160b30",
    via: "#3f2478",
    to: "#513095",
    primary: { label: "University admissions", href: "/institutions/" },
    secondary: { label: "Research funding", href: "/scholarships/" },
    ghost: { label: "Verified profile", href: "/profile/" },
  },
  "Government organisation": {
    category: "Government organisation",
    label: "Government",
    kicker: "Notifications and verified public listings",
    subtitle:
      "Publish official recruitment and admission notices, and manage a verified organisation profile.",
    accent: "#a5f3d0",
    glow1: "rgba(16, 185, 129, 0.3)",
    glow2: "rgba(59, 130, 246, 0.24)",
    from: "#05231e",
    via: "#07556b",
    to: "#0a637d",
    primary: { label: "Publish notifications", href: "/jobs/" },
    secondary: { label: "Institution directory", href: "/institutions/" },
    ghost: { label: "Complete profile", href: "/profile/" },
  },
  "Private organisation": {
    category: "Private organisation",
    label: "Organisation",
    kicker: "Hiring reach and verified employer profile",
    subtitle:
      "Reach qualified candidates, share openings and keep a verified employer profile on FollowExam.",
    accent: "#ffc9a3",
    glow1: "rgba(249, 115, 22, 0.3)",
    glow2: "rgba(236, 72, 153, 0.22)",
    from: "#241206",
    via: "#6b2f0b",
    to: "#853a0d",
    primary: { label: "Post an opening", href: "/jobs/" },
    secondary: { label: "Public portfolio", href: "/portfolio/" },
    ghost: { label: "Complete profile", href: "/profile/" },
  },
  "Open schooling service provider": {
    category: "Open schooling service provider",
    label: "Open schooling",
    kicker: "Learner enquiries and verified listing",
    subtitle:
      "Reach NIOS and open-schooling learners with verified programmes, admission help and contact details.",
    accent: "#a7f3d0",
    glow1: "rgba(16, 185, 129, 0.3)",
    glow2: "rgba(250, 204, 21, 0.24)",
    from: "#04231d",
    via: "#075247",
    to: "#0a6653",
    primary: { label: "Open schooling hub", href: "/open-schooling/" },
    secondary: { label: "Public portfolio", href: "/portfolio/" },
    ghost: { label: "Complete profile", href: "/profile/" },
  },
};

/** Pick the banner from the saved category, then the status, then Student. */
export function bannerFor(profile?: UserProfile | null): CategoryBanner {
  const direct = profile?.userCategory && CATEGORY_BANNERS[profile.userCategory];
  if (direct) return direct;

  const derived = userCategoryForStatus(profile?.userStatus);
  if (derived && CATEGORY_BANNERS[derived]) return CATEGORY_BANNERS[derived];

  return CATEGORY_BANNERS.Student;
}
