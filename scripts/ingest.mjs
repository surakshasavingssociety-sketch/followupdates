import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import {
  absoluteUrl,
  cleanText,
  createSeenIndex,
  examTag,
  extractVacancies,
  inferCategory,
  inferOrganization,
  inferQualification,
  inferState,
  inferStateFromDb,
  isoDate,
  isRecent,
  looksLikeUpdate,
  makeId,
  makeSummary,
  matchExam,
  readJson,
  rememberEntry,
  slugify,
  writeJson,
} from "./lib.mjs";

const USER_AGENT =
  "FollowExamBot/1.0 (+https://followupdates.web.app; government exam notification aggregator)";
const MAX_AGE_DAYS = Number(process.env.MAX_AGE_DAYS || 30);
const EXAM_QUERIES_PER_RUN = Number(process.env.EXAM_QUERIES_PER_RUN || 8);
const STATE_QUERIES_PER_RUN = Number(process.env.STATE_QUERIES_PER_RUN || 6);

let examIndex = [];
let stateIndex = [];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,application/rss+xml;q=0.9,text/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-IN,en;q=0.9",
        referer: "https://www.google.com/",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseRss(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "#cdata",
  });
  const parsed = parser.parse(xml);
  return asArray(parsed?.rss?.channel?.item || parsed?.feed?.entry || []);
}

function rssText(value) {
  if (value == null) return "";
  if (typeof value === "string") return cleanText(value);
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return rssText(value[0]);
  if (typeof value === "object") {
    if ("#text" in value) return rssText(value["#text"]);
    if ("#cdata" in value) return rssText(value["#cdata"]);
  }
  return cleanText(String(value));
}

function rssLink(item) {
  if (!item) return "";
  if (typeof item.link === "string") return item.link;
  if (Array.isArray(item.link)) {
    const alternate = item.link.find((entry) => entry?.["@_rel"] === "alternate") || item.link[0];
    return alternate?.["@_href"] || "";
  }
  if (item.link?.["@_href"]) return item.link["@_href"];
  return rssText(item.guid);
}

function dateFromNoticeUrl(url = "") {
  const match = String(url).match(/Notice_(\d{4})(\d{2})(\d{2})/i);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

const PUBLISHER_SUFFIXES = [
  "news on air",
  "times of india",
  "the times of india",
  "hindustan times",
  "ndtv",
  "india today",
  "the hindu",
  "indian express",
  "economic times",
  "business standard",
  "livemint",
  "zee news",
  "zeenews",
  "abp live",
  "aaj tak",
  "news18",
  "firstpost",
  "the wire",
  "scroll.in",
  "deccan herald",
  "telegraph india",
  "tribune india",
  "free press journal",
  "jagran",
  "amar ujala",
  "dainik bhaskar",
  "sarkari result",
  "sarkariresult",
  "govt job",
  "government job",
];

function cleanHeadline(title, sourceName = "") {
  let value = cleanText(title);
  value = value.replace(/\s*[-|–]\s*[^-|–]{1,45}$/u, (match) => {
    const suffix = match.replace(/^\s*[-|–]\s*/u, "").toLowerCase();
    if (sourceName && suffix.includes(sourceName.toLowerCase())) return "";
    if (PUBLISHER_SUFFIXES.some((publisher) => suffix.includes(publisher))) return "";
    if (/^(ssc|upsc|ibps|rrb|nta|cbse|ugc|aiims|bpsc|govt|government|official)$/i.test(suffix)) {
      return "";
    }
    return match;
  });
  return value.replace(/\s+/g, " ").trim();
}

function monthDistance(months = [], month) {
  if (!months.length) return 99;
  return Math.min(
    ...months.map((value) => {
      const diff = Math.abs(Number(value) - month);
      return Math.min(diff, 12 - diff);
    }),
  );
}

function currentPhase(exam, month) {
  let best = null;
  for (const phase of ["notification", "apply", "exam", "result"]) {
    const distance = monthDistance(exam.cycle?.[phase], month);
    if (distance <= 1 && (!best || distance < best.distance)) best = { phase, distance };
  }
  return best;
}

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86_400_000);
}

function rotate(list, offset, limit) {
  if (!list.length) return [];
  const start = offset % list.length;
  const out = [];
  for (let index = 0; index < Math.min(limit, list.length); index += 1) {
    out.push(list[(start + index) % list.length]);
  }
  return out;
}

function buildCycleQueries(exams, month, offset) {
  const active = exams
    .filter((exam) => exam.scope === "central" && currentPhase(exam, month))
    .sort((a, b) => {
      const distance = currentPhase(a, month).distance - currentPhase(b, month).distance;
      return distance || a.name.localeCompare(b.name);
    });
  const rest = exams
    .filter((exam) => exam.scope === "central" && !currentPhase(exam, month))
    .sort((a, b) => a.name.localeCompare(b.name));

  const chosen = [
    ...rotate(active, offset, EXAM_QUERIES_PER_RUN),
    ...rotate(rest, offset * 3, Math.max(0, EXAM_QUERIES_PER_RUN - Math.min(active.length, EXAM_QUERIES_PER_RUN))),
  ].slice(0, EXAM_QUERIES_PER_RUN);

  return chosen.map((exam) => {
    const phase = currentPhase(exam, month)?.phase;
    const focus =
      phase === "notification"
        ? "notification OR apply online"
        : phase === "apply"
          ? "apply online OR last date"
          : phase === "exam"
            ? "exam date OR admit card"
            : phase === "result"
              ? "result OR answer key"
              : "recruitment OR notification OR admit card OR result";
    return {
      name: `Exam cycle: ${exam.name}${phase ? ` (${phase})` : ""}`,
      query: `"${exam.name}" ${focus}`,
      category: phase === "result" ? "Results" : phase === "exam" ? "Exam Date" : "Latest Jobs",
      maxItems: 6,
      examHint: exam.id,
    };
  });
}

function buildStateQueries(states, offset) {
  return rotate(states, offset, STATE_QUERIES_PER_RUN).map((state) => ({
    name: `State: ${state.name}`,
    query: `"${state.name}" (government job OR recruitment OR admit card OR result OR exam date)`,
    category: "Latest Jobs",
    maxItems: 6,
    stateHint: state.name,
  }));
}

function buildPending({
  title,
  url,
  postDate,
  sourceName,
  sourceUrl,
  category,
  discoveryUrl,
  rawTitle,
  examHint,
  stateHint,
}) {
  const cleanTitle = cleanHeadline(title, sourceName);
  const organization = inferOrganization(cleanTitle, sourceName);
  const resolvedCategory = inferCategory(cleanTitle, category);
  const matchedExam =
    matchExam(cleanTitle, examIndex) ||
    (examHint ? examIndex.find((exam) => exam.id === examHint) : null);
  const resolvedState =
    matchedExam?.stateName ||
    (stateHint && stateIndex.some((state) => state.name === stateHint) ? stateHint : "") ||
    inferStateFromDb(cleanTitle, stateIndex) ||
    inferState(cleanTitle);
  const now = new Date().toISOString();
  return {
    id: makeId(sourceName, cleanTitle, postDate || now.slice(0, 10)),
    slug: slugify(cleanTitle).slice(0, 90),
    title: cleanTitle,
    organization,
    category: resolvedCategory,
    state: resolvedState,
    qualification: inferQualification(cleanTitle),
    vacancies: extractVacancies(cleanTitle),
    postDate: isoDate(postDate) || now.slice(0, 10),
    applyStart: null,
    applyEnd: null,
    examDate: null,
    fee: {},
    age: {},
    salary: "",
    summary: makeSummary({
      title: cleanTitle,
      organization,
      category: resolvedCategory,
    }),
    officialUrl: url || sourceUrl,
    notificationUrl: url || sourceUrl,
    sourceName,
    sourceUrl,
    status: "pending",
    discoveredAt: now,
    discoveryUrl: discoveryUrl || url,
    rawTitle: cleanText(rawTitle || title),
    ...examTag(matchedExam),
    createdAt: now,
    updatedAt: now,
  };
}

async function ingestGoogleNews(config, existingKeys) {
  const query = encodeURIComponent(config.query);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
  const xml = await fetchText(url);
  const items = parseRss(xml);
  const out = [];

  for (const item of items.slice(0, config.maxItems || 15)) {
    const rawTitle = rssText(item.title);
    const title = cleanHeadline(rawTitle, config.name);
    if (!title || !looksLikeUpdate(title)) continue;
    if (!isRecent(rssText(item.pubDate), MAX_AGE_DAYS)) continue;
    if (title.startsWith("http")) continue;

    const source = item.source || {};
    const sourceUrl =
      (typeof source === "object" && source["@_url"]) ||
      (typeof source === "string" ? source : "") ||
      "";
    if (!rememberEntry(existingKeys, title, inferOrganization(title, config.name))) continue;

    out.push(
      buildPending({
        title,
        url: sourceUrl || rssLink(item),
        postDate: rssText(item.pubDate),
        sourceName: config.name,
        sourceUrl,
        category: config.category,
        discoveryUrl: rssLink(item),
        rawTitle,
        examHint: config.examHint,
        stateHint: config.stateHint,
      }),
    );
  }
  return out;
}

async function ingestRss(config, existingKeys) {
  const xml = await fetchText(config.url);
  const items = parseRss(xml);
  const out = [];
  const include = (config.includeKeywords || []).map((value) => value.toLowerCase());

  for (const item of items.slice(0, config.maxItems || 20)) {
    const title = cleanHeadline(rssText(item.title), config.name);
    const description = rssText(item.description || item.summary);
    const haystack = `${title} ${description}`.toLowerCase();
    if (!title || !looksLikeUpdate(title)) continue;
    if (include.length && !include.some((keyword) => haystack.includes(keyword))) continue;
    if (!isRecent(rssText(item.pubDate || item.updated), MAX_AGE_DAYS)) continue;

    const link = rssLink(item);
    if (!rememberEntry(existingKeys, title, inferOrganization(title, config.name))) continue;

    out.push(
      buildPending({
        title,
        url: link,
        postDate: rssText(item.pubDate || item.updated),
        sourceName: config.name,
        sourceUrl: config.url,
        category: config.category,
        discoveryUrl: link,
        rawTitle: rssText(item.title),
      }),
    );
  }
  return out;
}

async function ingestHtml(config, existingKeys) {
  const candidates = [config.url, ...(config.fallbackUrls || [])].filter(Boolean);
  let html = "";
  let loadedUrl = config.url;
  let lastError = null;
  for (const candidate of candidates) {
    try {
      html = await fetchText(candidate);
      loadedUrl = candidate;
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  const $ = cheerio.load(html);
  const out = [];

  $(config.itemSelector).each((_, element) => {
    if (out.length >= (config.maxItems || 15)) return;
    const item = $(element);
    const linkElement = item.find(config.linkSelector).first();
    const titleElement = item.find(config.titleSelector).first();
    const title = cleanHeadline(titleElement.text() || linkElement.text(), config.name);
    const href = linkElement.attr("href") || "";
    if (!title || !href || !looksLikeUpdate(title)) return;

    const url = absoluteUrl(href, config.baseUrl || loadedUrl);
    const noticeDate = dateFromNoticeUrl(url);
    if (noticeDate && !isRecent(noticeDate, MAX_AGE_DAYS)) return;
    if (!rememberEntry(existingKeys, title, inferOrganization(title, config.name))) return;

    out.push(
      buildPending({
        title,
        url,
        postDate: noticeDate || new Date().toISOString(),
        sourceName: config.name,
        sourceUrl: config.baseUrl || loadedUrl,
        category: config.category,
        discoveryUrl: url,
        rawTitle: title,
      }),
    );
  });

  return out;
}

async function main() {
  const sources = await readJson("data/sources.json");
  const jobs = await readJson("data/jobs.json", []);
  const pending = await readJson("data/pending.json", []);
  const examData = await readJson("data/exams.json", { exams: [] });
  const stateData = await readJson("data/states.json", { states: [] });

  examIndex = examData.exams || [];
  stateIndex = stateData.states || [];

  for (const item of pending) {
    if (item.status !== "pending") continue;
    const matched = matchExam(item.title, examIndex);
    if (matched) {
      Object.assign(item, examTag(matched));
      if (matched.stateName) item.state = matched.stateName;
    } else {
      delete item.examId;
      delete item.examName;
      delete item.examStream;
      delete item.examScope;
      delete item.stateId;
    }
  }

  const existingKeys = createSeenIndex([...jobs, ...pending]);

  const month = new Date().getMonth() + 1;
  const offset = dayOfYear();
  const cycleQueries = buildCycleQueries(examIndex, month, offset);
  const stateQueries = buildStateQueries(stateIndex, offset);
  const googleNews = [...(sources.googleNews || []), ...cycleQueries, ...stateQueries];

  const results = [];
  const errors = [];

  const tasks = [
    ...googleNews.filter((config) => config.enabled !== false).map((config) => ({
      label: `Google News: ${config.name}`,
      run: () => ingestGoogleNews(config, existingKeys),
    })),
    ...(sources.rss || []).filter((config) => config.enabled !== false).map((config) => ({
      label: `RSS: ${config.name}`,
      run: () => ingestRss(config, existingKeys),
    })),
    ...(sources.html || []).filter((config) => config.enabled !== false).map((config) => ({
      label: `HTML: ${config.name}`,
      run: () => ingestHtml(config, existingKeys),
    })),
  ];

  const disabledSources = [...(sources.googleNews || []), ...(sources.rss || []), ...(sources.html || [])]
    .filter((config) => config.enabled === false)
    .map((config) => config.name);

  for (const task of tasks) {
    try {
      const items = await task.run();
      results.push(...items);
      console.log(`✓ ${task.label}: ${items.length} new`);
    } catch (error) {
      errors.push({ source: task.label, error: error.message });
      console.warn(`✗ ${task.label}: ${error.message}`);
    }
  }

  const allPending = [...results, ...pending]
    .sort((a, b) => String(b.discoveredAt).localeCompare(String(a.discoveredAt)))
    .slice(0, 500);

  await writeJson("data/pending.json", allPending);
  await writeJson("data/ingest-report.json", {
    runAt: new Date().toISOString(),
    newItems: results.length,
    totalPending: allPending.length,
    cycleQueries: cycleQueries.map((query) => query.name),
    stateQueries: stateQueries.map((query) => query.name),
    disabledSources,
    errors,
  });

  console.log(`\nDone. ${results.length} new pending items, ${allPending.length} total pending.`);
  if (errors.length) console.log(`${errors.length} source(s) failed; see data/ingest-report.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
