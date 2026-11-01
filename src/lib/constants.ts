export const SITE = {
  name: "FollowExam",
  tagline: "Government exams. One clear feed.",
  description:
    "FollowExam par government jobs, results, admit cards, answer keys, exam dates, admissions aur scholarships ki verified daily updates milti hain.",
  url: (import.meta.env.PUBLIC_SITE_URL || "https://followupdates.web.app").replace(/\/$/, ""),
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || "hello@followupdates.web.app",
  telegram: import.meta.env.PUBLIC_TELEGRAM_URL || "",
  locale: "en_IN",
};

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Latest Jobs", href: "/category/latest-jobs/" },
  { label: "Exams", href: "/exams/" },
  { label: "States", href: "/states/" },
  { label: "Results", href: "/category/results/" },
  { label: "Calendar", href: "/calendar/" },
  { label: "All Updates", href: "/jobs/" },
];

export const CATEGORY_META: Record<
  string,
  { slug: string; label: string; description: string; icon: string; tone: string }
> = {
  "Latest Jobs": {
    slug: "latest-jobs",
    label: "Latest Jobs",
    description: "Nayi government recruitment, vacancy aur application updates.",
    icon: "💼",
    tone: "blue",
  },
  Results: {
    slug: "results",
    label: "Results",
    description: "Exam results, merit lists, cut-offs aur final selection updates.",
    icon: "🏆",
    tone: "green",
  },
  "Admit Card": {
    slug: "admit-card",
    label: "Admit Card",
    description: "Hall tickets, exam city slips aur reporting instructions.",
    icon: "🎫",
    tone: "amber",
  },
  "Answer Key": {
    slug: "answer-key",
    label: "Answer Key",
    description: "Official answer keys, response sheets aur objection windows.",
    icon: "🔑",
    tone: "violet",
  },
  "Exam Date": {
    slug: "exam-date",
    label: "Exam Date",
    description: "Exam schedules, date sheets aur important timelines.",
    icon: "🗓️",
    tone: "rose",
  },
  Admission: {
    slug: "admission",
    label: "Admission",
    description: "School, college aur university admission notifications.",
    icon: "🎓",
    tone: "cyan",
  },
  Syllabus: {
    slug: "syllabus",
    label: "Syllabus",
    description: "Exam patterns, syllabus PDFs aur preparation updates.",
    icon: "📚",
    tone: "indigo",
  },
  Scholarship: {
    slug: "scholarship",
    label: "Scholarship",
    description: "Scholarships, fellowships aur financial assistance schemes.",
    icon: "🎁",
    tone: "teal",
  },
};
