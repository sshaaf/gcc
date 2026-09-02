## ADDED Requirements

### Requirement: Content Directory Shape

The system MUST organize site content under `/content/**` as Markdown files with YAML frontmatter, grouped by content type into subdirectories. Each content type listed in the proposal (home, stats, teams, honours, fixtures, news, sponsors, coaches, gallery, contact) MUST have its own subdirectory. Each subdirectory MUST contain one or more `.md` files, one item per file.

#### Scenario: Adding a new team
- **WHEN** an author creates `content/teams/<slug>.md` with a valid `name` and `description` in its frontmatter
- **THEN** the home page's Teams section renders the new card on the next build without any other file change

#### Scenario: Adding a new news post
- **WHEN** an author creates `content/news/<date>-<slug>.md` with valid frontmatter (`title`, `date`, `tag`, `excerpt`)
- **THEN** the home page's News section includes the new card on the next build AND `/news/<slug>` renders the post body

### Requirement: Frontmatter Validation at Build Time

The system MUST validate every content file's frontmatter against a `zod` schema defined in `lib/content/<type>.ts` before rendering. A validation failure MUST cause `next build` to exit non-zero with a file path and field name in the error message.

#### Scenario: Missing required field
- **WHEN** a news post frontmatter is missing the required `title` field
- **THEN** `next build` fails with an error referencing `content/news/<file>.md` and the missing field name

#### Scenario: Invalid enum value
- **WHEN** a team's `medal.variant` is `"goold"` (not in the allowed set)
- **THEN** `next build` fails with an error listing the valid values

#### Scenario: Optional field omitted
- **WHEN** a news post omits the optional `lead` field
- **THEN** `next build` succeeds and the post is treated as a regular (non-lead) card

### Requirement: Content Loaders Return Typed Data

The system MUST provide a typed loader function per content type (e.g. `getTeams()`, `getNews()`, `getNewsBySlug(slug)`). Loaders MUST return data parsed through `zod`, fully typed. Loaders MUST read files at build time using `fs/promises` from Server Components or route handlers — never from client components.

#### Scenario: Listing all teams
- **WHEN** a Server Component calls `getTeams()`
- **THEN** it receives a typed array of team objects, sorted by `frontmatter.order` ascending, with all required fields populated and optional fields typed as `T | undefined`

#### Scenario: Resolving a single news post
- **WHEN** `/news/[slug]/page.tsx` calls `getNewsBySlug(slug)`
- **THEN** it receives a single news object, or `null` if no file matches

### Requirement: Build Fails Closed on Content Errors

The system MUST NOT silently render empty or default content when a content file is malformed. A malformed frontmatter, missing required field, or invalid enum MUST fail the build; the deployed site MUST never contain the broken content.

#### Scenario: Silent default would be wrong
- **WHEN** a team file has `medal: { variant: "goold" }`
- **THEN** the home page does NOT render that team with an empty medal pill — instead, the build fails

### Requirement: Authoring Workflow Is Documented

The system MUST include a `README.md` at the repo root with a "How to add content" section. The section MUST explain, with one example per content type, how to add a team, a news post, a sponsor, a coach, a gallery photo, an honour row, a fixture, and a hero stat. The guide MUST be sufficient for a non-developer to add content without reading code.

#### Scenario: Author follows the README
- **WHEN** an author reads "How to add content" and follows the news post example
- **THEN** they can produce a new post that renders on the home page and at `/news/<slug>` after pushing to `main`