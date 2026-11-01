import { readJson, slugify, writeJson } from "./lib.mjs";

/**
 * Builds data/exams.json by merging the central exam catalog with
 * state exams derived from data/states.json.
 *
 * Cycle windows are indicative patterns, not official schedules.
 */

const DEFAULT_CYCLES = {
  psc: { notification: [12, 1], apply: [1, 2], exam: [5, 6], result: [9, 10] },
  policeConstable: { notification: [5, 6], apply: [6, 7], exam: [9, 10], result: [12, 1] },
  policeSi: { notification: [5, 6], apply: [6, 7], exam: [9, 10], result: [12, 1] },
  tet: { notification: [2, 3], apply: [3, 4], exam: [6, 7], result: [9, 10] },
  board: { notification: [11, 12], apply: [9, 10], exam: [2, 3], result: [5, 6] },
};

const STREAM_FOR_TYPE = {
  psc: "state",
  policeConstable: "state",
  policeSi: "state",
  tet: "state",
  board: "boards",
};

const QUALIFICATION_FOR_TYPE = {
  psc: ["Graduate"],
  policeConstable: ["10th", "12th"],
  policeSi: ["Graduate"],
  tet: ["Graduate", "B.Ed"],
  board: ["10th", "12th"],
};

const AGE_FOR_TYPE = {
  psc: "21-32 years",
  policeConstable: "18-25 years",
  policeSi: "20-25 years",
  tet: "18+ years",
  board: "School students",
};

function months(value, fallback) {
  const source = Array.isArray(value) && value.length ? value : fallback;
  return [...new Set(source.map(Number).filter((month) => month >= 1 && month <= 12))].sort(
    (a, b) => a - b,
  );
}

function unique(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function searchTerms(exam) {
  const terms = [exam.name, exam.fullName, exam.bodyShort, ...(exam.aliases || [])];
  return unique(
    terms
      .flatMap((term) => {
        const clean = String(term || "")
          .replace(/\s*\([^)]*\)\s*/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return [clean, clean.replace(/\s+/g, " ")];
      })
      .filter((term) => term.length >= 4),
  );
}

function normalizeCycle(cycle, fallback) {
  const source = cycle || {};
  return {
    notification: months(source.notification, fallback.notification),
    apply: months(source.apply, fallback.apply || fallback.notification),
    exam: months(source.exam, fallback.exam),
    result: months(source.result, fallback.result),
  };
}

function centralExam(exam, streams) {
  const stream = streams.find((item) => item.id === exam.stream);
  const normalized = {
    ...exam,
    slug: slugify(exam.id || exam.name),
    scope: "central",
    stateId: null,
    stateName: null,
    region: "All India",
    streamName: stream?.name || exam.stream,
    streamIcon: stream?.icon || "🏛",
    cycle: normalizeCycle(exam.cycle, {
      notification: [1, 2],
      apply: [2, 3],
      exam: [5, 6],
      result: [8, 9],
    }),
    cycleNote:
      "Indicative window based on the exam's usual cycle. Confirm exact dates on the official website.",
    keywords: unique([exam.name, exam.bodyShort, ...(exam.aliases || [])]),
    verified: false,
  };
  normalized.searchTerms = searchTerms(normalized);
  return normalized;
}

function stateExam(state, type, streams, body) {
  const stream = streams.find((item) => item.id === STREAM_FOR_TYPE[type]);
  const labels = state.labels || {};
  const nameByType = {
    psc: labels.psc || `${body?.[1] || state.name} State Service`,
    policeConstable: labels.policeConstable || `${state.name} Police Constable`,
    policeSi: labels.policeSi || `${state.name} Police SI`,
    tet: labels.tet || `${state.name} TET`,
    board: `${body?.[1] || state.name} Board Exams`,
  };
  const fullNameByType = {
    psc: `${body?.[0] || state.name} civil services examination`,
    policeConstable: `${body?.[0] || state.name} constable recruitment`,
    policeSi: `${body?.[0] || state.name} sub-inspector recruitment`,
    tet: `${state.name} Teacher Eligibility Test`,
    board: `${body?.[0] || state.name} class 10 and class 12 board examinations`,
  };
  const id = `${state.id}-${type.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
  const cycle = normalizeCycle(state.cycle?.[type], DEFAULT_CYCLES[type]);
  const exam = {
    id,
    slug: slugify(id),
    name: nameByType[type],
    fullName: fullNameByType[type],
    stream: STREAM_FOR_TYPE[type],
    streamName: stream?.name || "State Government",
    streamIcon: stream?.icon || "📍",
    scope: "state",
    stateId: state.id,
    stateName: state.name,
    region: state.region,
    body: body?.[0] || state.name,
    bodyShort: body?.[1] || state.name,
    level: type === "board" ? "10th / 12th" : type === "psc" ? "Graduate" : type === "tet" ? "B.Ed" : "10th / 12th",
    qualification: QUALIFICATION_FOR_TYPE[type],
    age: AGE_FOR_TYPE[type],
    officialUrl: body?.[2] || state.portal,
    frequency: type === "policeConstable" || type === "policeSi" ? "irregular" : "annual",
    aliases: unique([labels[type], body?.[1]]),
    cycle,
    cycleNote:
      "Indicative state cycle assembled from past recruitment patterns. State boards may shift dates; confirm on the official portal.",
    keywords: unique([labels[type], ...(state.keywords || [])]),
    verified: false,
  };
  exam.searchTerms = searchTerms(exam);
  return exam;
}

const CENTRAL_BOARD_HOSTS = ["cbse.gov.in", "cisce.org", "nios.ac.in"];

function isCentralBoard(entry) {
  if (!entry?.[2]) return false;
  return CENTRAL_BOARD_HOSTS.some((host) => entry[2].includes(host));
}

function deriveStateExams(state, streams) {
  const out = [];
  if (state.psc) out.push(stateExam(state, "psc", streams, state.psc));
  if (state.police) {
    out.push(stateExam(state, "policeConstable", streams, state.police));
    out.push(stateExam(state, "policeSi", streams, state.police));
  }
  if (state.labels?.tet) out.push(stateExam(state, "tet", streams, state.board || state.psc || state.police));
  // CBSE/CISCE/NIOS already exist as central board exams; do not duplicate them per state.
  if (state.board && !isCentralBoard(state.board)) {
    out.push(stateExam(state, "board", streams, state.board));
  }
  return out;
}

async function main() {
  const catalog = await readJson("data/exam-catalog.json");
  const stateData = await readJson("data/states.json");
  const streams = catalog.streams || [];

  const central = (catalog.exams || []).map((exam) => centralExam(exam, streams));
  const stateExams = (stateData.states || []).flatMap((state) => deriveStateExams(state, streams));

  const seen = new Set();
  const exams = [...central, ...stateExams]
    .filter((exam) => {
      if (!exam.id || seen.has(exam.id)) return false;
      seen.add(exam.id);
      return true;
    })
    .sort((a, b) => {
      if (a.scope !== b.scope) return a.scope === "central" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const output = {
    version: 1,
    updated: new Date().toISOString().slice(0, 10),
    note: "FollowExam exam database. Cycle months are indicative patterns, not official schedules. Always verify on the official website.",
    counts: {
      total: exams.length,
      central: exams.filter((exam) => exam.scope === "central").length,
      state: exams.filter((exam) => exam.scope === "state").length,
      streams: streams.length,
      states: (stateData.states || []).length,
    },
    streams,
    exams,
  };

  await writeJson("data/exams.json", output);
  console.log(
    `Built ${output.counts.total} exams (${output.counts.central} central, ${output.counts.state} state) across ${output.counts.states} states/UTs.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
