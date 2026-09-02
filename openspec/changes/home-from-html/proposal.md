## Why

The Glostrup Cricket Club has an approved visual redesign — currently a single static HTML file at the repo root (`glostrup-cricket-redesign.html`). To launch, we need that design running as a real website, with content editable by non-developers, deployed automatically from source control, and ready to grow (news, match reports, sponsors, coaches, gallery) without re-platforming. The MVP builds the foundation: a Next.js app where all site content lives as Markdown in the repo, GitHub is the single source of truth, and Vercel deploys on every push.

## What Changes

- **Scaffold a Next.js 15 (App Router, TypeScript) project** at the repo root. No Tailwind — plain CSS to preserve the design's token system faithfully.
- **Port the existing HTML redesign** into React Server Components, one component per section. The `IntersectionObserver` reveal-on-scroll logic becomes one small client component, reused per section.
- **Add a Markdown content tree** at `/content/**` for every content type the home page uses (home, stats, teams, honours, fixtures, news, sponsors, coaches, gallery, contact) and for two dynamic routes (`/news/[slug]`, `/gallery/[slug]`). Frontmatter is validated by `zod` schemas at build time.
- **Add a `/news/[slug]` dynamic route** that renders a single news or match-report post from `content/news/*.md`. Match reports use the same content type with a `type: "match-report"` frontmatter field and optional scorecard fields.
- **Add a `/gallery/[slug]` dynamic route** that renders a photo gallery from `content/gallery/*.md`, with images served from `/public/gallery/<slug>/`.
- **Wire content into every section** of the home page so that the site renders the seeded Markdown, not hardcoded TSX strings. The home page composition order is: Topbar, Nav, Hero, MatchCentre, Teams, Honours, Coaches, Ground, Sponsors, News, Gallery preview, Join, Footer.
- **Add two new sections** to the home page: Coaches (grid, between Honours and Ground) and Sponsors (logo strip, between Ground and News).
- **Keep "Join the Club" buttons inert.** All `Join the Club`, `Become a Member`, and `Sign up for a trial session` buttons remain `<a href="#…">` anchors with the existing scroll behavior. No click handler, no route, no API.
- **Add a "Legacy site" footer link** to the existing WordPress archive so the club's 10 years of content remains reachable during migration.
- **Connect deployment to GitHub via Vercel CLI.** `vercel link` creates the project; `vercel git connect` installs the Vercel GitHub App on `sshaaf/gcc`. After this, every push to `main` triggers a production deploy.
- **Seed content** in `/content/**` from the data already present in the HTML file (teams, honours, fixtures, contact, hero stats). Add a first news post (GCC honoured at the Glostrup Sports Gala 2025, dated November 2025). Add one sponsor placeholder and one coach placeholder so new content types are not empty.
- **Add a README** with an authoring guide: how to add a news post, how to add a sponsor, how to add a gallery photo.

## Capabilities

### New Capabilities

- `site-content-management`: Content tree shape, frontmatter schemas (per content type), loaders, and the authoring workflow. This capability defines what "adding a news post" or "adding a team" looks like and guarantees that a missing or malformed frontmatter field fails the build, not production.
- `site-home-page`: The home page's section composition, the order of sections, which content type feeds which section, and the rule that all home page content is rendered from Markdown (not hardcoded in components).
- `site-dynamic-routes`: The `/news/[slug]` and `/gallery/[slug]` routes — how slugs resolve to Markdown files, what fields are required vs optional (e.g. scorecard fields only for match reports), and how 404s behave for unknown slugs.
- `site-deployment`: The deployment topology — GitHub as source of truth, Vercel CLI as the integration, push-to-deploy on `main`, build-time content reading, and the expectation that environment-specific secrets (if any are added later) live in Vercel's environment configuration, never in the repo.

### Modified Capabilities

_None. There are no existing specs to modify._

## Impact

- **Files added**: Next.js scaffold (`package.json`, `next.config.ts`, `tsconfig.json`, `app/`, `components/`, `lib/`, `public/`), `/content/**` directory tree, `README.md`.
- **Files removed or moved**: `glostrup-cricket-redesign.html` is moved to `legacy/glostrup-cricket-redesign.html` (kept for reference) so it is not shipped with the Next.js build.
- **New runtime dependencies**: `next`, `react`, `react-dom`, `gray-matter`, `remark`, `remark-html`, `zod`. (Plus `typescript` and `@types/*` for dev.)
- **GitHub remote**: `https://github.com/sshaaf/gcc` — already exists, currently empty. First push will contain the entire MVP in one commit (or a small handful of logical commits).
- **Vercel**: new project created via CLI, owned by user `shaaf`. Public preview URLs will be available immediately; production deploys require the GitHub App installation step.
- **Domain**: defaults to `*.vercel.app`. Custom domain (`glostrup-cricket.dk` or similar) is out of scope for MVP and will be wired in the Vercel dashboard separately.
- **Breaking changes**: none to existing users — the site has no production traffic yet.
- **Out of scope for this MVP** (captured for future work, not in this change): lightbox for galleries, WordPress URL redirects, CMS/draft mode, scheduled publish, search, full i18n, sitemap/robots, custom analytics.