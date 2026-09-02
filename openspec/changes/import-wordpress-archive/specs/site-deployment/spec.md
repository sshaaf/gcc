## ADDED Requirements

### Requirement: Footer Legacy Link Points at Correct Domain

The footer "Legacy site" link MUST point at the live legacy WordPress domain `https://www.glostrupcricket.dk`, configured via the `WORDPRESS_URL` constant in `lib/constants.ts`. This value MUST be the only place where the legacy URL is defined; footer rendering MUST read from the constant.

#### Scenario: Default footer renders the correct URL
- **WHEN** the home page is rendered
- **THEN** the footer contains a "Legacy site" link with `href` equal to `WORDPRESS_URL`

#### Scenario: Legacy URL changes
- **WHEN** `WORDPRESS_URL` in `lib/constants.ts` is updated
- **THEN** the next deploy's footer reflects the new URL with no other code changes needed

### Requirement: Vercel Configuration Files Are Committed

The repository MUST commit configuration files that affect Vercel routing behavior (`vercel.json` if present) so that deploys are reproducible from a clean clone. Files in `.vercel/` (auth artifacts) MUST remain gitignored.

#### Scenario: Clean clone deploys identically
- **WHEN** a developer clones the repo and runs `vercel deploy --prod` (or pushes to `main` with GitHub App installed)
- **THEN** the deployed site behaves identically to a deploy from the original working copy, including all rewrites defined in `vercel.json`