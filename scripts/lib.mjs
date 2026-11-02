import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data");

export async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, file), "utf8"));
  } catch (error) {
    if (fallback !== null) return fallback;
    throw error;
  }
}

export async function writeJson(file, value) {
  const full = path.join(ROOT, file);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function makeId(...parts) {
  return crypto
    .createHash("sha1")
    .update(parts.filter(Boolean).join("|").toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

export function normalizeKey(title = "", organization = "") {
  return `${cleanText(title)}|${cleanText(organization)}`
    .toLowerCase()
    .replace(/[^a-z0-9|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isoDate(value) {
  const date = parseDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
}

export function isRecent(value, days = 30) {
  const date = parseDate(value);
  if (!date) return true;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

export function absoluteUrl(href = "", base = "") {
  if (!href) return "";
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

export function inferCategory(title = "", fallback = "Latest Jobs") {
  const t = title.toLowerCase();
  if (/answer key|objection window|response sheet/.test(t)) return "Answer Key";
  if (/admit card|hall ticket|call letter|exam city|intimation slip/.test(t)) return "Admit Card";
  if (/result|merit list|scorecard|cut.?off|selected candidates/.test(t)) return "Results";
  if (/date sheet|time table|exam date|exam schedule|calendar/.test(t)) return "Exam Date";
  if (/admission| counselling|counseling|seat allotment/.test(t)) return "Admission";
  if (/syllabus|exam pattern/.test(t)) return "Syllabus";
  if (/scholarship|fellowship|stipend/.test(t)) return "Scholarship";
  if (/recruit|vacanc|apply online|application form|notification|bharti/.test(t)) return "Latest Jobs";
  return fallback;
}

const ORG_PATTERNS = [
  [/\b(staff selection commission|ssc)\b/i, "Staff Selection Commission (SSC)"],
  [/\b(union public service commission|upsc)\b/i, "Union Public Service Commission (UPSC)"],
  [/\b(institute of banking personnel selection|ibps)\b/i, "IBPS"],
  [/\b(railway recruitment board|rrb)\b/i, "Railway Recruitment Board (RRB)"],
  [/\b(indian railways|railways)\b/i, "Indian Railways"],
  [/\b(national testing agency|nta)\b/i, "National Testing Agency (NTA)"],
  [/\b(central board of secondary education|cbse)\b/i, "CBSE"],
  [/\b(bihar public service commission|bpsc)\b/i, "BPSC"],
  [/\b(university grants commission|ugc)\b/i, "UGC"],
  [/\b(aiims)\b/i, "AIIMS"],
  [/\b(delhi police)\b/i, "Delhi Police"],
  [/\b(isro|indian space research organisation)\b/i, "ISRO"],
  [/\b(drdo)\b/i, "DRDO"],
  [/\b(bhel|bharat electronics)\b/i, "BHEL"],
  [/\b(ntpc)\b/i, "NTPC"],
  [/\b(ongc)\b/i, "ONGC"],
  [/\b(iocl)\b/i, "IOCL"],
  [/\b(bank of baroda|\bbob\b)\b/i, "Bank of Baroda"],
  [/\b(sbi|state bank of india)\b/i, "State Bank of India"],
  [/\b(rbi|reserve bank of india)\b/i, "Reserve Bank of India"],
  [/\b(lic|life insurance corporation)\b/i, "LIC"],
  [/\b(esic)\b/i, "ESIC"],
  [/\b(nhm|national health mission)\b/i, "National Health Mission"],
  [/\b(tgpsc)\b/i, "TGPSC"],
  [/\b(ksrtc)\b/i, "KSRTC"],
  [/\b(uppsc)\b/i, "UPPSC"],
  [/\b(mppsc)\b/i, "MPPSC"],
  [/\b(rpsc)\b/i, "RPSC"],
  [/\b(hpsc)\b/i, "HPSC"],
  [/\b(jssc)\b/i, "JSSC"],
  [/\b(wbpsc)\b/i, "WBPSC"],
  [/\b(tnpsc)\b/i, "TNPSC"],
  [/\b(kpsc)\b/i, "KPSC"],
  [/\b(appsc)\b/i, "APPSC"],
  [/\b(tspsc)\b/i, "TSPSC"],
  [/\b(opsc)\b/i, "OPSC"],
  [/\b(mpsc)\b/i, "MPSC"],
  [/\b(dsssb)\b/i, "DSSSB"],
  [/\b(kvs|kendriya vidyalaya)\b/i, "Kendriya Vidyalaya Sangathan"],
  [/\b(nvs|navodaya)\b/i, "Navodaya Vidyalaya Samiti"],
  [/\b(cisf)\b/i, "CISF"],
  [/\b(crpf)\b/i, "CRPF"],
  [/\b(bsf)\b/i, "BSF"],
  [/\b(itbp)\b/i, "ITBP"],
  [/\b(ssb)\b/i, "SSB"],
  [/\b(nia)\b/i, "NIA"],
  [/\b(cbi)\b/i, "CBI"],
  [/\b(nabard)\b/i, "NABARD"],
  [/\b(sidbi)\b/i, "SIDBI"],
  [/\b(army|indian army)\b/i, "Indian Army"],
  [/\b(navy|indian navy)\b/i, "Indian Navy"],
  [/\b(air force|indian air force)\b/i, "Indian Air Force"],
];

const GENERIC_SOURCES = new Set([
  "State government jobs",
  "Government results",
  "Government admit cards",
  "Government of India",
]);

const ORG_WORDS =
  /(commission|board|ministry|department|council|authority|institute|university|bank|limited|\bltd\b|corporation|agency|office|police|railway|services|bureau|directorate|society|committee|mission|navy|army|force|court|judicature|hospital|college|school)/i;

function looksLikeOrgName(value = "") {
  const candidate = cleanText(value).trim();
  if (!candidate || candidate.length > 60) return false;
  if (/\b(19|20)\d{2}\b/.test(candidate)) return false;
  if (/^(addendum|notice|result|results|marks|recruitment|vacancy|admit card|answer key|exam|examination|public notice|revised|correction|opening|extension|advisory|declaration|display|issuance|inviting)\b/i.test(candidate)) {
    return false;
  }
  if (ORG_WORDS.test(candidate)) return true;
  return /^[A-Z][A-Z&.\- ]{1,12}$/.test(candidate);
}

export function inferOrganization(title = "", fallback = "Government of India") {
  const t = cleanText(title);

  for (const [pattern, name] of ORG_PATTERNS) {
    if (pattern.test(t)) return name;
  }

  // Trailing " - ORGANISATION" pattern used by many news feeds.
  const trailing = t.match(/\s[-–|]\s([A-Za-z0-9&.,'()/ ]{2,45})$/);
  if (trailing && looksLikeOrgName(trailing[1])) {
    return trailing[1].trim();
  }

  const beforeColon = t.split(":")[0];
  if (looksLikeOrgName(beforeColon)) return beforeColon.trim();

  return GENERIC_SOURCES.has(fallback) ? "Government of India" : fallback;
}

export function inferState(title = "") {
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];
  const t = title.toLowerCase();
  return states.find((state) => t.includes(state.toLowerCase())) || "All India";
}

export function inferQualification(title = "") {
  const t = title.toLowerCase();
  const values = [];
  if (/\b10th|matric|high school\b/.test(t)) values.push("10th");
  if (/\b12th|intermediate|senior secondary\b/.test(t)) values.push("12th");
  if (/\bdiploma|polytechnic\b/.test(t)) values.push("Diploma");
  if (/\bgraduate|graduation|bachelor|b\.?a\.?|b\.?sc\.?|b\.?com\.?|b\.?tech\b/.test(t)) values.push("Graduate");
  if (/\bpost graduate|postgraduate|master|m\.?a\.?|m\.?sc\.?|m\.?com\.?|m\.?tech\b/.test(t)) values.push("Post Graduate");
  if (/\bph\.?d|doctorate\b/.test(t)) values.push("PhD");
  if (/\bb\.?ed\b|\bteaching\b|teacher\b/.test(t)) values.push("B.Ed");
  if (/\bnursing|gnm|b\.?sc nursing\b/.test(t)) values.push("Nursing");
  if (/\bengineering|engineer|je\b|ae\b/.test(t)) values.push("Engineering");
  if (/\bllb|law\b/.test(t)) values.push("Law");
  return values.length ? [...new Set(values)] : ["Any"];
}

export function extractVacancies(title = "") {
  const matches = [
    ...String(title).matchAll(/(\d[\d,]*)\s*(?:posts?|vacanc(?:y|ies)|positions?)/gi),
  ];
  if (!matches.length) return null;
  const number = Number(matches[0][1].replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

export function looksLikeUpdate(title = "") {
  const t = cleanText(title).toLowerCase();
  if (!t || t.length < 12) return false;
  if (/^(home|welcome|contact us|about us|untitled|page\s*\d|login|sign in)\b/.test(t)) return false;
  if (isNoise(t)) return false;
  if (t.includes("recruitment")) return true;
  return /(notif|notice|corrigendum|vacanc|exam|result|admit|answer key|admission|scholarship|apply|online form|date sheet|merit|cut.?off|syllabus|bharti|counsell)/.test(
    t,
  );
}

export function isNoise(title = "") {
  const t = cleanText(title).toLowerCase();
  return /(tender|quotation|\bniq\b|empanel|expression of interest|\beoi\b|hotel|auction|scrap|vendor|procurement|hiring of agency|request for proposal|\brfp\b)/.test(
    t,
  );
}

export function makeSummary({ title, organization, category }) {
  const map = {
    "Latest Jobs": "has published a new recruitment notification",
    Results: "has published a result update",
    "Admit Card": "has published an admit card update",
    "Answer Key": "has published an answer key update",
    "Exam Date": "has published an exam date or schedule update",
    Admission: "has published an admission update",
    Syllabus: "has published a syllabus update",
    Scholarship: "has published a scholarship update",
  };
  return `${organization} ${map[category] || "has published a new update"}. Verify the official notification before applying or relying on the details. FollowExam links to the official source and provides a structured summary only.`;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findTermIndex(haystack, term) {
  const clean = String(term || "").toLowerCase().trim();
  if (clean.length < 4) return -1;
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(clean)}([^a-z0-9]|$)`, "i");
  const match = pattern.exec(haystack);
  return match ? match.index : -1;
}

function containsTerm(haystack, term) {
  return findTermIndex(haystack, term) !== -1;
}

export function inferStateFromDb(title = "", states = []) {
  const haystack = ` ${cleanText(title).toLowerCase()} `;
  let best = null;

  for (const state of states) {
    const candidates = [
      state.name,
      ...(state.keywords || []),
      state.psc?.[1],
      state.police?.[1],
      state.board?.[1],
      ...Object.values(state.labels || {}),
    ];
    for (const candidate of candidates) {
      if (!containsTerm(haystack, candidate)) continue;
      const length = String(candidate).length;
      if (!best || length > best.length) best = { state, length };
    }
  }

  return best?.state?.name || "All India";
}

export function matchExam(title = "", exams = []) {
  const haystack = ` ${cleanText(title).toLowerCase()} `;
  let best = null;

  for (const exam of exams) {
    const terms = [exam.name, exam.fullName, ...(exam.searchTerms || []), ...(exam.aliases || [])];
    for (const term of terms) {
      const index = findTermIndex(haystack, term);
      if (index === -1) continue;
      const length = String(term).length;
      const better =
        !best || index < best.index || (index === best.index && length > best.length);
      if (better) best = { exam, length, index };
    }
  }

  return best?.exam || null;
}

export function examTag(exam) {
  if (!exam) return {};
  return {
    examId: exam.id,
    examName: exam.name,
    examStream: exam.stream,
    examScope: exam.scope,
    stateId: exam.stateId || null,
  };
}

export function chunk(array, size) {
  const out = [];
  for (let index = 0; index < array.length; index += size) {
    out.push(array.slice(index, index + size));
  }
  return out;
}
