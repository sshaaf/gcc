## ADDED Requirements

### Requirement: Pages Content Type

The system MUST organize static informational pages under `content/pages/<slug>.md`, one file per page, with YAML frontmatter validated by a zod schema. Each page MUST has at minimum: `title` (string) and `body` (Markdown). Pages MUST NOT be dated or categorized; they are timeless content.

#### Scenario: Adding a new page
- **WHEN** an author creates `content/pages/<slug>.md` with valid `title` and Markdown body
- **THEN** the page is reachable at `/<slug>` on the next build, and `getPages()` returns it

#### Scenario: Missing required field
- **WHEN** a page file is missing `title`
- **THEN** `next build` fails with a clear error referencing the file path

### Requirement: Pages Route Excludes Reserved Paths

The dynamic page route at `/<slug>` MUST check the slug against a reserved-paths list (`RESERVED_SLUGS`) and call `notFound()` if the slug matches. The reserved list MUST include at minimum: `news`, `gallery`, `contact`, `about`, `api`, `_next`, `favicon.ico`, and the empty string. Reserved paths produce a real 404, not a page render.

#### Scenario: Slug collides with reserved path
- **WHEN** a user visits `/news` (where `news` is reserved)
- **THEN** the server returns HTTP 404 instead of trying to render a page

#### Scenario: Reserved slug added later
- **WHEN** a new top-level route is added to the site (e.g. `/shop`)
- **THEN** the developer MUST add `shop` to `RESERVED_SLUGS` in the same change

#### Scenario: Page slug not in reserved list
- **WHEN** a user visits `/bestyrelsen` (a valid page slug)
- **THEN** the page renders with title and Markdown body

### Requirement: Pages Schema Validation at Build Time

The pages loader MUST validate every `content/pages/*.md` file's frontmatter through a `zod` schema defined in `lib/content/pages.ts`. Validation failures MUST cause `next build` to exit non-zero with file path and field name in the error message.

#### Scenario: Invalid frontmatter on a page
- **WHEN** `content/pages/some-page.md` has a non-string `title` (e.g. a number)
- **THEN** `next build` fails with an error referencing the file path and the field type mismatch

### Requirement: Pages Are Statically Generated

`/<slug>` for imported pages MUST be statically generated at build time via `generateStaticParams`. The set of generated paths MUST equal the set of filenames in `content/pages/` (sans `.md`).

#### Scenario: Adding a new page generates a new route
- **WHEN** a new file is added to `content/pages/`
- **THEN** the next `next build` produces a static page for that slug and includes it in the deployed output

#### Scenario: Removing a page removes the route
- **WHEN** a file is deleted from `content/pages/`
- **THEN** the next `next build` does NOT produce a page for that slug; visiting the URL returns 404

### Requirement: Page Template Renders Markdown Body

The `/<slug>` page template MUST render the page's title as an `<h1>`, render the Markdown body as sanitized HTML using the same `renderMarkdown` helper as news posts, and provide a "Back home" link to `/`.

#### Scenario: Page renders with title and body
- **WHEN** a user visits `/bestyrelsen`
- **THEN** the page shows the title "Bestyrelsen" as `<h1>` and the rendered Markdown body below it, with a visible "Back home" link

### Requirement: Pages Loader Returns Typed Data

The system MUST provide a typed loader `getPages()` that returns an array of all pages (sorted by `title` or another stable order) with `slug` populated. Loaders MUST read files at build time from Server Components, never from client components.

#### Scenario: Listing all pages
- **WHEN** a Server Component calls `getPages()`
- **THEN** it receives a typed array of all pages from `content/pages/`