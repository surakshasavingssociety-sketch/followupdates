/**
 * Generates the Android (TWA) project from the canonical `twa-manifest.json`
 * without the interactive Bubblewrap prompts.
 *
 * Usage: node scripts/twa-init.mjs
 *
 * Requires `@bubblewrap/cli` installed globally (`npm install -g @bubblewrap/cli`).
 * The generated `android/` folder is a local build artifact and is git-ignored.
 */
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceManifest = path.join(projectRoot, "twa-manifest.json");
const outDir = path.join(projectRoot, "android");

function loadBubblewrapCore() {
  const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
  const cliEntry = path.join(globalRoot, "@bubblewrap", "cli", "dist", "lib", "cmds", "init.js");
  if (!fs.existsSync(cliEntry)) {
    throw new Error(
      "Bubblewrap CLI not found. Install it with: npm install -g @bubblewrap/cli",
    );
  }
  return createRequire(cliEntry)("@bubblewrap/core");
}

async function main() {
  if (!fs.existsSync(sourceManifest)) {
    throw new Error("twa-manifest.json not found in project root.");
  }

  const { TwaManifest, TwaGenerator, ConsoleLog } = loadBubblewrapCore();
  const manifest = await TwaManifest.fromFile(sourceManifest);

  // The generated project lives in android/, so point the signing key to the
  // repository-root keystore with an absolute path (local build only).
  const keystore = path.join(projectRoot, "android.keystore");
  if (!fs.existsSync(keystore)) {
    throw new Error("android.keystore not found. Create it before generating the TWA project.");
  }
  manifest.signingKey.path = keystore;
  manifest.generatorApp = "bubblewrap-cli";

  fs.mkdirSync(outDir, { recursive: true });
  const generatedManifest = path.join(outDir, "twa-manifest.json");
  await manifest.saveToFile(generatedManifest);

  // Bubblewrap compares the manifest against this checksum before building.
  const crypto = await import("node:crypto");
  const checksum = crypto.createHash("sha1").update(fs.readFileSync(generatedManifest)).digest("hex");
  fs.writeFileSync(path.join(outDir, "manifest-checksum.txt"), checksum);

  const generator = new TwaGenerator();
  const log = new ConsoleLog("twa");
  await generator.createTwaProject(outDir, manifest, log, (current, total) => {
    const pct = Math.round((current / total) * 100);
    if (pct % 25 === 0) process.stdout.write(`\rGenerating Android project… ${pct}%`);
  });
  process.stdout.write("\n");

  console.log(`TWA project generated at ${outDir}`);
  console.log("Next: npm run twa:build");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
