# Implementation Plan — FollowExam / FollowUpdates

Follows the priority order from the master prompt. Each module must be completed end-to-end (inspect → implement → integrate → test → document) before moving on.

## Priority 1 — Core System
1. Audit artifacts (done: PROJECT_AUDIT, EXISTING_FEATURES, this file, DATABASE_STRUCTURE, SECURITY_AUDIT, MASTER_PROGRESS).
2. Bug fixing: enable Google provider; wide-screen layout; demo job removal.
3. Admin panel: role tiers; dashboard counts from Firestore; CMS fields; scheduling/archive.
4. User authentication hardening (already mostly done; add role checks).
5. User profile: category selection + role-based forms + completion %.
6. Content management: categories + official notification fields.
7. Responsive UI.

## Priority 2 — Main Information Engine
1. Government source registry (data + admin UI).
2. Notification monitoring + tracking DB (expected dates, status).
3. Automation control (enable/disable sources, frequency, last/next check, failed tasks).
4. Draft generation + approval workflow + duplicate detection.
5. Related post updating.

## Priority 3 — User Services
1. Scholarship eligibility checker.
2. Government services directory (state + category filtered).
3. Digital library (public-domain/Open Access only).
4. Institutional directory + verification badges.
5. Open schooling service provider directory.

## Priority 4 — Revenue System
1. Institution/service provider subscription plans (admin-managed pricing).
2. Payment gateway integration (Razorpay/Cashfree/PayU) — test mode first.
3. Transaction dashboard + revenue reports (webhook-verified).

## Priority 5 — Advanced Features
1. Social media management + 30s video generator (manual publish fallback).
2. Advanced analytics + feature flags.
3. Software update management (research + docs only).

## Dependencies
- Payment features require gateway credentials; keep test/mock until provided.
- Blaze plan required for phone SMS, scheduled Cloud Functions, advanced storage; document, do not auto-upgrade.
- Play Store requires $25 account + JDK + keystore + closed testing.

## Localhost-only Policy
No Firebase Hosting deploy, GitHub push, Actions deploy, live payment activation, domain/DNS change, or production data deletion without explicit "deploy now" instruction. Use Firebase emulator where possible.
