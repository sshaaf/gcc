## ADDED Requirements

### Requirement: `/news/[slug]` Renders a Single Post

The system MUST provide a dynamic route at `/news/[slug]` that renders one Markdown file from `content/news/<file>.md` whose filename slug matches the URL parameter. The route MUST render the post's `title`, `tag`, `date`, `excerpt`, and full body (the prose below the frontmatter).

#### Scenario: Valid slug renders the post
- **WHEN** a user visits `/news/2025-11-sports-gala`
- **THEN** the page renders the title, tag, date, excerpt, and body of `content/news/2025-11-sports-gala.md`

#### Scenario: Body is sanitized HTML
- **WHEN** a post body contains standard Markdown (headings, lists, links, emphasis)
- **THEN** it renders as semantic HTML; raw `<script>` and dangerous inline event handlers in the source Markdown MUST NOT execute

### Requirement: `/gallery/[slug]` Renders a Single Gallery

The system MUST provide a dynamic route at `/gallery/[slug]` that renders one Markdown file from `content/gallery/<file>.md` whose filename slug matches the URL parameter. The route MUST render the gallery's `title`, `date`, and the list of photos as a responsive grid using Next's `<Image>` component. Each photo MUST render with its `alt` text and `caption` (if provided).

#### Scenario: Valid slug renders the gallery
- **WHEN** a user visits `/gallery/<slug>`
- **THEN** the page renders the gallery title, date, and a grid of photos with alt text

#### Scenario: Missing image file degrades gracefully
- **WHEN** a gallery frontmatter references a `src` path that does not exist on disk
- **THEN** the build fails with a clear error referencing the missing path (the system MUST NOT ship a broken image)

### Requirement: News and Match Reports Share One Content Type

News posts and match reports MUST be the same content type (`content/news/*.md`) with a `type` frontmatter field that defaults to `"news"` and may be set to `"match-report"`. Match reports MUST additionally support optional scorecard fields (`opponent`, `result`, `score`) that are validated only when `type === "match-report"`. Both types MUST render at `/news/<slug>`.

#### Scenario: Default post is a news post
- **WHEN** a file has no `type` field
- **THEN** it is treated as `"news"` and renders with the standard news layout at `/news/<slug>`

#### Scenario: Match report renders with scorecard
- **WHEN** a file has `type: "match-report"` and valid `opponent` and `score` fields
- **THEN** `/news/<slug>` renders the post body plus a scorecard block above it

#### Scenario: Scorecard fields rejected on news posts
- **WHEN** a file has `type: "news"` (or no `type`) but includes a `score` field
- **THEN** `next build` fails with an error explaining that scorecard fields are only valid for match reports

### Requirement: Unknown Slug Returns 404

The system MUST return a 404 response (Next's `notFound()`) when `/news/<slug>` or `/gallery/<slug>` is requested with a slug that does not match any content file. The 404 page MUST use the standard Next.js not-found UI.

#### Scenario: Slug with no matching file
- **WHEN** a user visits `/news/this-does-not-exist`
- **THEN** the server responds with HTTP 404 and the standard not-found page

### Requirement: Routes Are Statically Generated

`/news/[slug]` and `/gallery/[slug]` MUST be statically generated at build time using `generateStaticParams`. The set of generated paths MUST equal the set of filenames in `content/news/` and `content/gallery/` respectively. New files MUST appear in the deployed site on the next build without manual route registration.

#### Scenario: Adding a new post generates a new route
- **WHEN** a new file is added to `content/news/`
- **THEN** the next `next build` produces a static page for the new slug and includes it in the deployed output

#### Scenario: Removing a post removes the route
- **WHEN** a file is deleted from `content/news/`
- **THEN** the next `next build` does NOT produce a page for that slug; visiting the URL returns 404