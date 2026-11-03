# MASTER_PROGRESS — FollowExam / FollowUpdates

## Completed
- Phase 1 audit artifacts: PROJECT_AUDIT.md, EXISTING_FEATURES.md, IMPLEMENTATION_PLAN.md, DATABASE_STRUCTURE.md, SECURITY_AUDIT.md.
- Existing project verified: Astro + Firebase + GitHub Actions; 180 pending, 0 jobs, 1 admin, 0 subscribers.
- Google provider identified as not enabled; documented (manual console step required).
- User category selection added (types + profile.ts + profile page UI + save/load/completion).
- Admin role badge added (reads `admins/{uid}.role`, defaults to admin).
- Firestore rules: role helper functions + adminActivity audit collection.
- Admin Published tab now shows count; pending count already shown.
- Admin dashboard stats row (Pending/Published/Admins/Subscribers) with live counts.
- Scholarship eligibility checker page (`/scholarships/eligibility/`) with state + education level matching; linked from scholarships index.
- Government services directory (`/government-services/`) with central services and state portal/PSC/police/board details; linked from footer.
- Open schooling directory (`/open-schooling/`) with verified open schools/universities and filters; linked from footer.
- Digital public library (`/library/`) with public-domain/open-access titles and filters; linked from footer.
- Profile completion hints (lists missing core fields).
- Institution verification status field + Verified badges on cards and detail pages.
- Role-based profile forms: institution/organisation details section shown for institution/org categories.
- Feature flags: Firestore collection, seed script, admin page (`/admin/feature-flags/`), client helper.
- Payment settings page (`/admin/payments/`) with gateway list, test-mode notes, transaction dashboard placeholder.
- Social media management page (`/admin/social/`) with compose form, platform selector, scheduler, 30s video generator placeholder.
- Automation control center (`/admin/automation/`) with pipeline overview, source registry table, notification tracking notes.
- Notification tracking data file + admin page (`/admin/tracking/`).
- Institution subscription plans data + admin page (`/admin/institutions/`).
- Advanced CMS fields (SEO title/description, featured image, scheduled publish) added to Job type and manual publish form.
- Firestore rules: job deletion restricted to Super Admin; admin writes restricted to Super Admin (`admins/{uid}` create/update/delete).
- Software update management research documented (`SOFTWARE_UPDATE_RESEARCH.md`).
- Wide-screen container widened (1180px → 1320px) to reduce side gaps.
- Admin role management page (`/admin/users/`): list/add admins, change roles, audit log entries; rules restrict admin writes to Super Admin.
- Duplicate detection: shared `src/lib/duplicates.ts` + fuzzy dedupe in the ingestion pipeline (`scripts/lib.mjs`, `scripts/ingest.mjs`); admin queue shows possible duplicates and confirms before publishing.
- Institution enquiry form on institution detail pages + admin inbox (`/admin/inquiries/`) with status workflow and Firestore rules; `InstitutionInquiry` type added.
- Scheduled publishing: `isJobVisible()` in `src/lib/jobs.ts` enforces `publishAt`; `publishAt` shown on admin form; future-dated approvals set `scheduled` status; "Publish now" action; Scheduled stat on dashboard.
- Social media management page (`/admin/social/`) rewritten to use real Firestore `socialDrafts`: save, preview, copy caption, mark scheduled/published, delete; video generator honestly disabled behind feature flag; Firestore `socialDrafts` admin-only rule added.
- Analytics page (`/admin/analytics/`): content counts, vacancies, featured, scheduled, closing-in-30-days table, category/state/exam breakdowns, live audience counts (users/subscribers/admins/new enquiries) + users-by-category.
- Automation center (`/admin/automation/`): shows latest run, new items, pending total, failures; source registry table marks Disabled/Failed sources; `ingest.mjs` respects `"enabled": false` and writes `data/ingest-report.json`.
- TWA build: JDK 17 + Bubblewrap, generated keystore (`android.keystore`), `npm run twa:init` / `twa:build` fixed to use the global `bubblewrap.cmd`, APK + AAB built successfully (minSdk 24).
- `PLAY_STORE.md` updated with real build steps, keystore backup instructions, upload-key SHA-256 fingerprint, local toolchain paths.
- Build + linkcheck + validate + `npm run test:core` passed (561 pages, 0 broken links, validation OK, duplicate + scheduled-publish regression tests pass).

## Pending (next)
- Enable Google sign-in provider (Firebase Console) — manual step + verify via API.
- Publish first real job + remove demo entries.
- Set Telegram secrets + test alerts.
- Play Store: upload AAB, add SHA-256 asset links, 12-tester/14-day closed testing (needs $25 account).
- Payment gateway live mode (needs credentials).
- Consider Firebase Blaze for Cloud Functions / scheduled automation (billing decision).

## Current Position
- Core admin modules complete: users, inquiries, analytics, automation, social, feature-flags, payments, tracking, institutions.
- Duplicate detection + scheduled publishing live in admin queue; ingestion pipeline fuzzy-dedupes and skips disabled sources.
- Firestore rules cover: jobs, pending, admins, subscribers, users, inquiries, socialDrafts, adminActivity, featureFlags.
- `MASTER_PROGRESS.md`, `DATABASE_STRUCTURE.md` updated.
- Next action: user-side Firebase Console steps (enable Google sign-in), approve first real job; continue remaining modules locally as directed.

## Dependencies / Blockers
- Telegram bot token + channel (user).
- Play Console $25 account (user).
- Google OAuth consent/support email (user).
- JDK/bubblewrap install (done locally at `C:\jdk17`).
- Gateway credentials (not yet).

## Notes
- Localhost-only: no deploy/push/live payments without explicit "deploy now".
- Temporary file `scripts/_check-setup.mjs` can be removed after setup.
