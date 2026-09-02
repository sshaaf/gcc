## ADDED Requirements

### Requirement: Legacy WordPress Redirects via Vercel

The system MUST serve a `vercel.json` at the repository root containing a `rewrites` array. Each rewrite maps a legacy WordPress permalink (`/<YYYY>/<MM>/<DD>/<slug>`) to the new site's URL. Posts map to `/news/<slug>`; pages map to `/<slug>`. The redirect map is generated from the WordPress WXR export at the time of import and committed to the repo.

#### Scenario: Visiting a legacy post URL
- **WHEN** a user visits `https://<domain>/2017/03/06/hej-verden`
- **THEN** Vercel serves the new site's `/news/hej-verden` page with HTTP 200 (the rewrite is internal; the URL bar may or may not change depending on rewrite vs redirect)

#### Scenario: Visiting a legacy page URL
- **WHEN** a user visits `https://<domain>/2017/03/14/bestyrelsen`
- **THEN** Vercel serves the new site's `/bestyrelsen` page

#### Scenario: Visiting a legacy URL not in the rewrite map
- **WHEN** a user visits `https://<domain>/2017/03/06/some-post-we-did-not-import`
- **THEN** the request passes through to Next.js routing and returns 404 (the rewrite map only covers imported URLs)

### Requirement: Redirect Map Completeness

Every imported WordPress post and page MUST have a corresponding entry in `vercel.json`. Missing entries are a regression: external links to those legacy URLs would 404 once the WordPress site is decommissioned.

#### Scenario: Audit after import
- **WHEN** the import script finishes and writes `vercel.json`
- **THEN** the number of `rewrites` entries equals the number of imported posts plus the number of imported pages

### Requirement: Redirect Source Pattern Is Exact

Each rewrite's `source` MUST be the legacy permalink path **without** a trailing slash and **without** the `/wp-content/uploads/` prefix. Rewrite sources MUST NOT use wildcard patterns that could match unintended URLs.

#### Scenario: Trailing slash
- **WHEN** a user visits `https://<domain>/2017/03/06/hej-verden/` (with trailing slash)
- **THEN** the rewrite still matches (Vercel normalizes trailing slashes by default)

#### Scenario: Year-only URL is not rewritten
- **WHEN** a user visits `https://<domain>/2017` (a year archive page, not a single post)
- **THEN** no rewrite applies; the request passes through to Next.js routing

### Requirement: Redirect Map Is Committed to Repo

`vercel.json` MUST be committed to the repository and tracked in version control. Future changes to the redirect map (adding or removing rewrites) MUST go through the normal PR/commit flow.

#### Scenario: Verifying the file is tracked
- **WHEN** `git ls-files vercel.json` is run
- **THEN** the file path appears in the output (the file is tracked)