## ADDED Requirements

### Requirement: GitHub Is the Single Source of Truth

The site MUST be built from the `sshaaf/gcc` GitHub repository. The `main` branch MUST be the production branch. All content and code changes MUST land on `main` (directly or via a merged pull request) before they appear on the production site.

#### Scenario: Content change reaches production via push
- **WHEN** an author pushes a commit to `main` on `sshaaf/gcc`
- **THEN** the production site reflects the change after the Vercel build completes

### Requirement: Vercel Deploys on Push to Main

A Vercel project MUST be linked to the `sshaaf/gcc` repository via the Vercel GitHub App. A successful merge to `main` MUST trigger a production build and deploy automatically. A push to any other branch MUST trigger a preview deployment (out of scope to verify in detail in this MVP, but the integration MUST be configured for it).

#### Scenario: Push to main triggers a deploy
- **WHEN** a commit lands on `main`
- **THEN** Vercel begins a build within 60 seconds and deploys on success

#### Scenario: Failed build does not deploy
- **WHEN** the build fails (e.g. invalid frontmatter, TypeScript error)
- **THEN** the previous successful deployment remains live and the failed attempt is logged in Vercel

### Requirement: CLI-Based Deployment Setup

The Vercel project MUST be created using the Vercel CLI (`vercel link` followed by `vercel git connect`). The CLI MUST be authenticated as user `shaaf`. The resulting `.vercel/project.json` MUST be committed to the repo (no secrets in this file) so the project identity is reproducible.

#### Scenario: Reproducing the project locally
- **WHEN** a developer clones the repo and runs `vercel link --yes`
- **THEN** the project links to the same Vercel project referenced in `.vercel/project.json`

### Requirement: No Secrets in the Repo

The repository MUST NOT contain any secrets (API keys, tokens, private URLs that should not be public). For MVP, no secrets are needed; if any are added later, they MUST live in Vercel's environment configuration, accessed via `process.env`, and MUST NOT be committed.

#### Scenario: Repo is public-safe
- **WHEN** anyone browses `sshaaf/gcc` on GitHub
- **THEN** they see only source code, content, and public assets — no tokens, no private keys, no internal URLs

### Requirement: Initial Production Deploy

The first production deploy MUST be performed via `vercel deploy --prod` (or equivalent CLI command) after the Vercel GitHub App is installed. The deploy MUST succeed and produce a publicly reachable URL. The URL MUST be recorded in the project README or deployment notes.

#### Scenario: First deploy succeeds
- **WHEN** `vercel deploy --prod` is run against a working `next build`
- **THEN** Vercel returns a deployment URL that, when visited in a browser, renders the home page with all sections populated from content