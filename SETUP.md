# FollowExam — Step-by-step setup guide

Ye guide zero se live deployment tak le jata hai. Har step ke baad kya check karna hai, wo bhi likha hai.

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
| 6.5 First real job publish | ⛔ **Pending** (site abhi 12 demo jobs dikha raha hai) |

> ⚠️ `.env`, service-account JSON aur app passwords kabhi GitHub par commit na karein. Ye guide ki commands safe hain.

---

## 0. Pehle ye install karein

| Cheez | Kaise check karein | Na ho to |
|---|---|---|
| Node.js 22+ | `node -v` | [nodejs.org](https://nodejs.org) se LTS install karein |
| Git | `git --version` | `winget install --id Git.Git -e --source winget` |
| Browser | Chrome/Edge | — |

Git install ke baad terminal band karke naya PowerShell kholein, phir `git --version` check karein.

Project folder kholein:

```powershell
cd "C:\Users\tinte\Documents\Default Project"
npm install
Copy-Item .env.example .env
```

---

## 1. Firebase project + web config

> ✅ **Ho chuka hai.** Project ID: **`followupdates`**. `.env` aur `.firebaserc` already isi se set hain. Neeche ke steps sirf naye project ke liye hain.

### 1.1 Project banayein

1. [console.firebase.google.com](https://console.firebase.google.com) kholein aur apne Google account se login karein.
2. **Add project** / **Create a project** click karein.
3. Project name: `followexam` (ya jo available ho). Project ID automatically banega, jaise `followexam-2026`. **Ye ID copy karke note karein.**
4. Google Analytics: **Disable** kar sakte hain (zaroori nahi). Continue → Create project.

### 1.2 Web app register karein

1. Project ke andar ⚙️ **Project settings** → **General** tab.
2. Neeche **Your apps** → Web icon `</>` click karein.
3. App nickname: `FollowExam Web`. **Firebase Hosting** ka checkbox abhi na tick karein.
4. **Register app** → `firebaseConfig` object dikhega:

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

5. In values ko `.env` me daalein (`notepad .env`):

```env
PUBLIC_FIREBASE_API_KEY=AIza...
PUBLIC_FIREBASE_AUTH_DOMAIN=followupdates.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=followupdates
PUBLIC_FIREBASE_STORAGE_BUCKET=followupdates.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> Purane projects me `storageBucket` `appspot.com` hota hai, naye me `firebasestorage.app`. Jo console dikhaye, wahi paste karein.

### 1.3 Authentication enable karein

1. Left menu → **Build** → **Authentication** → **Get started**.
2. **Sign-in method** tab:
   - **Email/Password** → Enable → Save.
   - **Google** → Enable → project support email choose → Save.

### 1.4 Firestore banayein

1. Left menu → **Build** → **Firestore Database** → **Create database**.
2. **Production mode** select karein (rules baad me deploy karenge).
3. Location: **asia-south1 (Mumbai)**. ⚠️ Ye baad me change nahi hota.
4. Create.

### 1.5 Project ID file me daalein

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

Aur `.env` me:

```env
PUBLIC_SITE_URL=https://followupdates.web.app
PUBLIC_CONTACT_EMAIL=aapkaemail@gmail.com
SITE_URL=https://followupdates.web.app
```

### 1.6 Rules + indexes deploy karein

> **`firebase init` mat chalayein.** Project me `firebase.json`, `firestore.rules` aur `firestore.indexes.json` already maujood hain. `firebase init` interactive hota hai aur non-interactive terminal me `does not have a default and cannot be answered` error deta hai — uski zaroorat nahi hai.

```powershell
npx firebase-tools@latest login
npx firebase-tools@latest deploy --only firestore:rules,firestore:indexes --project followupdates
```

Browser me Google login hoga. Command ke baad Firebase Console → Firestore → **Rules** tab me apni rules dikhni chahiye.

---

## 2. Service account JSON (server scripts ke liye)

1. Firebase Console → ⚙️ **Project settings** → **Service accounts** tab.
2. **Generate new private key** → **Generate key** → JSON file download hogi.
3. File ko **project folder ke bahar** rakhein (jaise Downloads me). Isse kabhi commit na karein.
4. GitHub secret ke liye ise **ek line** me convert karein:

```powershell
$json = Get-Content "$HOME\Downloads\followupdates-firebase-adminsdk-xxxxx.json" -Raw |
        ConvertFrom-Json |
        ConvertTo-Json -Compress
$json | Set-Clipboard
```

Ab JSON clipboard me one-line form me hai. Ise **Step 3.4** me `FIREBASE_SERVICE_ACCOUNT` secret me paste karenge.

> Locally `npm run sync/pull/notify` chalane ke liye is one-line JSON ko `.env` me `FIREBASE_SERVICE_ACCOUNT=` ke aage paste kar sakte hain. Ya `GOOGLE_APPLICATION_CREDENTIALS` me JSON file ka path dein.

**Security:** JSON kisi ke saath share na karein. Galti se leak ho jaye to Service accounts → key delete → new key generate karein.

---

## 3. GitHub repo + Actions secrets

### 3.1 Git install (agar nahi hai)

```powershell
winget install --id Git.Git -e --source winget
```

Terminal band karke naya PowerShell kholein, phir:

```powershell
git --version
```

### 3.2 GitHub par repo banayein

> ✅ **Ye ho chuka hai.** Repo public hai: **https://github.com/surakshasavingssociety-sketch/followexam**
> GitHub CLI (`gh`) bhi installed + authenticated hai.

Naya repo banana ho to:

1. [github.com/new](https://github.com/new) kholein.
2. Repository name: `followexam`.
3. **Public** select karein (public repo par Actions minutes unlimited/free hain).
4. **Create repository** (README/gitignore add na karein).

### 3.3 Code push karein

> ✅ **`main` already push ho chuka hai.** Sirf tab chalayein jab naya clone banaya ho:

```powershell
git clone https://github.com/surakshasavingssociety-sketch/followexam.git
cd followexam
npm install
```

Pehli baar browser me GitHub login maangega — sign in kar lein.

> `node_modules`, `dist`, `.env` automatically ignore hain (`.gitignore` ki wajah se). Push ke baad GitHub par sirf source code dikhna chahiye.

### 3.4 GitHub Secrets add karein

> ✅ **Non-sensitive defaults already set hain** (`FIREBASE_PROJECT_ID`, `SITE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `MAIL_FROM`, `EMAIL_DELAY_MS`, `MAX_EMAILS_PER_RUN`, `NOTIFY_LOOKBACK_DAYS`).
> ⛔ **Ye 5 abhi khali hain, aapko add karni hain:** `FIREBASE_SERVICE_ACCOUNT`, `SMTP_USER`, `SMTP_PASS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Secrets** → **New repository secret**.

| Secret name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Step 2 ka one-line JSON |
| `FIREBASE_PROJECT_ID` | `followupdates` |
| `SITE_URL` | `https://followupdates.web.app` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | aapka Gmail address |
| `SMTP_PASS` | Gmail **App Password** (Step 4) |
| `MAIL_FROM` | `FollowExam <aapkaemail@gmail.com>` |
| `EMAIL_DELAY_MS` | `1500` |
| `MAX_EMAILS_PER_RUN` | `350` |
| `NOTIFY_LOOKBACK_DAYS` | `7` |
| `TELEGRAM_BOT_TOKEN` | BotFather token (Step 5) |
| `TELEGRAM_CHAT_ID` | `@yourchannel` ya `-100...` (Step 5) |

### 3.5 GitHub Variables add karein

> ✅ **Saare variables already set hain** (Firebase public config, site URL, contact email, query counts).

Wahi page → **Variables** tab → **New repository variable**.

| Variable name | Value |
|---|---|
| `PUBLIC_SITE_URL` | `https://followupdates.web.app` |
| `PUBLIC_CONTACT_EMAIL` | aapka contact email |
| `PUBLIC_TELEGRAM_URL` | `https://t.me/yourchannel` (ya blank) |
| `PUBLIC_FIREBASE_API_KEY` | Firebase config se |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase config se |
| `PUBLIC_FIREBASE_PROJECT_ID` | Firebase config se |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase config se |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase config se |
| `PUBLIC_FIREBASE_APP_ID` | Firebase config se |
| `EXAM_QUERIES_PER_RUN` | `8` (optional — exam-cycle searches per run) |
| `STATE_QUERIES_PER_RUN` | `6` (optional — state-wise searches per run) |

> Secrets = private (service account, passwords). Variables = public web config. Dono zaroori hain.

---

## 4. Gmail app password (email alerts)

1. [myaccount.google.com/security](https://myaccount.google.com/security) kholein.
2. **2-Step Verification** ON karein (agar pehle se nahi hai).
3. Wapas Security → **App passwords** (2-Step Verification ke andar bhi mil sakta hai).
4. App name: `FollowExam` → **Create**.
5. 16-character password copy karein (spaces ke bina).
6. Ise GitHub secret `SMTP_PASS` me daalein.

> Normal Gmail password kaam nahi karega. Workspace account ho to admin ne app passwords block kiye ho sakte hain — us case me personal Gmail use karein.

**Limit:** Free Gmail ~500 recipients/day. Code `MAX_EMAILS_PER_RUN=350` par ruk jata hai aur bache hue subscribers agli run me cover hote hain.

---

## 5. Telegram bot + channel

### 5.1 Bot banayein

1. Telegram me **@BotFather** kholein → `/newbot`.
2. Bot name: `FollowExam Alerts`.
3. Username: `followexam_alerts_bot` (unique hona chahiye).
4. Token copy karein: `123456789:AAH...` — ye `TELEGRAM_BOT_TOKEN` hai.

### 5.2 Channel banayein

1. Telegram → **New Channel** → naam `FollowExam Updates` → public channel banayein.
2. Channel username note karein, jaise `@followexamupdates`.
3. Channel → **Administrators** → **Add Administrator** → apna bot add karein → permissions me **Post messages** ON rakhein.

### 5.3 Chat ID

**Public channel (aasan):** `TELEGRAM_CHAT_ID=@followexamupdates`

**Private channel:** bot ko admin banayein, channel me ek message post karein, phir browser me kholein:

```text
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Response me `"chat":{"id":-1001234567890}` dikhega. Wahi ID use karein.

### 5.4 Test

```powershell
$token = "YOUR_TOKEN"
$chat = "@followexamupdates"
Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$token/sendMessage" `
  -Body @{ chat_id = $chat; text = "FollowExam test message ✅" }
```

Channel me message aa jaye to setup sahi hai.

---

## 6. Site URL, first deploy aur admin

### 6.1 Local build test

```powershell
npm run validate
npm run build
npm run linkcheck
npm run preview
```

`http://localhost:4322` par site khulni chahiye. `.env` change karne ke baad preview restart karein.

> `npm run build` se pehle `prebuild` automatically `data/exams.json` regenerate karta hai (`exam-catalog.json` + `states.json` se). Alag se chahiye to `npm run exams:build`.

### 6.2 Firestore rules + Hosting deploy

> ✅ **Ho chuka hai** — rules + indexes deployed, 309 files hosting par, site live.

```powershell
npx firebase-tools@latest deploy --only firestore:rules,firestore:indexes,hosting --project followupdates
```

Site live: `https://followupdates.web.app`

### 6.3 Admin account banayein

1. Firebase Console → **Authentication** → **Users** → **Add user**.
2. Email: apna admin email. Password: strong password.
3. User create hone ke baad **UID** copy karein (User UID column).
4. Firebase Console → **Firestore Database** → **Start collection**:
   - Collection ID: `admins`
   - Document ID: **wahi UID**
   - Field: `email` (string) = admin email
   - Save.
5. Site par `/admin/` kholein → login karein. Pending queue dikhni chahiye.

> Agar `/admin/` par "Firebase setup required" dikhe, to GitHub Variables / `.env` me `PUBLIC_FIREBASE_*` values missing hain. Build ke baad hi effect hota hai.

### 6.4 GitHub Actions pehli run

1. GitHub repo → **Actions** tab.
2. **Deploy site** → **Run workflow** → `main` branch → Run.
3. Green tick ke baad site check karein.
4. **Daily update pipeline** → **Run workflow** se discovery + sync + build + deploy test karein.

> Push hone par "Deploy site" automatic chalta hai. Agar pehli push secrets add karne se pehle ho gayi thi, to workflow fail hoga — secrets add karne ke baad **Re-run** kar dein.

### 6.5 Pehla real job publish karein

1. `/admin/` → **Pending** tab → koi entry edit karein (title, dates, official URL verify karein) → **Approve**.
2. GitHub Actions → **Daily update pipeline** → **Run workflow**.
3. Workflow Firestore se approved job pull karega, site build/deploy karega, phir Telegram + email alert bhejega.
4. Site par job dikhne lagegi.

> Pehli real approval ke baad `data/jobs.json` Firestore se replace ho jata hai — demo entries automatically hat jayengi. Usse pehle site par demo banner rahega.

### 6.6 Test checklist

- [ ] `/jobs/` par search aur filters kaam kar rahe hain
- [ ] `/exams/` par search aur stream groups kaam kar rahe hain
- [ ] `/exams/ssc-cgl/` jaisa exam page khul raha hai
- [ ] `/states/` aur apne state ka page (`/states/bihar/` etc.) khul raha hai
- [ ] `/calendar/` par central/state filter kaam kar raha hai
- [ ] Job detail par Save aur Share buttons kaam kar rahe hain
- [ ] Subscribe form se apna email subscribe hua
- [ ] Telegram channel me test alert aaya
- [ ] Email inbox me digest aaya (spam folder bhi check karein)
- [ ] `/admin/` se approve/reject kaam kar raha hai
- [ ] `/feed.xml`, `/sitemap-index.xml`, `/robots.txt` khul rahe hain

### 6.7 Exam database update kaise karein

**Naya central exam add karna:**

1. `data/exam-catalog.json` → `exams` array me ek object add karein (id, name, fullName, stream, body, bodyShort, level, qualification, age, officialUrl, frequency, aliases, cycle).
2. `npm run exams:build` → `npm run validate`.
3. `npm run build` → naya exam `/exams/<slug>/` par live.

**Naya state/UT ya body update karna:**

1. `data/states.json` me state object edit karein (`psc`, `police`, `board`, `labels`, optional `cycle`).
2. `npm run exams:build` → state exams automatically regenerate ho jayenge.

**Cycle months badalna:** `exam-catalog.json` me `cycle.notification/apply/exam/result` arrays update karein (1–12). Ye indicative windows hain — official dates nahi, isliye page par disclaimer hamesha rehta hai.

---

## Common problems

| Problem | Fix |
|---|---|
| `/admin/` par "Firebase setup required" | `.env` ya GitHub Variables me `PUBLIC_FIREBASE_*` missing. Build/deploy dobara karein |
| Admin login ke baad "Access nahi hai" | `admins/{uid}` document missing ya UID galat |
| `Missing or insufficient permissions` | `firestore.rules` deploy nahi hui — Step 1.6 dobara chalayein |
| Firestore index error | `firestore.indexes.json` deploy karein, ya console ke link se index banayein |
| Email nahi ja raha | Gmail 2FA ON + App Password use karein; port 465 ke saath `SMTP_SECURE=true` |
| Telegram 400 | Bot channel admin nahi hai, ya chat ID galat hai |
| GitHub Actions fail | Secrets/variables names spelling check karein; `FIREBASE_SERVICE_ACCOUNT` one-line JSON ho |
| Hosting par 404 | `firebase.json` me `"public": "dist"` hai; build ke baad deploy karein |
| `firebase init` par `does not have a default and cannot be answered` | `firebase init` skip karein — config already hai. Seedha `npx firebase-tools deploy ... --project followupdates` chalayein |
| `Could not find a project` / wrong project | `.firebaserc` me `default` = `followupdates` ho, ya command me `--project followupdates` dein |
| Site purana content dikha raha | Browser cache/CDN; 2–3 minute wait karein ya hard refresh |
| Demo entries dikh rahi hain | Pehli real approval + daily workflow ke baad automatic hat jayengi, ya `npm run remove-demo` |

---

## Security rules (yaad rakhein)

- `.env` aur service-account JSON kabhi commit/share na karein.
- GitHub repo private rakhein.
- Admin password strong rakhein, 2FA on karein.
- Service account key leak ho to turant delete karke new generate karein.
- Firestore rules deploy ke bina site live na karein.

---

## Custom domain (baad me)

1. Firebase Console → **Hosting** → **Add custom domain**.
2. Domain verify karein aur diye gaye DNS records add karein.
3. `.env` + GitHub Variables me `PUBLIC_SITE_URL=https://yourdomain.com` update karein.
4. `public/robots.txt` ka sitemap URL update karein.
5. Redeploy karein.

Free `*.web.app` URL hamesha kaam karta rahega.
