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
const institutionData = await readJson("data/institutions.json", { institutions: [], types: [] });
const scholarshipData = await readJson("data/scholarships.json", { scholarships: [] });

const errors = [];
const warnings = [];
const slugs = new Set();
const keys = new Set();
const isUrl = (value) => typeof value === "string" && /^https?:\/\/[^\s]+$/i.test(value);
const isStringList = (value) => Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim());

for (const [index, job] of jobs.entries()) {
  const where = `jobs[${index}] (${job.slug || job.title || "untitled"})`;
  if (!job.title) errors.push(`${where}: title missing`);
  if (!job.slug) errors.push(`${where}: slug missing`);
  if (!job.organization) errors.push(`${where}: organization missing`);
  if (!CATEGORIES.includes(job.category)) errors.push(`${where}: invalid category "${job.category}"`);
  if (!job.summary) errors.push(`${where}: summary missing`);
  if (!isUrl(job.officialUrl)) errors.push(`${where}: officialUrl missing or invalid`);
  if (!isUrl(job.notificationUrl)) {
    errors.push(`${where}: notificationUrl is required and must be a direct http(s) link`);
  }
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
  if (!job.demo && isUrl(job.officialUrl) && job.officialUrl.includes("news.google.com")) {
    warnings.push(`${where}: officialUrl is a Google News redirect; replace with a direct official URL`);
  }
  if (!job.demo && isUrl(job.notificationUrl) && job.notificationUrl.includes("news.google.com")) {
    errors.push(`${where}: notificationUrl must point to an official notification, not a news redirect`);
  }

  /* Optional analysis fields — validated only when present. */
  if (job.highlights !== undefined && !isStringList(job.highlights)) {
    errors.push(`${where}: highlights must be an array of non-empty strings`);
  }
  if (job.eligibility !== undefined && !isStringList(job.eligibility)) {
    errors.push(`${where}: eligibility must be an array of non-empty strings`);
  }
  if (job.selectionProcess !== undefined && !isStringList(job.selectionProcess)) {
    errors.push(`${where}: selectionProcess must be an array of non-empty strings`);
  }
  if (job.howToApply !== undefined && !isStringList(job.howToApply)) {
    errors.push(`${where}: howToApply must be an array of non-empty strings`);
  }
  if (job.documents !== undefined && !isStringList(job.documents)) {
    errors.push(`${where}: documents must be an array of non-empty strings`);
  }
  if (job.importantDates !== undefined) {
    if (!Array.isArray(job.importantDates)) {
      errors.push(`${where}: importantDates must be an array`);
    } else {
      for (const [dateIndex, entry] of job.importantDates.entries()) {
        if (!entry || !entry.label) errors.push(`${where}: importantDates[${dateIndex}] needs a label`);
        if (entry?.date && Number.isNaN(new Date(entry.date).getTime())) {
          errors.push(`${where}: importantDates[${dateIndex}] has an invalid date`);
        }
      }
    }
  }
  if (job.posts !== undefined) {
    if (!Array.isArray(job.posts)) {
      errors.push(`${where}: posts must be an array`);
    } else {
      for (const [postIndex, post] of job.posts.entries()) {
        if (!post || !post.name) errors.push(`${where}: posts[${postIndex}] needs a name`);
        if (post?.vacancies !== undefined && post?.vacancies !== null && !Number.isFinite(post.vacancies)) {
          errors.push(`${where}: posts[${postIndex}] has an invalid vacancy count`);
        }
      }
    }
  }
  if (job.officialLinks !== undefined) {
    if (!Array.isArray(job.officialLinks)) {
      errors.push(`${where}: officialLinks must be an array`);
    } else {
      for (const [linkIndex, link] of job.officialLinks.entries()) {
        if (!link || !link.label) errors.push(`${where}: officialLinks[${linkIndex}] needs a label`);
        if (!isUrl(link?.url)) errors.push(`${where}: officialLinks[${linkIndex}] has an invalid URL`);
      }
    }
  }
  if (!job.demo) {
    if (!job.highlights?.length) warnings.push(`${where}: no highlights analysis attached`);
    if (!job.eligibility?.length) warnings.push(`${where}: no eligibility analysis attached`);
    if (!job.selectionProcess?.length) warnings.push(`${where}: no selection process attached`);
    if (!job.howToApply?.length) warnings.push(`${where}: no application steps attached`);
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
  if (!isUrl(state.portal)) errors.push(`${where}: invalid portal URL`);
  for (const body of ["psc", "police", "board"]) {
    const entry = state[body];
    if (!entry) continue;
    if (!Array.isArray(entry) || entry.length !== 3) {
      errors.push(`${where}: ${body} must be [fullName, shortName, url]`);
      continue;
    }
    if (!isUrl(entry[2])) errors.push(`${where}: ${body} URL invalid`);
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
  if (!isUrl(exam.officialUrl)) errors.push(`${where}: invalid officialUrl`);
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

/* Institutions */
const institutionSlugs = new Set();
for (const [index, institution] of (institutionData.institutions || []).entries()) {
  const where = `institutions[${index}] (${institution.slug || institution.name || "untitled"})`;
  if (!institution.id) errors.push(`${where}: id missing`);
  if (!institution.slug) errors.push(`${where}: slug missing`);
  if (!institution.name) errors.push(`${where}: name missing`);
  if (!institution.type) errors.push(`${where}: type missing`);
  if (!stateIds.has(institution.stateId)) errors.push(`${where}: unknown stateId "${institution.stateId}"`);
  if (!isUrl(institution.website)) errors.push(`${where}: invalid website URL`);
  if (!isUrl(institution.admissionPortal)) errors.push(`${where}: invalid admission portal URL`);
  if (institutionSlugs.has(institution.slug)) errors.push(`${where}: duplicate slug`);
  institutionSlugs.add(institution.slug);
}

/* Scholarships */
const scholarshipSlugs = new Set();
for (const [index, scholarship] of (scholarshipData.scholarships || []).entries()) {
  const where = `scholarships[${index}] (${scholarship.slug || scholarship.name || "untitled"})`;
  if (!scholarship.id) errors.push(`${where}: id missing`);
  if (!scholarship.slug) errors.push(`${where}: slug missing`);
  if (!scholarship.name) errors.push(`${where}: name missing`);
  if (!["central", "state"].includes(scholarship.scope)) {
    errors.push(`${where}: invalid scope "${scholarship.scope}"`);
  }
  if (scholarship.scope === "state" && !stateIds.has(scholarship.stateId)) {
    errors.push(`${where}: unknown stateId "${scholarship.stateId}"`);
  }
  if (!isUrl(scholarship.portalUrl)) errors.push(`${where}: invalid portalUrl`);
  if (!isUrl(scholarship.officialUrl)) errors.push(`${where}: invalid officialUrl`);
  if (!isStringList(scholarship.eligibility)) errors.push(`${where}: eligibility must be a string list`);
  if (!isStringList(scholarship.documents)) errors.push(`${where}: documents must be a string list`);
  if (!isStringList(scholarship.process)) errors.push(`${where}: process must be a string list`);
  if (scholarshipSlugs.has(scholarship.slug)) errors.push(`${where}: duplicate slug`);
  scholarshipSlugs.add(scholarship.slug);
}

const counts = {
  jobs: jobs.length,
  exams: exams.length,
  central: exams.filter((exam) => exam.scope === "central").length,
  state: exams.filter((exam) => exam.scope === "state").length,
  states: (stateData.states || []).length,
  streams: streamIds.size,
  institutions: (institutionData.institutions || []).length,
  scholarships: (scholarshipData.scholarships || []).length,
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
    `\n✓ ${counts.jobs} job(s) validated, each with an official notification link.` +
      `\n✓ ${counts.exams} exam(s) validated (${counts.central} central, ${counts.state} state) across ` +
      `${counts.streams} streams and ${counts.states} states/UTs.` +
      `\n✓ ${counts.institutions} institution(s) and ${counts.scholarships} scholarship(s) validated.`,
  );
}
