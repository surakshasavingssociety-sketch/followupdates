# FollowExam

Free, automated Indian government exam & job update portal. Official sources se notifications discover karta hai, admin review ke baad publish karta hai, aur Telegram + email alerts bhejta hai.

> **Important:** FollowExam ek independent aggregator hai. Kisi government department se affiliated nahi hai. Har post me official notification ka direct link hota hai — apply se pehle wahan verify karein. Doosri websites ka content copy nahi kiya jata.

> **Naya setup kar rahe hain?** Poora step-by-step guide yahan hai: [`SETUP.md`](./SETUP.md) — Firebase project se live deploy tak.

---

## 1. Kya kaam karta hai

| Feature | Kaise |
|---|---|
| Daily auto discovery | GitHub Actions cron + `scripts/ingest.mjs` (Google News RSS, PIB RSS, UPSC/NTA HTML) |
| Admin review panel | `/admin/` — Firebase Auth + Firestore `pending` queue |
| Publish | Approve hone par job Firestore `jobs` me jata hai, agli build me site par |
| Exam database | `/exams/` — 224 central + state exam cycles, eligibility, official links |
| State coverage | `/states/` — 28 states + 8 UTs ke PSC, police, TET aur board exams |
| Exam calendar | `/calendar/` — 12-month notification, exam aur result windows |
| Search & filters | `/jobs/` — Fuse.js client-side search, category/state/exam/qualification filters |
| Category pages | Latest Jobs, Results, Admit Card, Answer Key, Exam Date, Admission, Syllabus, Scholarship |
| Email alerts | Nodemailer + Gmail SMTP, **ek-ek karke loop me** (bulk nahi) |
| Telegram alerts | Bot API, per-job message |
| User accounts | Firebase Auth (email/password + Google), saved jobs, alert settings |
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

Firebase ke bina bhi site chalegi — sirf login/admin/alerts disabled rahenge.

Useful commands:

| Command | Kya karta hai |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Build preview |
| `npm run ingest` | Naye notifications dhoondh kar `data/pending.json` me likhta hai |
| `npm run exams:build` | `data/exams.json` rebuild (central catalog + state exams) |
| `npm run validate` | `data/jobs.json`, `data/exams.json`, `data/states.json` check |
| `npm run linkcheck` | Build ke baad internal links check |
| `npm run sync` | `data/pending.json` → Firestore `pending` collection |
| `npm run pull` | Firestore ke approved jobs → `data/jobs.json` |
| `npm run notify` | Un-notified jobs ke Telegram + email alerts |
| `npm run remove-demo` | `data/jobs.json` se sample/demo entries hatata hai |

---

## 3. Project structure

```
data/
  jobs.json          # published jobs (site yahi se build hoti hai)
  pending.json       # discovery queue (admin review se pehle)
  sources.json       # konsa source, kaunsi category, kitne items
  exam-catalog.json  # central exam reference (naam, body, indicative cycle months)
  exams.json         # generated: central + state exams (build-exams.mjs)
  states.json        # 28 states + 8 UTs: portals, PSC/police/board, cycle overrides
scripts/
  ingest.mjs         # daily discovery pipeline (exam + state aware queries)
  lib.mjs            # cleaning, slug, inference, exam/state matching helpers
  build-exams.mjs    # exam-catalog.json + states.json → exams.json
  validate.mjs       # data quality checks (jobs, exams, states)
  linkcheck.mjs      # dist/ internal link crawl
  sync.mjs           # pending → Firestore
  pull-approved.mjs  # Firestore → jobs.json
  notify.mjs         # sequential email + Telegram alerts
src/
  pages/             # home, jobs, exams, states, calendar, category, admin, account, legal, 404
  components/        # Header, Footer, JobCard, ExamCard, StateCard, CycleTimeline, SubscribeForm
  layouts/           # BaseLayout (SEO, JSON-LD, header/footer)
  lib/               # types, constants, jobs/exams/states loaders, firebase client, saved jobs
  styles/global.css  # design system
public/              # favicon, OG image, manifest, robots.txt
.github/workflows/
  daily.yml          # discovery → sync → pull → build → deploy → notify
  deploy.yml         # push to main par build & deploy
firestore.rules      # security rules
firestore.indexes.json
firebase.json
```

---

## 4. Exam database & state coverage

Site ki core reference `data/exams.json` hai, jo do jagah se banti hai:

| File | Role |
|---|---|
| `data/exam-catalog.json` | Central exams — SSC, UPSC, Railways, Banking, Insurance, Regulatory, Teaching, Defence, Medical, Engineering, Law, Entrance, Boards |
| `data/states.json` | 28 states + 8 UTs — official portal, PSC, police board, school board, labels, keywords |
| `scripts/build-exams.mjs` | Dono ko merge karke state exams derive karta hai → `data/exams.json` |

Har exam record me hota hai: naam, full name, conducting body, level, qualification, age, official URL, frequency, aliases, aur **indicative** cycle:

```json
"cycle": { "notification": [4, 5], "apply": [4, 6], "exam": [9, 10], "result": [11, 12] }
```

> Ye months historical pattern hain — official schedule nahi. Har exam page par ye baat clearly likhi hoti hai aur official website verify karne ko kaha jata hai.

State exams (PSC, police constable, SI, TET, board) `states.json` se automatically generate hote hain, isliye naya state add karna = sirf ek entry add karna, phir `npm run exams:build`.

### Ingestion exam/state aware kaise hai

`scripts/ingest.mjs` har run par:

1. `data/exams.json` aur `data/states.json` load karta hai.
2. Current month ke hisaab se un central exams ko chunta hai jinka notification/apply/exam/result window abhi active hai (phase ke hisaab se query badalti hai — notification, last date, admit card, result).
3. Baaki exams aur states ko rotation se cover karta hai (`EXAM_QUERIES_PER_RUN`, `STATE_QUERIES_PER_RUN`).
4. Har naye item par title se exam match karke `examId`, `examName`, `examStream`, `examScope`, `stateId` tag lagata hai.

Isse roz fixed queries repeat nahi hoti, aur jis exam ka season chal raha hai uski updates pehle pakdi jaati hain.

---

## 5. Content pipeline

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

- **Dedupe:** title + organization hash. Same update dobara nahi aata.
- **Noise filter:** tender, quotation, EOI, hotel empanelment jaise non-exam notices skip hote hain.
- **Demo data:** `data/jobs.json` me `"demo": true` items hain. Site par "Sample" badge aur top banner dikhta hai. Launch se pehle delete karein.

---

## 6. Firebase setup (free)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → naam `followupdates` (ya jo available ho) → Google Analytics optional.
2. **Build → Authentication** → Get started → Sign-in method:
   - Email/Password enable
   - Google enable (optional, admin Google login ke liye)
3. **Build → Firestore Database** → Create database → **production mode** → region `asia-south1` (Mumbai).
4. **Project settings ⚙ → Your apps → Web (`</>`)** → app register karein → config copy karein:
   ```
   PUBLIC_FIREBASE_API_KEY=...
   PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
   PUBLIC_FIREBASE_PROJECT_ID=<project>
   PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   PUBLIC_FIREBASE_APP_ID=...
   ```
   Ye values local `.env` me aur GitHub **Variables** me daalein (secret nahi, public hain).
5. **Service account** (server scripts ke liye):
   - Project settings → **Service accounts** → **Generate new private key**
   - JSON file ka poora content ek line me GitHub secret `FIREBASE_SERVICE_ACCOUNT` me paste karein.
   - `FIREBASE_PROJECT_ID` secret bhi add karein.
6. `.firebaserc.example` ko `.firebaserc` banayein aur project id daalein.
7. Rules + indexes deploy:
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```
8. **Hosting** enable: `npx firebase-tools init hosting` ki zaroorat nahi — `firebase.json` ready hai. Pehla deploy:
   ```bash
   npm run build
   npx firebase-tools deploy --only hosting
   ```
   Site milegi: `https://<project-id>.web.app`

### Admin banao

1. Site par `/account/` se ya Firebase Console → Authentication → **Add user** se apna email/password account banayein.
2. Authentication me user ka **UID** copy karein.
3. Firestore → **Start collection** `admins` → Document ID = wahi UID → field `email` (string) → Save.
4. `/admin/` khol kar login karein. Bas.

> Admin check har page load par `admins/{uid}` document se hota hai. Isliye UID exact hona chahiye.

---

## 7. GitHub setup

1. Repo banayein aur code push karein:
   ```bash
   git init
   git add .
   git commit -m "feat: FollowExam v1"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. **Settings → Secrets and variables → Actions**

   **Secrets** (private):

   | Secret | Value |
   |---|---|
   | `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (ek line) |
   | `FIREBASE_PROJECT_ID` | `followupdates` |
   | `SITE_URL` | `https://<project>.web.app` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_SECURE` | `true` |
   | `SMTP_USER` | aapka Gmail |
   | `SMTP_PASS` | Gmail **App Password** (normal password nahi) |
   | `MAIL_FROM` | `FollowExam <yourgmail@gmail.com>` |
   | `EMAIL_DELAY_MS` | `1500` |
   | `MAX_EMAILS_PER_RUN` | `350` |
| `NOTIFY_LOOKBACK_DAYS` | `7` |
   | `TELEGRAM_BOT_TOKEN` | BotFather token |
   | `TELEGRAM_CHAT_ID` | channel/group chat id |

   **Variables** (public): `PUBLIC_SITE_URL`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_TELEGRAM_URL`, aur saare `PUBLIC_FIREBASE_*`.

3. **Actions** tab → `Daily update pipeline` → **Run workflow** se pehla manual run karein.
4. Cron: daily **02:00 UTC (07:30 IST)**. Time badalna ho to `.github/workflows/daily.yml` me cron edit karein.

### Gmail App Password

1. Google Account → Security → **2-Step Verification** on karein.
2. Security → **App passwords** → app `Mail`, device `Other` → 16-character password copy karein.
3. Wahi `SMTP_PASS` me daalein.

**Email loop:** `scripts/notify.mjs` har subscriber ke liye alag digest banata hai, `for` loop me ek-ek email bhejta hai, har email ke baad `EMAIL_DELAY_MS` wait karta hai, aur `MAX_EMAILS_PER_RUN` cross hone par ruk jata hai. Har successful email ke baad subscriber doc par `lastNotifiedAt` save hota hai — isliye cap lagne ya run fail hone par bache hue subscribers agli run me apna digest paate hain, aur pehle ja chuke subscribers ko duplicate email nahi jaati. Telegram per-job `telegramNotified` flag se track hota hai.

### Telegram bot

1. Telegram me **@BotFather** → `/newbot` → token copy.
2. Bot ko apne channel/group me **admin** banayein.
3. Chat ID nikaalein: channel post ka link `https://t.me/c/1234567890/45` ho to chat id `-1001234567890` hoti hai. Ya `https://api.telegram.org/bot<TOKEN>/getUpdates` se `chat.id` dekhein.
4. `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` secrets me daalein.

---

## 8. Free tier limits (approx)

| Service | Free limit | FollowExam usage |
|---|---|---|
| Firebase Hosting | 10 GB storage, 360 MB/day transfer | Static site — kaafi |
| Firestore | 1 GiB storage, 50k reads/20k writes per day | Jobs + subscribers |
| Firebase Auth | 50k MAU (email/Google) | Free |
| GitHub Actions | 2,000 min/month (private repo) | ~5–8 min/day |
| Gmail SMTP | ~500 recipients/day (Workspace 2,000) | `MAX_EMAILS_PER_RUN` se control |
| Telegram Bot API | Free | Unlimited practically |

Traffic ya subscriber list bahut badh jaye to paid tier ya email provider (Brevo/Resend free tier) par shift kar sakte hain.

---

## 9. Launch checklist

- [ ] `.env` aur GitHub secrets/variables bhare hue hain
- [ ] Firestore rules deploy ho gaye
- [ ] Admin user bana aur `admins/{uid}` doc exist karta hai
- [ ] `/admin/` se 3–5 real entries approve karke test deploy hui
- [ ] `data/jobs.json` se saare `"demo": true` items hata diye
- [ ] Home page par demo banner nahi dikh raha
- [ ] Email test: apne address par subscribe karke `npm run notify` chala kar dekha
- [ ] Telegram test message receive hua
- [ ] `/feed.xml`, `/sitemap-index.xml`, `/robots.txt` khul rahe hain
- [ ] Google Search Console me property add ki
- [ ] Legal pages (About, Contact, Privacy, Disclaimer) review kiye

**Demo data remove karne ka quick way:**

```bash
npm run remove-demo
npm run validate
npm run build
```

---

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| `Admin panel: Firebase setup required` | `.env` me `PUBLIC_FIREBASE_*` values missing/invalid; dev server restart karein |
| `Access nahi hai` on `/admin/` | `admins/{uid}` doc nahi hai ya UID galat hai |
| `Missing or insufficient permissions` | `firestore.rules` deploy nahi hui: `npx firebase-tools deploy --only firestore:rules` |
| Firestore index error | Console me diye gaye link se index create karein, ya `firestore.indexes.json` deploy karein |
| Ingest me `HTTP 403` | Kuch official sites bot traffic block karti hain. `scripts/ingest.mjs` me headers already browser-like hain; fir bhi fail ho to us source ko `data/sources.json` se hata dein |
| Email nahi ja raha | Gmail App Password use karein, 2FA on ho; `SMTP_SECURE`/port match karein (465 → true, 587 → false) |
| Telegram 400 | Chat ID galat ya bot channel admin nahi hai |
| Hosting par 404 | `firebase.json` me `"public": "dist"` aur `trailingSlash: true`; build ke baad deploy karein |
| Purane links custom domain par | `PUBLIC_SITE_URL`, `astro.config.mjs`, `public/robots.txt`, `astro.config` sitemap — teeno update karein |

---

## 11. Custom domain (baad me)

1. Firebase Hosting → **Add custom domain** → domain verify karein.
2. DNS me diye gaye `A`/`TXT` records add karein.
3. `.env` aur GitHub vars me `PUBLIC_SITE_URL=https://yourdomain.com` set karein.
4. `public/robots.txt` me sitemap URL update karein, phir redeploy.

Free `.web.app` subdomain hamesha kaam karta rahega.

---

## 12. Design & content rules

- Design, logo, illustrations sab original hain — kisi doosri site se copy nahi.
- Har post = short original summary + official source link. Long copied text, images ya PDFs host nahi kiye jate.
- Source site ke naam/branding ka use nahi hota.
- Facts (dates, fee, vacancy) official notification se verify hote hain; admin review final gate hai.
- Legal pages: `/about/`, `/contact/`, `/privacy/`, `/disclaimer/`.

---

## 13. Roadmap (V2 ideas)

- Department-wise landing pages (SEO)
- Saved-search alerts (state + qualification)
- Hindi UI toggle
- Result/answer-key PDF link extraction
- Weekly digest email
- Analytics dashboard for admin (approval rate, top sources)
- Push notifications via Firebase Cloud Messaging
- Exam detail pages me official notification history

---

**License:** Code private project ke liye hai. Content sirf informational; official notification hi authoritative source hai.
