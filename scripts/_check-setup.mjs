import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const projectId = "followupdates";
const projectNumber = "454412451234";
const store = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), ".config", "configstore", "firebase-tools.json"), "utf8"),
);
let token = store.tokens.access_token;
if (!token || Number(store.tokens.expires_at || 0) < Date.now() + 60000) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: store.tokens.refresh_token,
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(`token refresh failed: ${res.status} ${JSON.stringify(json)}`);
  token = json.access_token;
}

// Try listing OAuth clients
const urls = [
  `https://oauth2.googleapis.com/v1/projects/${projectNumber}/oauthClients`,
  `https://oauth2.googleapis.com/v1/projects/${projectNumber}/brands`,
];
for (const url of urls) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  console.log(url, "->", res.status);
  console.log(text.slice(0, 1500));
}
