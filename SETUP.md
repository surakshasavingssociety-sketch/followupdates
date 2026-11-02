# FollowExam — Step-by-step setup guide

This guide takes you from zero to a live deployment. Each step also lists what to check
before moving on.

**Total time:** ~45–60 minutes
**Cost:** ₹0 (Firebase Spark plan, GitHub free, Gmail SMTP free, Telegram free)

## Progress status

| Step | Status |
|---|---|
| 0. Tools (Node, Git, browser) | ✅ Done |
| 1. Firebase project + web config | ✅ Done (`followupdates`) |
| 1.6 Firestore rules + indexes deploy | ✅ Done |
| 2. Service account JSON | ⛔ **Pending** — needed for real data pull |
| 3. GitHub repo + Actions secrets/variables | ✅ Done (repo public, defaults set) |
| 3.4 Remaining secrets (`FIREBASE_SERVICE_ACCOUNT`, `SMTP_*`, `TELEGRAM_*`) | ⛔ **Pending** |
| 4. Gmail app password | ⛔ **Pending** |
| 5. Telegram bot + channel | ⛔ **Pending** |
| 6.2 Hosting deploy | ✅ Done → https://followupdates.web.app |
| 6.3 Admin account + `admins/{uid}` doc | ⛔ **Pending** |
| 6.5 First real job publish | ⛔ **Pending** (the site currently shows 12 demo jobs) |
| 7. PWA + Play Store | ⛔ **Pending** (config and runbook ready) |

> ⚠️ Never commit `.env`, the service-account JSON or app passwords to GitHub. The
> commands in this guide are safe.

---

## 0. Install the prerequisites

| Item | How to check | If missing |
|---|---|---|
| Node.js 22+ | `node -v` | Install the LTS build from [nodejs.org](https://nodejs.org) |
| Git | `git --version` | `winget install --id Git.Git -e --source winget` |
| Browser | Chrome/Edge | — |

After installing Git, close the terminal, open a new PowerShell window and run
`git --version` again.

Open the project folder:

```powershell
cd "C:\Users\tinte\Documents\Default Project"
npm install
Copy-Item .env.example .env
```

---

## 1. Firebase project + web config

> ✅ **Already done.** Project ID: **`followupdates`**. `.env` and `.firebaserc` already
> point to it. The steps below are for a new project only.

### 1.1 Create the project

1. Open [console.firebase.google.com](https://console.firebase.google.com) and sign in.
2. Click **Add project** / **Create a project**.
3. Project name: `followexam` (or any available name). Firebase creates a project ID such
   as `followexam-2026`. **Copy and note that ID.**
4. Google Analytics: you can **disable** it. Continue → Create project.

### 1.2 Register the web app

1. Inside the project, open ⚙️ **Project settings** → **General**.
2. Under **Your apps**, click the Web icon `</>`.
3. App nickname: `FollowExam Web`. Leave **Firebase Hosting** unchecked for now.
4. **Register app** → copy the `firebaseConfig` object:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "followupdates.firebaseapp.com",
  projectId: "followupdates",
  storageBucket: "followupdates.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

5. Put the values in `.env` (`notepad .env`):

```env
PUBLIC_FIREBASE_API_KEY=AIza...
PUBLIC_FIREBASE_AUTH_DOMAIN=followupdates.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=followupdates
PUBLIC_FIREBASE_STORAGE_BUCKET=followupdates.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> Older projects use `appspot.com` for `storageBucket`; newer ones use
> `firebasestorage.app`. Paste exactly what the console shows.

### 1.3 Enable Authentication

1. Left menu → **Build** → **Authentication** → **Get started**.
2. **Sign-in method** tab:
   - **Email/Password** → Enable → Save.
   - **Google** → Enable → choose a project support email → Save.
   - **Phone** → optional. It needs the Blaze plan for SMS quota on most projects.

### 1.4 Create Firestore

1. Left menu → **Build** → **Firestore Database** → **Create database**.
2. Choose **Production mode** (rules are deployed later).
3. Location: **asia-south1 (Mumbai)**. ⚠️ This cannot be changed later.
4. Create.

### 1.5 Set the project ID in files

```powershell
Copy-Item .firebaserc.example .firebaserc
notepad .firebaserc
```

```json
{
  "projects": {
    "default": "followupdates"
  }
}
```

And in `.env`:

```env
PUBLIC_SITE_URL=https://followupdates.web.app
PUBLIC_CONTACT_EMAIL=youremail@gmail.com
SITE_URL=https://followupdates.web.app
```

### 1.6 Deploy rules and indexes

> **Do not run `firebase init`.** The project already contains `firebase.json`,
> `firestore.rules` and `firestore.indexes.json`. `firebase init` is interactive and
> fails in non-interactive terminals with
> `does not have a default and cannot be answered` — it is not needed.

```powershell
npx firebase-tools@latest login
npx firebase-tools@latest deploy --only firestore:rules,firestore:indexes --project followupdates
```

A Google login opens in the browser. Afterwards, Firebase Console → Firestore →
**Rules** should show the deployed rules.

---

## 2. Service account JSON (for server scripts)

1. Firebase Console → ⚙️ **Project settings** → **Service accounts**.
2. **Generate new private key** → **Generate key** → a JSON file downloads.
3. Keep the file **outside the project folder** (for example in Downloads). Never commit it.
4. Convert it to **one line** for the GitHub secret:

```powershell
$json = Get-Content "$HOME\Downloads\followupdates-firebase-adminsdk-xxxxx.json" -Raw |
        ConvertFrom-Json |
        ConvertTo-Json -Compress
$json | Set-Clipboard
```

The JSON is now on the clipboard in one-line form. Paste it into the
`FIREBASE_SERVICE_ACCOUNT` secret in **Step 3.4**.

> To run `npm run sync/pull/notify` locally, paste the one-line JSON after
> `FIREBASE_SERVICE_ACCOUNT=` in `.env`, or set `GOOGLE_APPLICATION_CREDENTIALS` to the
> JSON file path.

**Security:** never share the JSON. If it leaks, delete the key in Service accounts and
generate a new one.

---

## 3. GitHub repo + Actions secrets

### 3.1 Install Git (if needed)

```powershell
winget install --id Git.Git -e --source winget
```

Close the terminal, open a new PowerShell window, then run:

```powershell
git --version
```

### 3.2 Create the GitHub repo

> ✅ **Already done.** The repo is public:
> **https://github.com/surakshasavingssociety-sketch/followupdates**
> GitHub CLI (`gh`) is installed and authenticated.

To create a new repo:

1. Open [github.com/new](https://github.com/new).
2. Repository name: `followexam`.
3. Choose **Public** (public repos get unlimited free Actions minutes).
4. **Create repository** (do not add a README or gitignore).

### 3.3 Push the code

> ✅ **`main` is already pushed.** Run this only for a fresh clone:

```powershell
git clone https://github.com/surakshasavingssociety-sketch/followupdates.git
cd followexam
npm install
```

The first push opens a browser login — sign in to GitHub.

> `node_modules`, `dist` and `.env` are ignored by `.gitignore`. Only source files should
> appear on GitHub.

### 3.4 Add GitHub Secrets

> ✅ **Non-sensitive defaults are already set** (`FIREBASE_PROJECT_ID`, `SITE_URL`,
> `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `MAIL_FROM`, `EMAIL_DELAY_MS`,
> `MAX_EMAILS_PER_RUN`, `NOTIFY_LOOKBACK_DAYS`).
> ⛔ **These are still empty and must be added:** `FIREBASE_SERVICE_ACCOUNT`, `SMTP_USER`,
> `SMTP_PASS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `PUBLIC_TELEGRAM_URL`.

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Secrets** →
**New repository secret**.

| Secret name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | The one-line JSON from Step 2 |
| `FIREBASE_PROJECT_ID` | `followupdates` |
| `SITE_URL` | `https://followupdates.web.app` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail **App Password** (Step 4) |
| `MAIL_FROM` | `FollowExam <youremail@gmail.com>` |
| `EMAIL_DELAY_MS` | `1500` |
| `MAX_EMAILS_PER_RUN` | `350` |
| `NOTIFY_LOOKBACK_DAYS` | `7` |
| `TELEGRAM_BOT_TOKEN` | BotFather token (Step 5) |
| `TELEGRAM_CHAT_ID` | `@yourchannel` or `-100...` (Step 5) |

### 3.5 Add GitHub Variables

> ✅ **All variables are already set** (Firebase public config, site URL, contact email,
> query counts).

Same page → **Variables** tab → **New repository variable**.

| Variable name | Value |
|---|---|
| `PUBLIC_SITE_URL` | `https://followupdates.web.app` |
| `PUBLIC_CONTACT_EMAIL` | Your contact email |
| `PUBLIC_TELEGRAM_URL` | `https://t.me/yourchannel` (or blank) |
| `PUBLIC_FIREBASE_API_KEY` | From the Firebase config |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | From the Firebase config |
| `PUBLIC_FIREBASE_PROJECT_ID` | From the Firebase config |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | From the Firebase config |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From the Firebase config |
| `PUBLIC_FIREBASE_APP_ID` | From the Firebase config |
| `EXAM_QUERIES_PER_RUN` | `8` (optional — exam-cycle searches per run) |
| `STATE_QUERIES_PER_RUN` | `6` (optional — state-wise searches per run) |

> Secrets are private (service account, passwords). Variables are public web config.
> Both are required.

---

## 4. Gmail app password (email alerts)

1. Open [myaccount.google.com/security](https://myaccount.google.com/security).
2. Turn on **2-Step Verification** if it is not already on.
3. Go back to Security → **App passwords** (also available inside 2-Step Verification).
4. App name: `FollowExam` → **Create**.
5. Copy the 16-character password (without spaces).
6. Paste it into the GitHub secret `SMTP_PASS`.

> A normal Gmail password will not work. Workspace admins can block app passwords — in
> that case use a personal Gmail account.

**Limit:** free Gmail allows roughly 500 recipients/day. The code stops at
`MAX_EMAILS_PER_RUN=350` and covers remaining subscribers on the next run.

---

## 5. Telegram bot + channel

### 5.1 Create the bot

1. Open **@BotFather** in Telegram → `/newbot`.
2. Bot name: `FollowExam Alerts`.
3. Username: `followexam_alerts_bot` (must be unique).
4. Copy the token: `123456789:AAH...` — this is `TELEGRAM_BOT_TOKEN`.

### 5.2 Create the channel

1. Telegram → **New Channel** → name `FollowExam Updates` → make it public.
2. Note the channel username, for example `@followexamupdates`.
3. Channel → **Administrators** → **Add Administrator** → add your bot → keep
   **Post messages** enabled.

### 5.3 Chat ID

**Public channel (easy):** `TELEGRAM_CHAT_ID=@followexamupdates`

**Private channel:** make the bot an admin, post one message in the channel, then open:

```text
https://api.telegram.org/bot<TOKEN>/getUpdates
```

The response contains `"chat":{"id":-1001234567890}`. Use that ID.

### 5.4 Test

```powershell
$token = "YOUR_TOKEN"
$chat = "@followexamupdates"
Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$token/sendMessage" `
  -Body @{ chat_id = $chat; text = "FollowExam test message ✅" }
```

If the message arrives in the channel, the setup is correct.

---

## 6. Site URL, first deploy and admin

### 6.1 Local build test

```powershell
npm run validate
npm run build
npm run linkcheck
npm run preview
```

The site should open at `http://localhost:4322`. Restart the preview after changing `.env`.

> `npm run build` runs `prebuild`, which regenerates `data/exams.json`,
> `data/institutions.json`, `data/scholarships.json` and the PNG icons. Use the individual
> `exams:build`, `institutions:build`, `scholarships:build` or `icons:build` scripts when
> you only need one.

### 6.2 Deploy Firestore rules + Hosting

> ✅ **Already done** — rules and indexes deployed, hosting live.

```powershell
npx firebase-tools@latest deploy --only firestore:rules,firestore:indexes,hosting --project followupdates
```

Site: `https://followupdates.web.app`

### 6.3 Create the admin account

1. Firebase Console → **Authentication** → **Users** → **Add user**.
2. Email: your admin email. Password: a strong password.
3. After creating the user, copy the **UID**.
4. Firebase Console → **Firestore Database** → **Start collection**:
   - Collection ID: `admins`
   - Document ID: **that UID**
   - Field: `email` (string) = admin email
   - Save.
5. Open `/admin/` on the site and sign in. The pending queue should appear.

> If `/admin/` shows “Firebase setup required”, the `PUBLIC_FIREBASE_*` values are missing
> from GitHub Variables or `.env`. The change takes effect after a rebuild.

### 6.4 First GitHub Actions run

1. GitHub repo → **Actions** tab.
2. **Deploy site** → **Run workflow** → `main` → Run.
3. After the green tick, check the live site.
4. **Daily update pipeline** → **Run workflow** to test discovery + sync + build + deploy.

> A push runs “Deploy site” automatically. If the first push happened before secrets were
> added, the workflow fails — add the secrets and use **Re-run**.

### 6.5 Publish the first real job

1. `/admin/` → **Pending** tab → edit an entry (verify title, dates and official URL) →
   **Approve**.
2. GitHub Actions → **Daily update pipeline** → **Run workflow**.
3. The workflow pulls approved jobs from Firestore, builds and deploys the site, then sends
   Telegram and email alerts.
4. The job appears on the site.

> After the first real approval, `data/jobs.json` is replaced from Firestore and the demo
> entries disappear automatically. Until then the site shows the demo banner.

### 6.6 Test checklist

- [ ] `/` shows the sign-in screen when signed out
- [ ] Sign-in with email/password or Google opens the dashboard
- [ ] Signed-out visits to `/jobs/`, `/scholarships/` and `/career/` redirect to `/login/?next=...`
- [ ] `/jobs/` search and filters work
- [ ] `/exams/` search and stream groups work
- [ ] An exam page such as `/exams/nda-defence/` opens
- [ ] `/institutions/` search, state filter and type groups work
- [ ] `/scholarships/` level and category filters work
- [ ] `/career/` goal picker switches the roadmap and recommendations
- [ ] `/profile/` saves the profile and updates the completion meter
- [ ] `/states/` and your state page (`/states/bihar/` etc.) open
- [ ] `/calendar/` central/state filter works
- [ ] Job detail Save and Share buttons work, and the notification link opens the official source
- [ ] The subscribe form accepts your email
- [ ] A Telegram test alert arrives
- [ ] A digest email arrives (check spam too)
- [ ] `/admin/` approve/reject works
- [ ] `/feed.xml`, `/sitemap-index.xml` and `/robots.txt` load
- [ ] The PWA install prompt appears on Android
- [ ] `/sw.js` and `/manifest.webmanifest` return 200 in production

### 6.7 Update the reference data

**Add a central exam:**

1. Add an object to the `exams` array in `data/exam-catalog.json` (`id`, `name`,
   `fullName`, `stream`, `body`, `bodyShort`, `level`, `qualification`, `age`,
   `officialUrl`, `frequency`, `aliases`, `cycle`).
2. `npm run exams:build` → `npm run validate`.
3. `npm run build` → the exam is live at `/exams/<slug>/`.

**Update a state/UT or body:**

1. Edit the state object in `data/states.json` (`psc`, `police`, `board`, `labels`,
   optional `cycle`).
2. `npm run exams:build` regenerates the state exams.

**Change cycle months:** update `cycle.notification/apply/exam/result` arrays in
`exam-catalog.json` (1–12). These are indicative windows, not official dates, so the
disclaimer stays on every page.

**Add an institution or scholarship:** edit the source arrays in
`scripts/build-institutions.mjs` or `scripts/build-scholarships.mjs`, then run the
matching build script and `npm run validate`.

---

## 7. PWA and Play Store

1. Icons: `npm run icons:build` writes `public/icons/*.png` and `public/favicon-32.png`.
2. Manifest: `public/manifest.webmanifest` (name, icons, shortcuts, standalone display).
3. Service worker: `public/sw.js` (network-first pages, cached assets, offline fallback).
4. TWA config: `twa-manifest.json` (package id `app.web.followupdates.twa`, version code 1).
5. Follow [`PLAY_STORE.md`](./PLAY_STORE.md) for signing, `bubblewrap build`, Digital
   Asset Links, store listing, the Data safety form, the test account and the 14-day
   closed-testing rule.

Before uploading:

```powershell
npm run icons:build
npm run build
npx firebase-tools deploy --only hosting --project followupdates
```

---

## Common problems

| Problem | Fix |
|---|---|
| “Firebase setup required” on `/admin/` | `PUBLIC_FIREBASE_*` missing from `.env` or GitHub Variables. Rebuild and redeploy |
| “Access denied” after admin login | `admins/{uid}` document missing or the UID is wrong |
| `Missing or insufficient permissions` | Rules not deployed — repeat Step 1.6 |
| Firestore index error | Deploy `firestore.indexes.json`, or create the index from the console link |
| Email not sending | Turn on Gmail 2FA and use an App Password; with port 465 set `SMTP_SECURE=true` |
| Telegram 400 | The bot is not a channel admin, or the chat ID is wrong |
| GitHub Actions fails | Check secret/variable spelling; `FIREBASE_SERVICE_ACCOUNT` must be one-line JSON |
| 404 on hosting | `firebase.json` must keep `"public": "dist"`; deploy after building |
| `firebase init` asks an unanswerable question | Skip `firebase init` — the config exists. Run `npx firebase-tools deploy ... --project followupdates` |
| `Could not find a project` | `.firebaserc` must set `default` to `followupdates`, or pass `--project followupdates` |
| The site shows old content | Browser/CDN cache; wait 2–3 minutes or hard refresh |
| Demo entries still visible | They disappear after the first real approval + daily workflow, or run `npm run remove-demo` |
| Address bar visible in the Android app | Add `.well-known/assetlinks.json` with the Play signing SHA-256 |
| Login works but content stays hidden | Check the browser console for Firebase config errors; the auth gate needs a successful `onAuthStateChanged` |

---

## Security rules to remember

- Never commit or share `.env` or the service-account JSON.
- Keep the GitHub repo public only if you are comfortable with the source being visible;
  secrets stay in GitHub Secrets either way.
- Use a strong admin password and enable 2FA.
- If the service-account key leaks, delete it and generate a new one immediately.
- Do not go live without deployed Firestore rules.

---

## Custom domain (later)

1. Firebase Console → **Hosting** → **Add custom domain**.
2. Verify the domain and add the DNS records Firebase provides.
3. Update `PUBLIC_SITE_URL=https://yourdomain.com` in `.env` and GitHub Variables.
4. Update the sitemap URL in `public/robots.txt`.
5. Redeploy.

The free `*.web.app` URL keeps working.
