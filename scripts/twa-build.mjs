/**
 * Builds the TWA APK and AAB non-interactively.
 *
 * Reads the keystore password from `.keystore-password.txt` (git-ignored) or the
 * BUBBLEWRAP_KEYSTORE_PASSWORD / BUBBLEWRAP_KEY_PASSWORD environment variables.
 *
 * Usage: node scripts/twa-build.mjs
 */
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const androidDir = path.join(projectRoot, "android");
const passwordFile = path.join(projectRoot, ".keystore-password.txt");

if (!fs.existsSync(androidDir)) {
  console.error("android/ not found. Run `npm run twa:init` first.");
  process.exit(1);
}

let keystorePassword = process.env.BUBBLEWRAP_KEYSTORE_PASSWORD;
let keyPassword = process.env.BUBBLEWRAP_KEY_PASSWORD;

if ((!keystorePassword || !keyPassword) && fs.existsSync(passwordFile)) {
  const stored = fs.readFileSync(passwordFile, "utf8").trim();
  keystorePassword = keystorePassword || stored;
  keyPassword = keyPassword || stored;
}

if (!keystorePassword || !keyPassword) {
  console.error(
    "Keystore password missing. Add it to .keystore-password.txt or set BUBBLEWRAP_KEYSTORE_PASSWORD and BUBBLEWRAP_KEY_PASSWORD.",
  );
  process.exit(1);
}

const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
const bubblewrapCmd = path.join(path.dirname(globalRoot), "bubblewrap.cmd");
if (!fs.existsSync(bubblewrapCmd)) {
  console.error("Bubblewrap CLI not found. Run `npm install -g @bubblewrap/cli`.");
  process.exit(1);
}

const command = `"${bubblewrapCmd}" build --directory . --manifest twa-manifest.json`;

// Bubblewrap builds Java command strings without quoting the JDK path, so a JDK
// installed under "C:\Program Files" breaks apksigner/jarsigner. Prefer a
// space-free JDK (configured in ~/.bubblewrap/config.json) when available.
let jdkPath = process.env.JAVA_HOME || "";
try {
  const bubblewrapConfig = path.join(
    process.env.USERPROFILE || process.env.HOME || "",
    ".bubblewrap",
    "config.json",
  );
  if (fs.existsSync(bubblewrapConfig)) {
    const parsed = JSON.parse(fs.readFileSync(bubblewrapConfig, "utf8"));
    if (parsed.jdkPath && fs.existsSync(path.join(parsed.jdkPath, "bin", "java.exe"))) {
      jdkPath = parsed.jdkPath;
    }
  }
} catch {
  // Fall back to the current JAVA_HOME.
}

const env = {
  ...process.env,
  BUBBLEWRAP_KEYSTORE_PASSWORD: keystorePassword,
  BUBBLEWRAP_KEY_PASSWORD: keyPassword,
};
if (jdkPath && !jdkPath.includes(" ")) {
  const pathValue = `${path.join(jdkPath, "bin")};${env.PATH || env.Path || ""}`;
  env.JAVA_HOME = jdkPath;
  env.PATH = pathValue;
  env.Path = pathValue;
}

const result = spawnSync(command, {
  stdio: "inherit",
  shell: true,
  cwd: androidDir,
  env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("\nBuild finished:");
console.log(`  APK: ${path.join(androidDir, "app-release-signed.apk")}`);
console.log(`  AAB: ${path.join(androidDir, "app-release-bundle.aab")}`);
