# Today's Task List — FollowExam (2026-11-04)

Har instruction jo user ne di. Status live verify kiya ja raha hai.

## A. User instructions (chronological)

| # | Instruction | Status |
|---|---|---|
| 1 | Admin panel ko fully upgrade karke deploy karo | ✅ Deployed (`6db75bb`) |
| 2 | Login se related sabhi issues solve karo | ✅ **Solved — user ne login confirm kiya** |
| 3 | Openrouter/free-models router ke saare changes identify karke hatao | ✅ Done — 0 code references |
| 4 | Deploy ke baad full check karke kaam shuru karo, phir deploy karo | ✅ Done (10 pages 200 OK) |
| 5 | Admin login dobara check karo — login nahi ho raha, reset link nahi aa raha | ✅ Duplicate account delete + password set + sign-in test PASS |
| 6 | Openrouter removal ka status batao | ✅ Reported |
| 7 | Starting se ab tak pura process check karo + problem solve karo | ✅ Audit + root cause fix complete |
| 8 | Sabhi instructions ki list banao aur ek-ek karke kaam karo | ✅ Ye file |

## B. Root cause (audit result)

Firebase Auth mein **ek hi email ke 2 accounts** hain:

| UID | Type | Created | Sign-in history | Data |
|---|---|---|---|---|
| `TuQEdlY9jJZ1FTVXw8K0Deul5hL2` | email/password (unverified, password unknown) | 2026-11-01 | kabhi sign-in nahi | sirf `admins` doc (role `admin`) |
| `jKXR43ErVkb5ozI2NlxjdNwgT962` | Google (verified) | 2026-11-04 | aaj sign-in hua | `admins` doc (role `super_admin`, auto-created) |

Isi liye:
- Email/password sign-in `auth/invalid-credential` deta hai (password kisi ko nahi pata).
- Reset email confusion / delivery fail — duplicate email ki wajah se.
- Google sign-in actually kaam kar raha tha aur super_admin ban gaya.

### Fix plan (login) — ✅ COMPLETED
1. Backup users export (done: `backups/firebase-users-export.json`, gitignored).
2. Purana unused password account delete karo. ✅
3. Owner ke Google account par password set karke **email/password sign-in end-to-end test** karo. ✅ (SIGN-IN OK, uid `jKXR43ErVkb5ozI2NlxjdNwgT962`)
4. Direct "set your password" link generate karke user ko do (email delivery bypass). ✅ (link generated, user ne login confirm kiya)
5. Code: duplicate-email / wrong-provider errors ke friendly messages. ✅
6. Deploy + live verify. ✅

**Result:** Owner email par ab sirf ek hi account hai (`google.com` + `password` providers, verified). Reset emails ab deliver honge.

## C. Admin panel — verification checklist

- [x] Owner bootstrap (pehli sign-in par `admins/{uid}` super_admin)
- [x] Google + email/password providers enabled
- [x] Friendly `auth/invalid-credential` messages
- [x] Forgot password / reset link UI
- [x] Settings page persists to Firestore (`settings/site`)
- [x] Admin users / analytics / payments / inquiries / institutions pages live
- [ ] Login duplicate-account cleanup (today)

## D. Feature backlog — Easy → Medium → Hard (kal ke instructions)

### 🟢 EASY (aaj ho gaye ✅)
- [x] **Post categories enforced** — category (required), official URL (required), notification URL (required) already enforced in add + edit forms (verified)
- [x] **Admin roles UI** — Manager + Executive options added (add form + per-admin dropdown + permissions list)
- [x] **Website structural check** — 551 pages: 0 broken internal links, sitemap poora resolve, 0 duplicate titles, 0 missing description, 0 missing canonical, har page par exactly 1 `<h1>`
- [x] **Duplicate exam titles fixed** — board/exam pages ab state ke saath unique title (`BSEAP Board Exams (Andhra Pradesh)` vs `(Arunachal Pradesh)`, Delhi Police `(Delhi)` vs `(All India)`)
- [x] **Data generator bug fixed** — `scripts/build-exams.mjs` ab `"undefined"` aliases/keywords generate nahi karta; board exam names state-wise unique
- [x] **Admin analytics base** — 5 stat cards + live user/subscriber/admin/enquiry counts + category/state/exam tables (already live)

### 🟡 EASY — next (chhote, safe)
- [ ] Payments admin page: Firestore `settings/site` se live gateway status dikhao (abhi static JSON)
- [ ] Admin settings: "Save" ke baad site header/footer par brand name/logo turant apply (localStorage bridge)
- [ ] Library page: hardcoded 2 cards ki jagah `library-books.json` se list + search/filter
- [ ] Admin users: profile data (status/institution) bhi list mein dikhao

### 🟠 MEDIUM
- [ ] Library: PDF direct-read + read-record tracking (`users/{uid}/reading`)
- [ ] Centralized logo/name poori site par (settings → header/footer/meta)
- [ ] Analytics: SVG bar charts (category/state/exam)
- [ ] Profile: portfolio/resume public view
- [ ] Profile: institution verification form + Verified badge
- [ ] Admin: full user-data access (users page expand)
- [ ] Full fluid grid (left/right gap) sab pages par

### 🔴 HARD (baad ke liye — external setup chahiye)
- [ ] Institution government-site verification (scraping + rules)
- [ ] Post automation: time-based fetch + publish (Cloud Functions + Blaze)
- [ ] Payment gateway live integration (Razorpay/Stripe keys + webhook + verification)
- [ ] Social auto-post / video short (platform APIs + Blaze)
- [ ] Email digest / Telegram bot (SMTP/Bot token + Blaze)

## E. Deploy log

| Commit | Change | Live |
|---|---|---|
| `9a1d868` | Admin upgrade, owner bootstrap, reset link, stray model files removed | ✅ |
| `708ab53` | Functional admin settings (brand, Blaze toggles, payments) | ✅ |
| `6db75bb` | Create owner account flow | ✅ |
| `1be6514` | Duplicate account cleanup, login hardening, task list | ✅ |
| `6093c7f` | Structure: unique exam titles, 1 h1/page, generator fix, manager/executive roles | ✅ |
| `26cf217` | Structure: exam title polish | ✅ |
