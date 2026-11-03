# Software Update Management — Research

## Goal
Allow future website updates to be uploaded from the admin panel, distinguishing Content Updates from Software Updates.

## Content Updates (supported today)
- Posts, images, notifications, settings, pages and data are managed via the Admin Panel and Firestore.
- No code deployment needed.

## Software Updates (code, dependencies, application logic)
- Require a secure Git-based deployment or CI/CD system.
- Arbitrary code upload and execution from the admin panel is **not safe** and must not be implemented.

## Recommended Architecture (future)
1. Admin panel shows a "Request update" form that opens a pull request on the GitHub repo (via GitHub API) or triggers a workflow_dispatch.
2. Changes go through normal PR review + CI (validate, build, linkcheck) before merge.
3. On merge to main, `deploy.yml` builds and deploys to Firebase Hosting.
4. Feature flags (Firestore `featureFlags`) gate new functionality at runtime without redeployment.

## Security Constraints
- Never allow direct code upload/execution from the browser.
- Keep secrets in GitHub Secrets; never expose in client.
- Require Super Admin role for any deployment trigger.

## Status
Research and documentation only. Implementation deferred until core modules are complete.
