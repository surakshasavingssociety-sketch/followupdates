import "dotenv/config";
import { readJson, writeJson } from "./lib.mjs";
import { getDb, toIso } from "./firebase-admin.mjs";

const COMMON_DOCUMENTS = [
  "Recent passport-size photograph",
  "Scanned signature",
  "Class 10 certificate and marksheet",
  "Class 12 certificate and marksheet",
  "Graduation or post-graduation marksheets (as applicable)",
  "Category certificate (SC / ST / OBC / EWS), if applicable",
  "Photo identity proof (Aadhaar, PAN, passport or voter ID)",
];

const RESULT_DOCUMENTS = [
  "Official notification, result or answer key PDF",
  "Registration number or roll number",
  "Admit card, where applicable",
  "Photo identity proof",
];

const PROCESS_BY_CATEGORY = {
  "Latest Jobs": [
    "Online application and fee payment",
    "Written or computer-based examination",
    "Interview, skill test or physical test where applicable",
    "Document verification and medical examination where applicable",
  ],
  Results: [
    "Examination or selection stages",
    "Answer key and objection window where applicable",
    "Result declaration",
    "Counselling, document verification or appointment process",
  ],
  "Admit Card": [
    "Application and fee payment",
    "Admit card release",
    "Computer-based or written examination",
    "Document verification",
  ],
  "Answer Key": [
    "Examination",
    "Provisional answer key",
    "Objection window",
    "Final answer key and result",
  ],
  "Exam Date": [
    "Notification and application",
    "Admit card release",
    "Examination as per the published schedule",
    "Result declaration",
  ],
  Admission: [
    "Application or registration",
    "Entrance test or merit screening",
    "Counselling or seat allotment",
    "Admission and fee payment",
  ],
  Syllabus: [
    "Notification release",
    "Syllabus and exam pattern",
    "Application",
    "Examination",
  ],
  Scholarship: [
    "Online application",
    "Institute and document verification",
    "State or ministry approval",
    "Direct benefit transfer to the student's bank account",
  ],
};

function asList(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim());
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function buildAnalysis(job) {
  const qualification = asList(job.qualification);
  const dates = [];

  if (job.postDate) dates.push({ label: "Notification or update date", date: job.postDate });
  if (job.applyStart) dates.push({ label: "Application window opens", date: job.applyStart });
  if (job.applyEnd) dates.push({ label: "Last date to apply", date: job.applyEnd });
  if (job.examDate) dates.push({ label: "Exam date", date: job.examDate });

  const process = [
    ...(PROCESS_BY_CATEGORY[job.category] || PROCESS_BY_CATEGORY["Latest Jobs"]),
    "Indicative stages — verify the exact process in the official notification.",
  ];

  const highlights = [
    job.summary,
    `${job.organization} · ${job.category}${job.state ? ` · ${job.state}` : ""}`,
    "The official notification link is attached to this post. Confirm every date, fee and eligibility condition there before applying.",
  ].filter(Boolean);

  const eligibility = qualification.length
    ? [
        ...qualification.map((item) => `Qualification: ${item}.`),
        "Age limit and relaxation are as prescribed in the official notification.",
      ]
    : ["Eligibility, age limit and relaxation are as prescribed in the official notification."];

  const officialLinks = [
    job.notificationUrl ? { label: "Official notification", url: job.notificationUrl } : null,
    job.officialUrl && job.officialUrl !== job.notificationUrl
      ? { label: `${job.organization} official website`, url: job.officialUrl }
      : null,
  ].filter(Boolean);

  return {
    highlights,
    importantDates: dates,
    posts: job.vacancies
      ? [
          {
            name: job.title,
            vacancies: Number(job.vacancies),
            qualification: qualification.join(", ") || "As per notification",
          },
        ]
      : [],
    selectionProcess: process,
    howToApply: [
      "Open the official notification linked on this page and read the eligibility, dates, fee and instructions.",
      "Complete the online application on the official portal if the notification invites applications.",
      "Upload the required documents in the prescribed format and pay the fee online where applicable.",
      "Download the submitted application or acknowledgement and keep the registration number safe.",
      "Confirm every step on the official notification before the last date.",
    ],
    documents:
      ["Results", "Admit Card", "Answer Key", "Exam Date", "Syllabus"].includes(job.category)
        ? RESULT_DOCUMENTS
        : COMMON_DOCUMENTS,
    eligibility,
    officialLinks,
  };
}

function withAnalysis(data) {
  const analysis = buildAnalysis(data);
  return {
    ...data,
    highlights: data.highlights?.length ? data.highlights : analysis.highlights,
    importantDates: data.importantDates?.length ? data.importantDates : analysis.importantDates,
    posts: data.posts?.length ? data.posts : analysis.posts,
    selectionProcess: data.selectionProcess?.length ? data.selectionProcess : analysis.selectionProcess,
    howToApply: data.howToApply?.length ? data.howToApply : analysis.howToApply,
    documents: data.documents?.length ? data.documents : analysis.documents,
    eligibility: data.eligibility?.length ? data.eligibility : analysis.eligibility,
    officialLinks: data.officialLinks?.length ? data.officialLinks : analysis.officialLinks,
  };
}

function normalizeJob(id, data) {
  const enriched = withAnalysis(data);
  return {
    ...enriched,
    id,
    slug: data.slug || id,
    status: "published",
    demo: false,
    createdAt: toIso(data.createdAt) || new Date().toISOString(),
    updatedAt: toIso(data.updatedAt) || new Date().toISOString(),
    approvedAt: toIso(data.approvedAt) || null,
  };
}

async function main() {
  const existing = await readJson("data/jobs.json", []);
  const db = getDb();
  const snapshot = await db.collection("jobs").where("status", "==", "published").get();

  if (snapshot.empty) {
    console.log("No approved jobs in Firestore; keeping existing data/jobs.json.");
    return;
  }

  const jobs = snapshot.docs
    .map((doc) => normalizeJob(doc.id, doc.data()))
    .sort((a, b) => String(b.postDate).localeCompare(String(a.postDate)));

  await writeJson("data/jobs.json", jobs);
  console.log(`Pulled ${jobs.length} approved job(s) from Firestore (${existing.length} previously).`);
}

main().catch((error) => {
  console.error(error.message);
  console.error("Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS to pull approved jobs.");
  process.exitCode = 1;
});
