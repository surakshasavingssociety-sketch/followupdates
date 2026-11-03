# Security Audit — FollowExam / FollowUpdates

## Current Controls
- Firebase Authentication (email/password, phone OTP). Google provider not yet enabled.
- Firestore rules: admins via `admins/{uid}` allow-list; published jobs public read; pending/admin-only; subscribers create/update public (no public read); users own profile + saved jobs; messages create public.
- Composite indexes for jobs/pending/subscribers.
- Secrets stored in GitHub Secrets / `.env` (gitignored); service account not committed.
- No API keys hardcoded in repo (verified).

## Gaps
- No role tiers; any doc in `admins` grants full admin.
- No server-side payment verification yet (no payment module).
- No rate limiting (Firebase plan-level; app-level not implemented).
- No audit logs for admin actions.
- Phone OTP requires Blaze for SMS quota.
- No data export / account deletion flow beyond profile delete (partial).

## Planned Hardening
- Role-based access control via `admins/{uid}.role` + rules checking role.
- Payment webhook verification + idempotency (when gateway added).
- Input validation on all forms; server-side checks for payments.
- Secure file upload (storage rules) when library/institution uploads added.
- Audit logs collection `adminActivity` for approve/reject/publish/edit.
- User consent + privacy controls + data deletion/export.
- Rate limiting on sensitive endpoints via Firebase App Check / Cloud Functions (Blaze).
- Backup & recovery strategy documentation.

## Localhost-only Policy
No production deploy, push, live payments, domain/DNS, or production data deletion without explicit instruction.
