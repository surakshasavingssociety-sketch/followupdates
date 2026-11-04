import type { ResumeEducation, ResumeExperience, ResumeProject, UserProfile } from "./types";
import { statusGroup } from "./profile";

type ResumeInput = Partial<UserProfile>;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function nonEmpty(values?: Array<string | undefined | null>): string[] {
  return (values || []).map((value) => clean(value)).filter(Boolean);
}

function safeUrl(value: unknown): string {
  const link = clean(value);
  if (!link) return "";
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function linkHtml(value: unknown, label?: string): string {
  const href = safeUrl(value);
  if (!href) return "";
  const text = escapeHtml(label || href.replace(/^https?:\/\//, ""));
  return `<a href="${escapeHtml(href)}">${text}</a>`;
}

function section(title: string, body: string): string {
  if (!body) return "";
  return `<section class="block"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function experienceBlock(items?: ResumeExperience[]): string {
  const rows = (items || []).filter((item) => item && clean(item.role || item.organization || item.description));
  if (!rows.length) return "";
  return rows
    .map((item) => {
      const title = escapeHtml(clean(item.role) || clean(item.organization) || "Role");
      const org = clean(item.organization) && clean(item.role) ? escapeHtml(clean(item.organization)) : "";
      const period = escapeHtml(clean(item.period));
      return `<article class="entry">
        <div class="entry-head">
          <h3>${title}${org ? ` <span class="at">· ${org}</span>` : ""}</h3>
          ${period ? `<span class="period">${period}</span>` : ""}
        </div>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </article>`;
    })
    .join("");
}

function educationBlock(items: ResumeEducation[] | undefined, profile: ResumeInput): string {
  const rows = (items || []).filter((item) => item && clean(item.qualification || item.institution));
  if (!rows.length) {
    const fallback = nonEmpty([profile.educationLevel, profile.stream, profile.institutionName || profile.organizationName]);
    if (!fallback.length) return "";
    return `<article class="entry"><div class="entry-head"><h3>${escapeHtml(fallback[0])}</h3></div>
      ${fallback.length > 1 ? `<p>${escapeHtml(fallback.slice(1).join(" · "))}</p>` : ""}</article>`;
  }
  return rows
    .map((item) => {
      const title = escapeHtml(clean(item.qualification) || "Qualification");
      const meta = nonEmpty([item.institution, item.year, item.score]).map(escapeHtml).join(" · ");
      return `<article class="entry">
        <div class="entry-head"><h3>${title}</h3>${item.year ? `<span class="period">${escapeHtml(clean(item.year))}</span>` : ""}</div>
        ${meta ? `<p>${meta}</p>` : ""}
      </article>`;
    })
    .join("");
}

function projectBlock(items?: ResumeProject[]): string {
  const rows = (items || []).filter((item) => item && clean(item.name || item.description || item.link));
  if (!rows.length) return "";
  return rows
    .map((item) => {
      const name = escapeHtml(clean(item.name) || "Project");
      const link = linkHtml(item.link);
      return `<article class="entry">
        <div class="entry-head"><h3>${name}${link ? ` <span class="at">· ${link}</span>` : ""}</h3></div>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </article>`;
    })
    .join("");
}

function listBlock(items?: string[]): string {
  const rows = nonEmpty(items);
  if (!rows.length) return "";
  return `<ul class="pill-list">${rows.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul>`;
}

function contactItems(profile: ResumeInput): string[] {
  const items: string[] = [];
  if (clean(profile.email)) items.push(linkHtml(`mailto:${clean(profile.email)}`, clean(profile.email)));
  if (clean(profile.phone)) items.push(`<span>${escapeHtml(profile.phone)}</span>`);
  if (clean(profile.stateName)) items.push(`<span>${escapeHtml(profile.stateName)}</span>`);
  const portfolio = linkHtml(profile.portfolio, "Portfolio");
  if (portfolio) items.push(portfolio);
  return items.filter(Boolean);
}

/**
 * Build a self-contained, print-ready resume from the FollowExam profile.
 * Every value is escaped, so it is safe to render into an iframe or a new tab.
 */
export function buildResumeHtml(profile: ResumeInput): string {
  const name = clean(profile.name) || "FollowExam member";
  const group = statusGroup(profile.userStatus);
  const headline = clean(profile.headline) || nonEmpty([profile.userStatus, profile.careerGoal]).join(" · ");

  const contact = contactItems(profile);
  const summary = clean(profile.summary)
    ? `<section class="block summary"><h2>Profile</h2><p>${escapeHtml(profile.summary)}</p></section>`
    : "";

  const teaching = group === "educator"
    ? section(
        "Teaching profile",
        `<div class="facts">
          ${clean(profile.institutionName) ? `<div><span>Institution</span><strong>${escapeHtml(profile.institutionName)}</strong></div>` : ""}
          ${clean(profile.qualifications) ? `<div><span>Qualification</span><strong>${escapeHtml(profile.qualifications)}</strong></div>` : ""}
          ${clean(profile.teachingExperience) ? `<div><span>Experience</span><strong>${escapeHtml(profile.teachingExperience)}</strong></div>` : ""}
          ${nonEmpty(profile.subjects).length ? `<div><span>Subjects</span><strong>${escapeHtml(nonEmpty(profile.subjects).join(", "))}</strong></div>` : ""}
        </div>`,
      )
    : "";

  const organisation = group === "organisation"
    ? section(
        "Organisation",
        `<div class="facts">
          ${clean(profile.organizationName) ? `<div><span>Organisation</span><strong>${escapeHtml(profile.organizationName)}</strong></div>` : ""}
          ${clean(profile.organizationType) ? `<div><span>Type</span><strong>${escapeHtml(profile.organizationType)}</strong></div>` : ""}
          ${clean(profile.organizationAccreditation) ? `<div><span>Recognition</span><strong>${escapeHtml(profile.organizationAccreditation)}</strong></div>` : ""}
          ${safeUrl(profile.organizationWebsite) ? `<div><span>Website</span><strong>${linkHtml(profile.organizationWebsite)}</strong></div>` : ""}
        </div>
        ${clean(profile.organizationAbout) ? `<p class="org-about">${escapeHtml(profile.organizationAbout)}</p>` : ""}`,
      )
    : "";

  const skills = section("Skills", listBlock(profile.skills));
  const experience = section("Experience", experienceBlock(profile.experience));
  const education = section("Education", educationBlock(profile.educationHistory, profile));
  const projects = section("Projects", projectBlock(profile.projects));
  const certifications = section("Certifications", listBlock(profile.certifications));
  const achievements = section("Achievements", listBlock(profile.achievements));
  const languages = section("Languages", listBlock(profile.languages));

  const generatedOn = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(name)} — Resume</title>
<style>
  :root { color-scheme: only light; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #eef2f8; }
  body {
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #17222f;
    font-size: 13px;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  main {
    width: min(820px, 100%);
    margin: 20px auto;
    background: #fff;
    border: 1px solid #dde5ef;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 18px 40px rgba(15, 35, 60, 0.08);
  }
  header {
    padding: 30px 38px 24px;
    background: linear-gradient(135deg, #0b4f9c 0%, #0d63c2 62%, #f08a24 140%);
    color: #fff;
  }
  header .eyebrow {
    margin: 0 0 6px;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.85;
    font-weight: 700;
  }
  header h1 { margin: 0; font-size: 30px; line-height: 1.1; letter-spacing: -0.01em; }
  header .headline { margin: 6px 0 0; font-size: 14px; font-weight: 600; opacity: 0.92; }
  header ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    padding: 0;
    margin: 14px 0 0;
    font-size: 12px;
  }
  header a { color: #fff; text-decoration: underline; text-underline-offset: 2px; }
  .body { padding: 26px 38px 34px; }
  .block { margin: 0 0 20px; }
  .block:last-child { margin-bottom: 0; }
  .block h2 {
    margin: 0 0 9px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0b4f9c;
    border-bottom: 1px solid #e2e9f2;
    padding-bottom: 5px;
    font-weight: 800;
  }
  .summary p { margin: 0; color: #33465c; }
  .entry { margin: 0 0 12px; }
  .entry:last-child { margin-bottom: 0; }
  .entry-head { display: flex; justify-content: space-between; gap: 14px; align-items: baseline; }
  .entry h3 { margin: 0; font-size: 13.5px; }
  .entry .at { font-weight: 600; color: #4b607a; }
  .entry .period { color: #6a7c92; font-size: 11.5px; white-space: nowrap; font-weight: 600; }
  .entry p { margin: 3px 0 0; color: #41546a; font-size: 12.5px; }
  .entry p a { color: #0b4f9c; }
  .pill-list { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0; }
  .pill-list li {
    border: 1px solid #d7e2ef;
    background: #f4f8fd;
    color: #22405f;
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 11.5px;
    font-weight: 600;
  }
  .facts { display: grid; gap: 4px; }
  .facts div { display: flex; gap: 8px; font-size: 12.5px; }
  .facts span { color: #6a7c92; min-width: 92px; }
  .facts strong { font-weight: 600; color: #22364d; }
  .facts a { color: #0b4f9c; }
  .org-about { margin: 8px 0 0; color: #41546a; font-size: 12.5px; }
  footer {
    padding: 12px 38px 18px;
    color: #8394a8;
    font-size: 10.5px;
    border-top: 1px solid #eef2f8;
  }
  @page { size: A4; margin: 12mm; }
  @media print {
    html, body { background: #fff; }
    main { width: 100%; margin: 0; border: 0; border-radius: 0; box-shadow: none; }
    header { border-radius: 0; }
    .block { break-inside: avoid; }
    .entry { break-inside: avoid; }
  }
  @media (max-width: 560px) {
    header { padding: 22px 20px 18px; }
    header h1 { font-size: 24px; }
    .body { padding: 20px; }
    footer { padding: 10px 20px 16px; }
  }
</style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Curriculum Vitae</p>
      <h1>${escapeHtml(name)}</h1>
      ${headline ? `<p class="headline">${escapeHtml(headline)}</p>` : ""}
      ${contact.length ? `<ul>${contact.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
    </header>
    <div class="body">
      ${summary}
      ${teaching}
      ${organisation}
      ${experience}
      ${education}
      ${projects}
      ${skills}
      ${certifications}
      ${achievements}
      ${languages}
    </div>
    <footer>Generated from the FollowExam profile · ${escapeHtml(generatedOn)} · followupdates.web.app</footer>
  </main>
</body>
</html>`;
}

/** File-safe resume name, e.g. "asha-kumari-resume.html". */
export function resumeFileName(profile: ResumeInput, extension = "html"): string {
  const base = (clean(profile.name) || "followexam-resume")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "followexam"}-resume.${extension}`;
}
