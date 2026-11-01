import { normalizeKey, readJson } from "./lib.mjs";

const CATEGORIES = [
  "Latest Jobs",
  "Results",
  "Admit Card",
  "Answer Key",
  "Exam Date",
  "Admission",
  "Syllabus",
  "Scholarship",
];

const PHASES = ["notification", "apply", "exam", "result"];

const jobs = await readJson("data/jobs.json", []);
const examData = await readJson("data/exams.json", { streams: [], exams: [] });
const stateData = await readJson("data/states.json", { states: [] });

const errors = [];
const warnings = [];
const slugs = new Set();
const keys = new Set();

for (const [index, job] of jobs.entries()) {
  const where = `jobs[${index}] (${job.slug || job.title || "untitled"})`;
  if (!job.title) errors.push(`${where}: title missing`);
  if (!job.slug) errors.push(`${where}: slug missing`);
  if (!job.organization) errors.push(`${where}: organization missing`);
  if (!CATEGORIES.includes(job.category)) errors.push(`${where}: invalid category "${job.category}"`);
  if (!job.summary) errors.push(`${where}: summary missing`);
  if (!job.officialUrl) errors.push(`${where}: officialUrl missing`);
  if (!job.postDate || Number.isNaN(new Date(job.postDate).getTime())) {
    errors.push(`${where}: invalid postDate`);
  }
  if (job.applyStart && job.applyEnd && new Date(job.applyStart) > new Date(job.applyEnd)) {
    errors.push(`${where}: applyStart is after applyEnd`);
  }
  if (job.slug && slugs.has(job.slug)) errors.push(`${where}: duplicate slug`);
  slugs.add(job.slug);
  const key = normalizeKey(job.title, job.organization);
  if (keys.has(key)) warnings.push(`${where}: possible duplicate title`);
  keys.add(key);
  if (!job.demo && job.officialUrl.includes("news.google.com")) {
    warnings.push(`${where}: officialUrl is a Google News redirect; replace with a direct official URL`);
  }
}

/* States / UTs */
const stateIds = new Set();
for (const [index, state] of (stateData.states || []).entries()) {
  const where = `states[${index}] (${state.id || state.name || "untitled"})`;
  if (!state.id) errors.push(`${where}: id missing`);
  if (!state.name) errors.push(`${where}: name missing`);
  if (!["state", "ut"].includes(state.type)) errors.push(`${where}: invalid type "${state.type}"`);
  if (!state.capital) errors.push(`${where}: capital missing`);
  if (!state.region) errors.push(`${where}: region missing`);
  if (!state.portal || !/^https?:\/\//.test(state.portal)) errors.push(`${where}: invalid portal URL`);
  for (const body of ["psc", "police", "board"]) {
    const entry = state[body];
    if (!entry) continue;
    if (!Array.isArray(entry) || entry.length !== 3) {
      errors.push(`${where}: ${body} must be [fullName, shortName, url]`);
      continue;
    }
    if (!/^https?:\/\//.test(entry[2] || "")) errors.push(`${where}: ${body} URL invalid`);
  }
  if (stateIds.has(state.id)) errors.push(`${where}: duplicate state id`);
  stateIds.add(state.id);
}

/* Exam database */
const exams = examData.exams || [];
const streamIds = new Set((examData.streams || []).map((stream) => stream.id));
const examIds = new Set();
const examSlugs = new Set();

for (const [index, exam] of exams.entries()) {
  const where = `exams[${index}] (${exam.id || exam.name || "untitled"})`;
  if (!exam.id) errors.push(`${where}: id missing`);
  if (!exam.slug) errors.push(`${where}: slug missing`);
  if (!exam.name) errors.push(`${where}: name missing`);
  if (!exam.fullName) errors.push(`${where}: fullName missing`);
  if (!streamIds.has(exam.stream)) errors.push(`${where}: unknown stream "${exam.stream}"`);
  if (!["central", "state"].includes(exam.scope)) errors.push(`${where}: invalid scope "${exam.scope}"`);
  if (!exam.body) errors.push(`${where}: conducting body missing`);
  if (!exam.level) errors.push(`${where}: level missing`);
  if (!exam.officialUrl || !/^https?:\/\//.test(exam.officialUrl)) {
    errors.push(`${where}: invalid officialUrl`);
  }
  if (!Array.isArray(exam.qualification) || exam.qualification.length === 0) {
    errors.push(`${where}: qualification missing`);
  }
  if (exam.scope === "state") {
    if (!exam.stateId) errors.push(`${where}: state scope without stateId`);
    else if (!stateIds.has(exam.stateId)) errors.push(`${where}: unknown stateId "${exam.stateId}"`);
  }
  for (const phase of PHASES) {
    const months = exam.cycle?.[phase];
    if (!Array.isArray(months) || months.length === 0) {
      errors.push(`${where}: cycle.${phase} missing`);
      continue;
    }
    const invalid = months.filter((month) => !Number.isInteger(month) || month < 1 || month > 12);
    if (invalid.length) errors.push(`${where}: cycle.${phase} has invalid month(s) ${invalid.join(", ")}`);
  }
  if (examIds.has(exam.id)) errors.push(`${where}: duplicate exam id`);
  examIds.add(exam.id);
  if (examSlugs.has(exam.slug)) errors.push(`${where}: duplicate slug`);
  examSlugs.add(exam.slug);
}

for (const [index, job] of jobs.entries()) {
  if (!job.examId) continue;
  if (!examIds.has(job.examId)) {
    warnings.push(`jobs[${index}] (${job.slug}): examId "${job.examId}" not found in exam database`);
  }
}

const counts = {
  jobs: jobs.length,
  exams: exams.length,
  central: exams.filter((exam) => exam.scope === "central").length,
  state: exams.filter((exam) => exam.scope === "state").length,
  states: (stateData.states || []).length,
  streams: streamIds.size,
};

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const warning of warnings) console.log(`  ! ${warning}`);
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const error of errors) console.error(`  × ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `\n✓ ${counts.jobs} job(s) validated.` +
      `\n✓ ${counts.exams} exam(s) validated (${counts.central} central, ${counts.state} state) across ` +
      `${counts.streams} streams and ${counts.states} states/UTs.`,
  );
}
