# Database Structure — Firestore

## Collections

### admins
- Doc ID = user UID
- Fields: `email` (string), `role` (`super_admin` | `admin` | `moderator`; legacy docs without a role are treated as `super_admin`), `createdAt`, `updatedAt`
- Only a Super Admin can create/update/delete admin docs. Anyone signed in can read their own doc (needed for the admin check).

### pending
- Doc ID = fingerprint/manual ID
- Fields: title, organisation, category, source, sourceUrl, officialUrl, discoveredAt, status (pending|approved|rejected), review fields, ... (ingest schema)

### jobs
- Auto/manual ID
- Fields: title, category, subcategory, description, importantDates, applicationStart, lastDate, officialNotificationUrl, officialWebsiteUrl, sourceOrganisation, notificationPublicationDate, postPublicationDate, applicationFee, eligibility, requiredDocuments, importantInstructions, seoTitle, seoDescription, featuredImage, `publishAt` (ISO), `archivedAt`, status (draft|pending_approval|approved|published|scheduled|rejected|archived), notified (bool), postDate
- Scheduled entries become visible automatically once `publishAt <= build time`.

### users
- Doc ID = user UID
- Fields: displayName, email, phone, category (user category), state, district, education, qualification, currentCourse, institution, organizationName/Website/About, skills, interests, careerGoals, profileCompletion (%), accountStatus, subscription, createdAt, updatedAt
- Subcollection `users/{uid}/saved` (doc ID = jobId) → { savedAt }

### subscribers
- Auto ID
- Fields: email, telegramChatId, active (bool), createdAt

### inquiries (implemented)
- Auto ID
- Fields: institutionId, institutionName, name, email, phone, topic, message, consent, status (new|contacted|closed|spam), source, createdAt, updatedAt
- Public create with validation; admin read/update/delete.

### adminActivity (implemented)
- Auto ID
- Fields: action, actorUid, actorRole, targetUid, detail, createdAt, serverCreatedAt

### featureFlags (implemented)
- Doc ID = flag id (e.g. `payment_gateway`)
- Fields: name, enabled, configStatus, requiredService, dependencyStatus, estimatedCost, updatedAt

### institutions (data file `data/institutions.json`)
- name, logo, establishedYear, type (govt/private), address, state, district, website, contact, about, courses, admissions, eligibility, feeStructure, infrastructure, facilities, faculty, placement, accreditation, recognition, approvals, documents, images, prospectus, admissionNotification, socialLinks, verificationStatus (verified|pending|failed|na), plan (free|paid), createdAt

### serviceProviders / open schooling (data file `data/open-schooling-providers.json`)
- Open schooling/distance education providers with verificationStatus, plan.

### libraryBooks (data file `data/library-books.json`)
- Metadata + source library + original link + readingCount; PDF hosted only where permitted.

### notificationTracking (data file `data/notification-tracking.json`, planned Firestore sync)
- Organization, officialWebsite, category, expectedType, previousDate, expectedPeriod, actualDate, applicationStart, lastDate, examDate, resultDate, lastMonitoring, nextMonitoring, status, relatedPostId.

### payments (planned, scaffold at `/admin/payments/`)
- transactionId, userId, customer, gateway, purpose, plan, amount, date, status, gatewayRefId, refundDetails, settlementStatus, settlementDate.
- No keys or secrets in Firestore/client; webhook verification only.

## Backward Compatibility
- New fields added as optional; existing docs remain valid.
- Role added to admins as optional; docs without a role keep Super Admin behaviour.
- User category added as optional; existing users prompted to select.
- Jobs without `publishAt` remain published.
- No collection renames; migrations documented in MASTER_PROGRESS.md.
