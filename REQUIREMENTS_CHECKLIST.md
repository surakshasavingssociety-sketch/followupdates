# FollowExam — Requirement Checklist (Day 1 to Today)

## Completed / Deployed
- [x] Build + deploy pipeline (Firebase Hosting)
- [x] AuthGate banner (categories) + sign-in fix
- [x] Home page toggle (login → dashboard same page)
- [x] Footer social buttons (Telegram, WhatsApp, X, IG, YT)
- [x] Admin settings page (/admin/settings/)
- [x] Admin login fix: duplicate owner account removed, single verified account (`google.com` + `password`), reset emails working
- [x] Admin panel: owner bootstrap, friendly auth errors, create-owner + reset link, Settings/View site links
- [x] Library page (/library/)
- [x] Scholarship eligibility page (/scholarships/eligibility/)
- [x] Government services page (/government-services/)
- [x] Profile user-status field + form save
- [x] Responsive fix (container 1480px, eyebrow visible)
- [x] Data build (exams, institutions, scholarships)

## Role-based access (deployed 2026-11-04)
- [x] Access roles: `super_admin`, `admin`, `manager`, `executive`, `moderator` (`admins/{uid}.role`)
- [x] Single role resolver (`src/lib/roles.ts`) used by header, login, dashboard and admin nav
- [x] Admin nav filtered by permission; direct URL to a forbidden section redirects to the queue
- [x] Firestore rules role-aware (settings = Super Admin only; automation/social/flags = ops roles)
- [x] Role-aware login redirect (admin → `/admin/`, member → `next` or home)
- [x] Persona dashboard: student, job aspirant, research scholar, teacher, faculty, institution, organisation
- [x] Login page role guide ("Who can sign in?")

## To complete (local first, deploy after your confirm: tab kijiyega)
- [ ] Admin panel: full reports/charts (analytics page expand)
- [x] Admin: user roles (manager, executive, moderator, super_admin) — Firestore role doc + permission UI
- [x] Profile: institution verification (request form + admin approve/reject)
- [x] Profile: portfolio / resume public view (auto CV builder still pending)
- [x] Library: user read-record tracking (direct PDF reader still pending)
- [ ] Post automation: time-based notification fetch (Blaze hidden toggle)
- [x] Post categories enforced (category + official URL + notification URL required on approve)
- [ ] Payment gateway live integration (Razorpay/Stripe keys + webhook)
- [ ] Social auto-post / video short (hidden Blaze toggle)
- [x] Logo/name update centralized (admin settings → localStorage → header/footer)
- [x] Screen auto-adjust (full fluid grid + mobile admin actions)
- [x] User data full access from admin (users page expand)
- [x] Remove unintended model/openrouter edits (stray `src/firebase.js` + `firestore-debug.log` deleted; 0 references remain)

## Note — Remove openrouter/model stray edits
Only intended changes should remain. Check:
- src/components/Footer.astro — must have balanced tags + SubscribeForm + alerts div intact (fixed)
- src/components/AuthGate.astro — banner + script only
- src/styles/global.css — .auth-gate-wall[hidden] + .eyebrow + container
- src/pages/admin/index.astro — original admin queue
- src/lib/types.ts — UserProfile + UserStatus added cleanly
