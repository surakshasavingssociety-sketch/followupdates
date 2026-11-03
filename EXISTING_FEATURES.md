# Existing Features — Categorized

## Already Working
- Astro static site build + sitemap + robots
- Firebase Auth (email/password, phone OTP) + Google button (provider not enabled)
- Auth gate + login redirect
- Firestore rules + indexes
- Admin review/approve/reject/unpublish/manual publish
- Data pipeline (ingest, sync, pull, validate, build, linkcheck, notify)
- Jobs/exams/institutions/scholarships/states generated datasets
- PWA manifest + service worker + icons
- TWA config (twa-manifest.json)
- GitHub Actions daily + deploy workflows
- Subscribe form (email/telegram)
- Profile load/save, saved jobs, profile completion
- Career planner, calendar, states pages

## Partially Completed
- Admin panel (no dashboard analytics, roles, scheduling, automation control)
- User profile (single generic form; no category-specific forms)
- Institution directory (static data; no verification badges, revenue plans, enquiries)
- Scholarship (static list; no eligibility checker)
- Job notifications (ingest exists; no duplicate detection UI, no category auto-id)
- Responsive layout (container 1180px; wide-screen side gaps remain)
- TWA build (config only; no JDK/bubblewrap/keystore/APK)
- Play Store (docs only; account unpaid)
- Telegram alerts (code ready; secrets unset)

## Not Implemented
- Role-based admin tiers (Super Admin/Admin/Manager/etc.)
- Advanced CMS fields (SEO title/desc, featured image, schedule, archive)
- Automation control center + government source registry
- Notification tracking DB (expected dates, monitoring status)
- User categories + role-based profile forms
- Institution revenue plans + verification
- Digital public library
- Open schooling service provider directory
- Government services directory
- Scholarship eligibility checker
- Payment gateway + revenue dashboards
- Social media management + 30s video generator
- Feature flags
- Software update management (research only)

## Needs Improvement
- Enable Google sign-in provider in Firebase
- Publish first real job (remove demo entries)
- Wide-screen responsive gaps
- Phone sign-in requires Blaze plan (document)
- Add tests (none currently)
- Remove temporary `scripts/_check-setup.mjs` after setup
