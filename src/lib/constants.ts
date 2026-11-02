export const SITE = {
  name: "FollowExam",
  tagline: "Every government exam, one clear feed.",
  description:
    "FollowExam brings verified government job notifications, results, admit cards, exam dates, admissions and scholarships from official sources into one account-based portal.",
  url: (import.meta.env.PUBLIC_SITE_URL || "https://followupdates.web.app").replace(/\/$/, ""),
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || "hello@followupdates.web.app",
  telegram: import.meta.env.PUBLIC_TELEGRAM_URL || "",
  locale: "en_IN",
};

export const NAV = [
  { label: "Jobs", href: "/jobs/" },
  { label: "Scholarships", href: "/scholarships/" },
  { label: "Institutions", href: "/institutions/" },
  { label: "Exams", href: "/exams/" },
  { label: "Career", href: "/career/" },
  { label: "States", href: "/states/" },
  { label: "Calendar", href: "/calendar/" },
];

export const CATEGORY_META: Record<
  string,
  { slug: string; label: string; description: string; icon: string; tone: string }
> = {
  "Latest Jobs": {
    slug: "latest-jobs",
    label: "Latest Jobs",
    description: "New government recruitment notifications, vacancy counts and application windows.",
    icon: "💼",
    tone: "blue",
  },
  Results: {
    slug: "results",
    label: "Results",
    description: "Exam results, merit lists, cut-off marks and final selection lists.",
    icon: "🏆",
    tone: "green",
  },
  "Admit Card": {
    slug: "admit-card",
    label: "Admit Card",
    description: "Hall tickets, exam city slips and reporting instructions.",
    icon: "🎫",
    tone: "amber",
  },
  "Answer Key": {
    slug: "answer-key",
    label: "Answer Key",
    description: "Official answer keys, response sheets and objection windows.",
    icon: "🔑",
    tone: "violet",
  },
  "Exam Date": {
    slug: "exam-date",
    label: "Exam Date",
    description: "Exam schedules, date sheets and important timelines.",
    icon: "🗓️",
    tone: "rose",
  },
  Admission: {
    slug: "admission",
    label: "Admission",
    description: "School, college and university admission notifications.",
    icon: "🎓",
    tone: "cyan",
  },
  Syllabus: {
    slug: "syllabus",
    label: "Syllabus",
    description: "Exam patterns, syllabus documents and preparation updates.",
    icon: "📚",
    tone: "indigo",
  },
  Scholarship: {
    slug: "scholarship",
    label: "Scholarship",
    description: "Scholarships, fellowships and financial assistance schemes.",
    icon: "🎁",
    tone: "teal",
  },
};

export const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  iit: "IIT",
  nit: "NIT",
  iiit: "IIIT",
  aiims: "AIIMS",
  iim: "IIM",
  nlu: "NLU",
  "central-university": "Central university",
  "state-university": "State university",
};
