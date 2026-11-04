import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "./firebase";
import { loadProfile } from "./profile";
import type { UserProfile } from "./types";

/**
 * Single source of truth for "who is this user and what can they see?".
 *
 * Two independent layers:
 *  1. Access layer  — guest / member / admin (admin sub-roles decide admin tools).
 *  2. Persona layer — what kind of member this is (student, job aspirant, teacher,
 *                     institution, organisation …). Persona drives the public
 *                     dashboard, recommendations and shortcuts.
 *
 * A person can be both: an admin still has a persona, but lands in /admin/.
 */

export type AdminRole = "super_admin" | "admin" | "manager" | "executive" | "moderator";
export type AccessKind = "guest" | "member" | "admin";

export type Persona =
  | "student"
  | "job_seeker"
  | "research_scholar"
  | "teacher"
  | "faculty"
  | "institution"
  | "organisation";

export type Permission =
  | "queue.view"
  | "queue.approve"
  | "queue.publish"
  | "queue.delete"
  | "analytics.view"
  | "users.view"
  | "users.manage"
  | "inquiries.view"
  | "institutions.view"
  | "institutions.manage"
  | "payments.view"
  | "payments.manage"
  | "automation.run"
  | "social.manage"
  | "flags.manage"
  | "tracking.view"
  | "settings.manage";

export const ALL_PERMISSIONS: Permission[] = [
  "queue.view",
  "queue.approve",
  "queue.publish",
  "queue.delete",
  "analytics.view",
  "users.view",
  "users.manage",
  "inquiries.view",
  "institutions.view",
  "institutions.manage",
  "payments.view",
  "payments.manage",
  "automation.run",
  "social.manage",
  "flags.manage",
  "tracking.view",
  "settings.manage",
];

export const ADMIN_ROLE_INFO: Record<
  AdminRole,
  { label: string; short: string; description: string }
> = {
  super_admin: {
    label: "Super Admin",
    short: "Super Admin",
    description: "Full control — content, roles, payments and site settings.",
  },
  admin: {
    label: "Admin",
    short: "Admin",
    description: "Review, publish and manage content. Cannot change admin roles.",
  },
  manager: {
    label: "Manager",
    short: "Manager",
    description: "Runs the content queue, institutions and payment settings.",
  },
  executive: {
    label: "Executive",
    short: "Executive",
    description: "Reviews the queue and handles enquiries. No billing or role access.",
  },
  moderator: {
    label: "Moderator",
    short: "Moderator",
    description: "Reviews pending notifications only.",
  },
};

/** Permission matrix. Keep this in sync with firestore.rules. */
export const ADMIN_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  admin: [
    "queue.view",
    "queue.approve",
    "queue.publish",
    "analytics.view",
    "users.view",
    "inquiries.view",
    "institutions.view",
    "institutions.manage",
    "payments.view",
    "automation.run",
    "social.manage",
    "flags.manage",
    "tracking.view",
  ],
  manager: [
    "queue.view",
    "queue.approve",
    "queue.publish",
    "analytics.view",
    "inquiries.view",
    "institutions.view",
    "institutions.manage",
    "payments.view",
    "payments.manage",
    "automation.run",
    "social.manage",
    "flags.manage",
    "tracking.view",
  ],
  executive: [
    "queue.view",
    "queue.approve",
    "analytics.view",
    "inquiries.view",
    "tracking.view",
  ],
  moderator: ["queue.view", "queue.approve", "tracking.view"],
};

export type PersonaInfo = {
  id: Persona;
  label: string;
  icon: string;
  /** Short line under the welcome heading. */
  tagline: string;
  /** Hero primary/secondary actions for this persona. */
  actions: { href: string; label: string; style: "accent" | "outline" | "ghost" }[];
  quickLinks: { href: string; label: string; detail: string }[];
  /** Which dashboard sections make sense for this persona. */
  sections: {
    exams: boolean;
    jobs: boolean;
    scholarships: boolean;
    institutions: boolean;
    career: boolean;
  };
};

const LEARNER_SECTIONS = {
  exams: true,
  jobs: true,
  scholarships: true,
  institutions: true,
  career: true,
};

export const PERSONAS: Record<Persona, PersonaInfo> = {
  student: {
    id: "student",
    label: "Student",
    icon: "🎓",
    tagline: "Your study, exam and scholarship command centre.",
    actions: [
      { href: "/exams/", label: "Find your exam", style: "accent" },
      { href: "/scholarships/eligibility/", label: "Check eligibility", style: "outline" },
      { href: "/career/", label: "Career roadmap", style: "ghost" },
    ],
    quickLinks: [
      { href: "/exams/", label: "Exam cycles", detail: "Central and state exams for your level." },
      { href: "/scholarships/eligibility/", label: "Scholarship check", detail: "See which schemes you qualify for." },
      { href: "/calendar/", label: "Exam calendar", detail: "Notification, exam and result months." },
      { href: "/account/", label: "Saved updates", detail: "Everything you bookmarked." },
    ],
    sections: LEARNER_SECTIONS,
  },
  job_seeker: {
    id: "job_seeker",
    label: "Job aspirant",
    icon: "💼",
    tagline: "Government vacancies, admit cards and results in one place.",
    actions: [
      { href: "/jobs/", label: "Latest vacancies", style: "accent" },
      { href: "/category/admit-card/", label: "Admit cards", style: "outline" },
      { href: "/category/result/", label: "Results", style: "ghost" },
    ],
    quickLinks: [
      { href: "/jobs/", label: "Latest jobs", detail: "New notifications with official links." },
      { href: "/category/admit-card/", label: "Admit cards", detail: "Download hall tickets when released." },
      { href: "/category/result/", label: "Results", detail: "Scorecards and merit lists." },
      { href: "/account/", label: "Saved updates", detail: "Track the posts you follow." },
    ],
    sections: { ...LEARNER_SECTIONS, career: true },
  },
  research_scholar: {
    id: "research_scholar",
    label: "Research scholar",
    icon: "🔬",
    tagline: "Fellowships, research exams and higher-education routes.",
    actions: [
      { href: "/scholarships/", label: "Fellowships", style: "accent" },
      { href: "/exams/", label: "Research exams", style: "outline" },
      { href: "/library/", label: "Reading library", style: "ghost" },
    ],
    quickLinks: [
      { href: "/scholarships/", label: "Fellowships", detail: "UGC-NET, CSIR and state research grants." },
      { href: "/exams/", label: "Research exams", detail: "Eligibility tests for PhD and lectureship." },
      { href: "/library/", label: "Reading library", detail: "Books and guides with progress tracking." },
      { href: "/institutions/", label: "Institutions", detail: "Universities and research centres." },
    ],
    sections: LEARNER_SECTIONS,
  },
  teacher: {
    id: "teacher",
    label: "Teacher",
    icon: "📚",
    tagline: "Teaching jobs, TET updates and classroom resources.",
    actions: [
      { href: "/jobs/", label: "Teaching jobs", style: "accent" },
      { href: "/exams/", label: "TET / CTET", style: "outline" },
      { href: "/library/", label: "Resources", style: "ghost" },
    ],
    quickLinks: [
      { href: "/jobs/", label: "Teaching vacancies", detail: "TET, CTET and school recruitment." },
      { href: "/exams/", label: "Teacher eligibility", detail: "TET, CTET and state-level tests." },
      { href: "/library/", label: "Reading library", detail: "Guides and reference material." },
      { href: "/institutions/", label: "Schools & colleges", detail: "Find institutions near you." },
    ],
    sections: { ...LEARNER_SECTIONS, career: false },
  },
  faculty: {
    id: "faculty",
    label: "Faculty",
    icon: "🏫",
    tagline: "UGC-NET, faculty recruitment and academic resources.",
    actions: [
      { href: "/jobs/", label: "Faculty jobs", style: "accent" },
      { href: "/exams/", label: "UGC-NET", style: "outline" },
      { href: "/institutions/", label: "Institutions", style: "ghost" },
    ],
    quickLinks: [
      { href: "/jobs/", label: "Faculty vacancies", detail: "University and college recruitment." },
      { href: "/exams/", label: "UGC-NET & SET", detail: "Eligibility for teaching and research." },
      { href: "/scholarships/", label: "Fellowships", detail: "Research grants and fellowships." },
      { href: "/institutions/", label: "Institution directory", detail: "Compare universities and colleges." },
    ],
    sections: { ...LEARNER_SECTIONS, career: false },
  },
  institution: {
    id: "institution",
    label: "Institution",
    icon: "🏛",
    tagline: "Admission routes, verification and student enquiry tools.",
    actions: [
      { href: "/institutions/", label: "Institution directory", style: "accent" },
      { href: "/profile/", label: "Claim your profile", style: "outline" },
      { href: "/government-services/", label: "Compliance", style: "ghost" },
    ],
    quickLinks: [
      { href: "/institutions/", label: "Institution directory", detail: "Compare admission routes and portals." },
      { href: "/profile/", label: "Verification", detail: "Request institution verification from your profile." },
      { href: "/open-schooling/", label: "Open schooling", detail: "NIOS and state open board routes." },
      { href: "/government-services/", label: "Government services", detail: "Approvals, boards and compliance." },
    ],
    sections: {
      exams: false,
      jobs: true,
      scholarships: false,
      institutions: true,
      career: false,
    },
  },
  organisation: {
    id: "organisation",
    label: "Organisation",
    icon: "🏢",
    tagline: "Policy updates, partnerships and education-sector services.",
    actions: [
      { href: "/jobs/", label: "Sector updates", style: "accent" },
      { href: "/institutions/", label: "Institution directory", style: "outline" },
      { href: "/government-services/", label: "Government services", style: "ghost" },
    ],
    quickLinks: [
      { href: "/jobs/", label: "Sector updates", detail: "Recruitment and policy notifications." },
      { href: "/institutions/", label: "Institutions", detail: "Directory of schools, colleges and universities." },
      { href: "/library/", label: "Reading library", detail: "Reference material and reports." },
      { href: "/government-services/", label: "Government services", detail: "Regulatory and compliance portals." },
    ],
    sections: {
      exams: false,
      jobs: true,
      scholarships: false,
      institutions: true,
      career: false,
    },
  },
};

/** Persona derived from the progressive profile fields, with safe fallbacks. */
export function personaForProfile(profile: UserProfile | null): Persona {
  const status = profile?.userStatus;
  if (status) {
    switch (status) {
      case "Job aspirant":
        return "job_seeker";
      case "Research scholar":
        return "research_scholar";
      case "Teacher":
        return "teacher";
      case "Faculty":
        return "faculty";
      case "School":
      case "College":
      case "University":
      case "Coaching institute":
      case "Open schooling provider":
        return "institution";
      case "Educational organisation":
      case "Government organisation":
      case "Private organisation":
        return "organisation";
      case "Student":
        return "student";
    }
  }

  const category = profile?.userCategory || "";
  if (category.includes("Job aspirant") || category.includes("Competitive exam")) return "job_seeker";
  if (category.includes("Research")) return "research_scholar";
  if (category === "Teacher") return "teacher";
  if (category === "Faculty") return "faculty";
  if (/School|College|University|Coaching/.test(category)) return "institution";
  if (/organisation/i.test(category)) return "organisation";

  return "student";
}

export function personaInfo(persona: Persona): PersonaInfo {
  return PERSONAS[persona] || PERSONAS.student;
}

export function permissionsForRole(role: AdminRole | null): Permission[] {
  if (!role) return [];
  return ADMIN_PERMISSIONS[role] || ADMIN_PERMISSIONS.admin;
}

export function hasPermission(access: Access, permission: Permission): boolean {
  return access.kind === "admin" && access.permissions.includes(permission);
}

export function isAdminRole(value: unknown): value is AdminRole {
  return (
    value === "super_admin" ||
    value === "admin" ||
    value === "manager" ||
    value === "executive" ||
    value === "moderator"
  );
}

export type Access = {
  kind: AccessKind;
  adminRole: AdminRole | null;
  persona: Persona;
  /** Human label: "Super Admin", "Teacher", "Student" … */
  label: string;
  /** Where this user should land after sign-in. */
  homePath: string;
  permissions: Permission[];
  profile: UserProfile | null;
};

const GUEST_ACCESS: Access = {
  kind: "guest",
  adminRole: null,
  persona: "student",
  label: "Guest",
  homePath: "/",
  permissions: [],
  profile: null,
};

/**
 * Resolves the signed-in user's access + persona. Safe to call on every page:
 * a missing `admins/{uid}` document simply means "member", not an error.
 */
export async function resolveAccess(user: User | null): Promise<Access> {
  if (!user) return GUEST_ACCESS;

  const db = getFirebaseDb();
  let adminRole: AdminRole | null = null;

  if (db) {
    try {
      const snapshot = await getDoc(doc(db, "admins", user.uid));
      if (snapshot.exists()) {
        const role = snapshot.data()?.role;
        adminRole = isAdminRole(role) ? role : "admin";
      }
    } catch {
      /* Permission denied is the normal case for members. */
    }
  }

  let profile: UserProfile | null = null;
  try {
    profile = await loadProfile(user);
  } catch {
    profile = null;
  }

  const persona = personaForProfile(profile);
  const info = personaInfo(persona);

  if (adminRole) {
    return {
      kind: "admin",
      adminRole,
      persona,
      label: ADMIN_ROLE_INFO[adminRole].short,
      homePath: "/admin/",
      permissions: permissionsForRole(adminRole),
      profile,
    };
  }

  return {
    kind: "member",
    adminRole: null,
    persona,
    label: info.label,
    homePath: "/",
    permissions: [],
    profile,
  };
}

/** Admin page → permission map. Longest matching prefix wins. */
export const ADMIN_PAGE_PERMISSIONS: { path: string; permission: Permission }[] = [
  { path: "/admin/analytics/", permission: "analytics.view" },
  { path: "/admin/users/", permission: "users.view" },
  { path: "/admin/inquiries/", permission: "inquiries.view" },
  { path: "/admin/institutions/", permission: "institutions.view" },
  { path: "/admin/payments/", permission: "payments.view" },
  { path: "/admin/automation/", permission: "automation.run" },
  { path: "/admin/social/", permission: "social.manage" },
  { path: "/admin/feature-flags/", permission: "flags.manage" },
  { path: "/admin/tracking/", permission: "tracking.view" },
  { path: "/admin/settings/", permission: "settings.manage" },
  { path: "/admin/", permission: "queue.view" },
];

export function permissionForAdminPath(pathname: string): Permission {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const match = ADMIN_PAGE_PERMISSIONS.find((entry) =>
    entry.path === "/admin/" ? path === "/admin/" : path.startsWith(entry.path),
  );
  return match?.permission || "queue.view";
}

/** Compact label for header chips. */
export function accessChipLabel(access: Access): string {
  if (access.kind === "admin") return `⚙ ${access.label}`;
  if (access.kind === "member") return `${personaInfo(access.persona).icon} ${access.label}`;
  return "";
}
