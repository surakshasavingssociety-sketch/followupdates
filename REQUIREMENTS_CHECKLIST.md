# FollowExam — Requirement Checklist (Day 1 to Today)

## Completed / Deployed
- [x] Build + deploy pipeline (Firebase Hosting)
- [x] AuthGate banner (categories) + sign-in fix
- [x] Home page toggle (login → dashboard same page)
- [x] Footer social buttons (Telegram, WhatsApp, X, IG, YT)
- [x] Admin settings page (/admin/settings/)
- [x] Library page (/library/)
- [x] Scholarship eligibility page (/scholarships/eligibility/)
- [x] Government services page (/government-services/)
- [x] Profile user-status field + form save
- [x] Responsive fix (container 1480px, eyebrow visible)
- [x] Data build (exams, institutions, scholarships)

## To complete (local first, deploy after your confirm: tab kijiyega)
- [ ] Admin panel: full reports/charts (analytics page expand)
- [ ] Admin: user roles (manager, executive) — Firestore role doc + UI
- [ ] Profile: institution verification (government site check + form)
- [ ] Profile: portfolio / resume / CV fields + public view
- [ ] Library: PDF direct-read + user read-record tracking
- [ ] Post automation: time-based notification fetch (Blaze hidden toggle)
- [ ] Post categories enforced (every post must have category + official URL + notification URL)
- [ ] Payment gateway settings page (admin toggle + credentials storage - hidden until Blaze)
- [ ] Social auto-post / video short (hidden Blaze toggle)
- [ ] Logo/name update centralized (admin settings apply everywhere)
- [ ] Screen auto-adjust (left/right gap) — done partially; full fluid grid for all pages
- [ ] User data full access from admin (users page expand)
- [ ] Remove unintended model/openrouter edits (Footer was broken by edit; fixed; verify no other stray edits)

## Note — Remove openrouter/model stray edits
Only intended changes should remain. Check:
- src/components/Footer.astro — must have balanced tags + SubscribeForm + alerts div intact (fixed)
- src/components/AuthGate.astro — banner + script only
- src/styles/global.css — .auth-gate-wall[hidden] + .eyebrow + container
- src/pages/admin/index.astro — original admin queue
- src/lib/types.ts — UserProfile + UserStatus added cleanly
