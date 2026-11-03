# FollowExam

A free, automated portal for Indian government exams and jobs. It discovers official
notifications, publishes them after review with the full details analysed, and sends
Telegram and email alerts. The web app is account-based: the home page is a sign-in
screen, and every update, scholarship, institution and career tool appears after login.

> **Important:** FollowExam is an independent aggregator and is not affiliated with any
> government department. Every post links directly to the official notification — verify
> there before applying. No text or images from other websites are copied.

> **Setting up from scratch?** The complete step-by-step guide is in
> [`SETUP.md`](./SETUP.md), and Play Store publishing is covered in
> [`PLAY_STORE.md`](./PLAY_STORE.md).

---

## 1. What it does

| Feature | How it works |
|---|---|
| Daily discovery | GitHub Actions cron + `scripts/ingest.mjs` (Google News RSS, PIB RSS, UPSC/NTA pages) |
| Admin review | `/admin/` — Firebase Auth + Firestore `pending` queue |
| Publish | Approval moves the job to Firestore `jobs`; the next build renders it |
| Notification analysis | Every job carries highlights, important dates, posts, eligibility, selection process, fees, documents, how to apply and official links |
| Official source link | `notificationUrl` is required and validated for every published job |
| Exam database | `/exams/` — 225 central and state exam cycles with eligibility and official links |
| Institutions | `/institutions/` — 196 IITs, NITs, IIITs, AIIMS, IIMs, NLUs, central and state universities |
| Scholarships | `/scholarships/` — 54 central and state/UT schemes with eligibility, benefits and application steps |
| Career planner | `/career/` — a student picks a goal and gets a stage-by-stage roadmap with matching exams, institutions and scholarships |
| State coverage | `/states/` — 28 states + 8 UTs with PSC, police, TET and board exams |
| Exam calendar | `/calendar/` — 12-month notification, exam and result windows |
| Search and filters | `/jobs/` — Fuse.js client-side search with category, state, exam and qualification filters |
| Category pages | Latest Jobs, Results, Admit Card, Answer Key, Exam Date, Admission, Syllabus, Scholarship |
| Accounts | Firebase Auth (email/password, Google, optional phone), saved updates, alert settings, profile and career preferences |
| Email alerts | Nodemailer + Gmail SMTP, sent **one by one in a loop** (never bulk) |
| Telegram alerts | Bot API, one message per job |
| Installable app | PWA manifest, service worker, offline page and Play Store TWA configuration |
| SEO | Sitemap, JSON-LD (WebSite, JobPosting, CollectionPage), RSS `/feed.xml`, robots.txt |
| Hosting | Firebase Hosting free tier (`*.web.app`) |

**Stack:** Astro 7 (static) · TypeScript · Firebase (Auth, Firestore, Hosting) · GitHub Actions · Nodemailer · Cheerio

---

## 2. Local setup

Requirements: **Node.js 22+**, npm 10+, Git.

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:4321
```

The site runs without Firebase; only login, admin and alerts stay disabled.

Useful commands:

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (`dist/`) — also rebuilds exams, institutions, scholarships and icons |
| `npm run preview` | Preview the production build |
| `npm run ingest` | Discover new notifications into `data/pending.json` |
| `npm run exams:build` | Rebuild `data/exams.json` |
| `npm run institutions:build` | Rebuild `data/institutions.json` |
| `npm run scholarships:build` | Rebuild `data/scholarships.json` |
| `npm run icons:build` | Regenerate PNG app icons and favicon |
| `npm run enrich:jobs` | Add missing analysis fields to jobs |
| `npm run validate` | Check jobs, exams, institutions and scholarships |
| `npm run linkcheck` | Crawl `dist/` for broken internal links |
| `npm run sync` | `data/pending.json` → Firestore `pending` collection |
| `npm run pull` | Approved Firestore jobs → `data/jobs.json` |
| `npm run notify` | Sequential Telegram + email alerts for new jobs |
| `npm run remove-demo` | Remove sample/demo entries from `data/jobs.json` |

---

## 3. Project structure

```
data/
  jobs.json            # published jobs (the site builds from this)
  pending.json         # discovery queue (before admin review)
  sources.json         # source, category and item counts
  exam-catalog.json    # central exam reference
  exams.json           # generated: central + state exams
  institutions.json    # generated: 196 institutions
  scholarships.json    # generated: 54 scholarship schemes
  states.json          # 28 states + 8 UTs: portals, PSC/police/board, cycle overrides
scripts/
  ingest.mjs           # daily discovery pipeline
  lib.mjs              # cleaning, slug, inference and matching helpers
  build-exams.mjs      # exam-catalog.json + states.json → exams.json
  build-institutions.mjs
  build-scholarships.mjs
  build-icons.mjs      # dependency-free PNG icon generator
  enrich-jobs.mjs      # fills analysis fields on jobs
  validate.mjs         # data quality checks
  linkcheck.mjs        # dist/ internal link crawl
  sync.mjs             # pending → Firestore
  pull-approved.mjs    # Firestore → jobs.json
  notify.mjs           # sequential email + Telegram alerts
src/
  pages/               # home, jobs, scholarships, institutions, exams, career, states,
                       # calendar, category, profile, login, admin, account, legal, 404
  components/          # Header, Footer, JobCard, ScholarshipCard, InstitutionCard, AuthGate, ...
  layouts/             # BaseLayout (SEO, JSON-LD, header/footer, PWA, auth gate)
  lib/                 # types, constants, data loaders, firebase, auth, profile, saved jobs
  styles/global.css    # design system
public/
  icons/               # generated PNG icons (192, 512, maskable)
  manifest.webmanifest # PWA manifest
  sw.js                # service worker + offline fallback
  favicon.svg, favicon-32.png, og-image, robots.txt
twa-manifest.json      # bubblewrap configuration for the Play Store app
firestore.rules
firestore.indexes.json
firebase.json
.github/workflows/
  daily.yml            # discovery → sync → pull → build → deploy → notify
  deploy.yml           # build and deploy on push to main
```

---

## 4. Data model

### Jobs

Each published job contains the original summary plus a structured analysis:

- `notificationUrl` — required official notification link
- `highlights`, `importantDates`, `posts`, `selectionProcess`
- `howToApply`, `documents`, `eligibility`, `officialLinks`
- `category`, `state`, `examId`, `qualification`, `organization`, `lastDate`
- `demo: true` on sample entries, which are replaced on the first real pull

### Exams

`data/exams.json` merges two sources:

| File | Role |
|---|---|
| `data/exam-catalog.json` | Central exams — SSC, UPSC, Railways, Banking, Insurance, Regulatory, Teaching, Defence, Medical, Engineering, Law, Entrance, Boards |
| `data/states.json` | 28 states + 8 UTs — official portal, PSC, police board, school board, labels, keywords |
| `scripts/build-exams.mjs` | Merges both and derives state exams |

Every exam record has a name, full name, conducting body, level, qualification, age,
official URL, frequency, aliases and an **indicative** cycle:

```json
"cycle": { "notification": [4, 5], "apply": [4, 6], "exam": [9, 10], "result": [11, 12] }
```

> These months are historical patterns, not an official schedule. Each exam page says
> so clearly and asks the visitor to confirm on the official website.

### Institutions and scholarships

`scripts/build-institutions.mjs` generates 196 institutions across 23 IITs, 31 NITs,
20 IIITs, 19 AIIMS, 20 IIMs, 20 NLUs, 37 central universities and 26 state universities.
Each record includes type, state, official links, accepted exams and admission routes.
Every state and union territory now has at least one institution, and the scholarship
dataset covers all 36 states and UTs.

`scripts/build-scholarships.mjs` generates 54 schemes: 18 central and 36 state/UT.
Each record includes level, category, benefits, eligibility, documents, application
window and official links.

---

## 5. How discovery works

```
Official sources ──► ingest.mjs ──► data/pending.json ──► Firestore pending
                                                              │
                                                     Admin review (/admin)
                                                              │ approve
                                                              ▼
                                            Firestore jobs (status=published)
                                                              │
                                              pull-approved.mjs
                                                              ▼
                                            data/jobs.json ──► Astro build
                                                              │
                                                    deployed site + alerts
```

- **Dedupe:** title + organisation hash, so the same update is not published twice.
- **Noise filter:** tenders, quotations, EOIs and hotel empanelment notices are skipped.
- **Recency filter:** HTML sources keep only notices whose date is within `MAX_AGE_DAYS`
  (30 by default), and the sync step removes unreviewed queue entries older than that
  window. Approved and rejected entries stay as review history.
- **Exam and state awareness:** `ingest.mjs` prioritises exams whose notification, apply,
  exam or result window is active this month, then rotates through the rest.
- **Automatic analysis:** when an approved job is pulled from Firestore, any analysis
  fields the admin did not fill are generated from the notification metadata —
  highlights, important dates, posts, selection stages, application steps, documents,
  eligibility and official links. Admin edits always take priority.
- **Demo data:** `data/jobs.json` ships with `"demo": true` entries. The site shows a
  “Sample” badge and a top banner. Remove them before launch.

---

## 6. Firebase setup (free)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication** → enable **Email/Password** and **Google**.
3. **Build → Firestore Database** → create in **production mode**, region `asia-south1`.
4. **Project settings → Your apps → Web** → register the app and copy the config into
   `.env` and GitHub **Variables**:

   ```
   PUBLIC_FIREBASE_API_KEY=...
   PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
   PUBLIC_FIREBASE_PROJECT_ID=<project>
   PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   PUBLIC_FIREBASE_APP_ID=...
   ```

5. **Service account** for server scripts: Project settings → **Service accounts** →
   **Generate new private key**, then paste the whole JSON as one line into the
   `FIREBASE_SERVICE_ACCOUNT` GitHub secret. Add `FIREBASE_PROJECT_ID` too.
6. Copy `.firebaserc.example` to `.firebaserc` and set the project id.
7. Deploy rules and indexes:

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```

8. Deploy hosting. **Do not run `firebase init`** — the config already exists:

   ```bash
   npm run build
   npx firebase-tools deploy --only hosting --project followupdates
   ```

   The site is served at `https://<project-id>.web.app`.

### Create an admin

1. Create an account at `/account/` or add a user in Firebase Console → Authentication.
2. Copy the user's **UID**.
3. Firestore → create collection `admins` → document ID = that UID → field `email`.
4. Open `/admin/` and sign in.

> Admin access is checked against the `admins/{uid}` document on every page load.

---

## 7. GitHub setup

1. Repository: **https://github.com/surakshasavingssociety-sketch/followupdates**
2. **Settings → Secrets and variables → Actions**

   > ✅ Firebase public config, project id, site URL, the service account, SMTP credentials
   > and query counts are already set. The daily pipeline has run successfully and writes
   > discovered notifications to the admin queue.
   > ⛔ Still empty: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `PUBLIC_TELEGRAM_URL`.
   > Without Telegram the site still updates and email alerts work; only Telegram posts are skipped.

   **Secrets**

   | Secret | Value |
   |---|---|
   | `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (one line) |
   | `FIREBASE_PROJECT_ID` | `followupdates` |
   | `SITE_URL` | `https://followupdates.web.app` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_SECURE` | `true` |
   | `SMTP_USER` | your Gmail address |
   | `SMTP_PASS` | Gmail **App Password** |
   | `MAIL_FROM` | `FollowExam <yourgmail@gmail.com>` |
   | `EMAIL_DELAY_MS` | `1500` |
   | `MAX_EMAILS_PER_RUN` | `350` |
   | `NOTIFY_LOOKBACK_DAYS` | `7` |
   | `TELEGRAM_BOT_TOKEN` | BotFather token |
   | `TELEGRAM_CHAT_ID` | channel/group chat id |

   **Variables:** `PUBLIC_SITE_URL`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_TELEGRAM_URL`, all
   `PUBLIC_FIREBASE_*`, plus `EXAM_QUERIES_PER_RUN` (`8`) and `STATE_QUERIES_PER_RUN` (`6`).

3. **Actions → Daily update pipeline → Run workflow** for the first manual run.
4. Cron runs daily at **02:00 UTC (07:30 IST)**. Edit `.github/workflows/daily.yml` to change it.

### Gmail App Password

1. Google Account → Security → enable **2-Step Verification**.
2. Security → **App passwords** → app `Mail`, device `Other` → copy the 16-character password.
3. Put it in `SMTP_PASS`.

**Email loop:** `scripts/notify.mjs` builds a separate digest per subscriber, sends them
one at a time in a `for` loop, waits `EMAIL_DELAY_MS` between sends and stops at
`MAX_EMAILS_PER_RUN`. Each success updates `lastNotifiedAt`, so a capped or failed run
resumes next time without duplicate emails. Telegram tracks `telegramNotified` per job.

### Telegram bot

1. Telegram → **@BotFather** → `/newbot` → copy the token.
2. Add the bot as **admin** in your channel or group.
3. Find the chat id from a post link such as `https://t.me/c/1234567890/45` → `-1001234567890`,
   or from `https://api.telegram.org/bot<TOKEN>/getUpdates`.
4. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as secrets.

---

## 8. Web app and Play Store

- The manifest is at `public/manifest.webmanifest`; icons are generated by
  `scripts/build-icons.mjs`.
- `public/sw.js` caches the app shell, uses network-first navigation and shows an offline
  page when the connection drops. It registers only in production builds.
- `twa-manifest.json` configures a Trusted Web Activity with package id
  `app.web.followupdates.twa`, so web deploys update the installed app without a new APK.
- Full publishing steps, signing, Digital Asset Links, store listing and the 14-day
  closed-testing rule are in [`PLAY_STORE.md`](./PLAY_STORE.md).

---

## 9. Free tier limits (approximate)

| Service | Free limit | FollowExam usage |
|---|---|---|
| Firebase Hosting | 10 GB storage, 360 MB/day transfer | Static site — plenty |
| Firestore | 1 GiB storage, 50k reads / 20k writes per day | Jobs + subscribers |
| Firebase Auth | 50k MAU (email/Google) | Free |
| GitHub Actions | 2,000 min/month (private) or unlimited (public) | ~5–8 min/day |
| Gmail SMTP | ~500 recipients/day (Workspace 2,000) | Controlled by `MAX_EMAILS_PER_RUN` |
| Telegram Bot API | Free | Practically unlimited |

If traffic or the subscriber list grows, move to a paid tier or an email provider with a
free allowance such as Brevo or Resend.

---

## 10. Launch checklist

- [ ] `.env` and GitHub secrets/variables are filled in
- [ ] Firestore rules are deployed
- [ ] An admin user exists with an `admins/{uid}` document
- [ ] 3–5 real entries approved from `/admin/` and deployed
- [ ] All `"demo": true` entries removed from `data/jobs.json`
- [ ] No demo banner on the home page
- [ ] Email test: subscribe your address and run `npm run notify`
- [ ] Telegram test message received
- [ ] `/feed.xml`, `/sitemap-index.xml`, `/robots.txt` load
- [ ] Google Search Console property added
- [ ] About, Contact, Privacy and Disclaimer reviewed
- [ ] PWA install prompt works on Android
- [ ] Play Store test account and Data safety form prepared

**Remove demo data:**

```bash
npm run remove-demo
npm run validate
npm run build
```

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `Admin panel: Firebase setup required` | `PUBLIC_FIREBASE_*` values missing or invalid; restart the dev server |
| `Access denied` on `/admin/` | `admins/{uid}` document missing or UID wrong |
| `Missing or insufficient permissions` | Deploy rules: `npx firebase-tools deploy --only firestore:rules` |
| Firestore index error | Create the index from the console link or deploy `firestore.indexes.json` |
| `HTTP 403` during ingest | Some official sites block bots. Headers are already browser-like; if it persists, remove that source from `data/sources.json` |
| Email not sending | Use a Gmail App Password with 2FA on; match `SMTP_SECURE`/port (465 → true, 587 → false) |
| Telegram 400 | Wrong chat id, or the bot is not a channel admin |
| 404 on hosting | `firebase.json` must point `"public": "dist"` and keep `trailingSlash: true`; deploy after building |
| Old links use a custom domain | Update `PUBLIC_SITE_URL`, `astro.config.mjs`, `public/robots.txt` and redeploy |
| Address bar visible in the Android app | Add `public/.well-known/assetlinks.json` with the Play signing SHA-256 |

---

## 12. Custom domain (later)

1. Firebase Hosting → **Add custom domain** and verify ownership.
2. Add the DNS `A`/`TXT` records Firebase provides.
3. Set `PUBLIC_SITE_URL=https://yourdomain.com` in `.env` and GitHub variables.
4. Update the sitemap URL in `public/robots.txt` and redeploy.

The free `.web.app` subdomain keeps working.

---

## 13. Design and content rules

- All design, logos and illustrations are original.
- Every post is a short original summary plus the official source link. No copied long
  text, images or hosted PDFs.
- Source-site branding is not used.
- Facts (dates, fees, vacancies) are checked against the official notification; admin
  review is the final gate.
- Visitor-facing copy is fully English, with no Hinglish.
- Legal pages: `/about/`, `/contact/`, `/privacy/`, `/disclaimer/`.

---

## 14. Roadmap

- Department-wise landing pages for search
- Saved-search alerts (state + qualification)
- Weekly digest email
- Result and answer-key PDF link extraction
- Admin analytics (approval rate, top sources)
- Push notifications via Firebase Cloud Messaging
- Notification history on exam pages
- Hindi interface option (only after the English experience is complete)

---

**License:** Code is for this project only. Content is informational; the official
notification is always the authoritative source.
