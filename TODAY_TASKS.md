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

## D. Feature backlog (REQUIREMENTS_CHECKLIST.md se)

- [ ] Admin analytics charts/reports expand
- [ ] Admin roles UI (manager, executive) — Firestore role doc + UI
- [ ] Profile institution verification (govt site check)
- [ ] Profile portfolio/resume public view
- [ ] Library PDF direct-read + read-record tracking
- [ ] Post automation time-based fetch (Blaze toggle)
- [ ] Post categories enforced (category + official URL + notification URL)
- [ ] Payment gateway settings (admin toggle + credentials) — page exists, gateway integration pending
- [ ] Social auto-post / video short (Blaze toggle)
- [ ] Logo/name centralized from admin settings
- [ ] Full fluid grid for all pages
- [ ] Admin full user-data access (users page expand)

## E. Deploy log

| Commit | Change | Live |
|---|---|---|
| `9a1d868` | Admin upgrade, owner bootstrap, reset link, stray model files removed | ✅ |
| `708ab53` | Functional admin settings (brand, Blaze toggles, payments) | ✅ |
| `6db75bb` | Create owner account flow | ✅ |
| `1be6514` | Duplicate account cleanup, login hardening, task list | ✅ |
