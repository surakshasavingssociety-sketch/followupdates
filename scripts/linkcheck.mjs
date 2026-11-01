import fs from "node:fs";
import path from "node:path";

/**
 * Crawls the built site in dist/ and reports internal links that point to
 * pages or assets which do not exist. External URLs are not fetched.
 */

const dist = path.join(process.cwd(), "dist");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function exists(target) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(path.join(target, "index.html"))) return true;
  return false;
}

if (!fs.existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

const files = walk(dist);
const pages = files.filter((file) => file.endsWith(".html"));
const broken = [];
let checked = 0;

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const rel = path.relative(dist, page).replace(/\\/g, "/");
  const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const href of hrefs) {
    if (!href || href.startsWith("#")) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(href)) continue;
    checked += 1;

    const clean = href.split("#")[0].split("?")[0];
    if (!clean) continue;
    const decoded = decodeURIComponent(clean);
    const target = decoded.startsWith("/")
      ? path.join(dist, decoded)
      : path.resolve(path.dirname(page), decoded);

    if (!exists(target)) broken.push({ page: rel, href });
  }
}

const unique = [...new Set(broken.map((item) => `${item.href}  <- ${item.page}`))];

if (unique.length) {
  console.error(`\n${unique.length} broken internal link(s) across ${pages.length} pages:`);
  for (const line of unique.slice(0, 60)) console.error(`  × ${line}`);
  if (unique.length > 60) console.error(`  … and ${unique.length - 60} more`);
  process.exitCode = 1;
} else {
  console.log(`✓ ${checked} internal links checked across ${pages.length} pages — 0 broken.`);
}
