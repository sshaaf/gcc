## Context

The Glostrup Cricket Club visual redesign exists as a single 743-line static HTML file at the repo root. The file uses Google Fonts (Archivo, Barlow, Barlow Condensed), a CSS variable token system (royal blue "pitch" palette, gold accents, Danish red), an inline `IntersectionObserver` for reveal-on-scroll, and one custom inline SVG crest. The design is approved and pixel-ready.

This change converts that HTML into a Next.js 15 application where all content is editable as Markdown files in the repo, with push-to-deploy via GitHub → Vercel. The MVP must be a faithful port of the design (no visual regression) and a foundation that scales to news, match reports, sponsors, coaches, galleries, and other content types without re-architecting.

Repo state at start:
- Git repo initialized locally, branch `main`, no commits yet, no remotes.
- Remote target: `https://github.com/sshaaf/gcc` (public, empty).
- `gh` CLI authenticated as `sshaaf` (active account is `aminskey`; will use `--user sshaaf` or `-R sshaaf/gcc` for repo-scoped calls).
- Vercel CLI authenticated as `shaaf`. No existing Vercel project.

Key constraints from the user:
- "Join the Club" buttons are decorative — no handler, no route.
- Content is Markdown, repo is source of truth.
- WordPress archive remains reachable via a footer link; no redirects, no migration tooling in MVP.
- Public GitHub repo.

## Goals / Non-Goals

**Goals:**
- Faithful 1:1 visual port of `glostrup-cricket-redesign.html`.
- All home page content sourced from `/content/**/*.md` with typed frontmatter.
- Two dynamic routes: `/news/[slug]` and `/gallery/[slug]`.
- Build fails on missing or malformed frontmatter (zod validation).
- Push-to-deploy on `main` via Vercel GitHub App, configured through Vercel CLI.
- Authoring guide in README so non-developers can add content.

**Non-Goals:**
- Lightbox for galleries.
- WordPress URL redirects (1:1 or wildcard).
- CMS / draft mode / scheduled publishing.
- Search.
- Full i18n (Danish + English locale switching).
- Sitemap / robots.txt customization beyond Next defaults.
- Custom analytics (Vercel Analytics / Speed Insights can be added later via dashboard).
- Custom domain wiring (handled in Vercel dashboard, not in this change).
- Migration of WordPress content into `/content/**` (user-driven, future change).

## Decisions

### 1. Next.js 15 with App Router

**Choice:** App Router, Server Components by default, minimal client components.

**Rationale:** The page is content-heavy and read-mostly. RSC lets us read Markdown at build time without shipping parsers to the browser. App Router is the default going forward; Pages Router would be a deliberate step backward. ISR is available later if any section needs freshness beyond build time.

**Alternatives considered:**
- *Pages Router* — simpler mental model but legacy; we'd lock ourselves out of RSC, server actions, and the route-group pattern we'll likely want for `/news/[slug]` vs `/gallery/[slug]`.
- *Static export (`output: 'export'`)* — pure HTML, edge-friendly, but no server features. Fine for a pure content site today, but we'd need to revisit it the moment we add a contact form or ISR.

### 2. Plain CSS via `app/globals.css`

**Choice:** One global CSS file containing all styles, ported verbatim from the HTML's `<style>` block, with design tokens at `:root`. CSS variables stay; no Tailwind, no CSS-in-JS, no PostCSS plugins beyond Next defaults.

**Rationale:** The HTML already has a deliberate, complete CSS token system. A 1:1 port preserves the design exactly and avoids the cost of re-translating ~470 lines of CSS into utility classes. The design system is small and stable enough that CSS Modules' scoping benefit doesn't justify the refactor.

**Alternatives considered:**
- *Tailwind* — faster iteration long-term, but the v1 cost (re-expressing every selector as utilities) is high for a one-shot port. Can be adopted later if the site grows.
- *CSS Modules per component* — fine, but the design's selectors are global (`.hero`, `.team-grid`, `.crest-badge`) and benefit from being defined once.

### 3. Content in `.md` (not `.mdx`)

**Choice:** Plain Markdown with YAML frontmatter, parsed by `gray-matter`, rendered by `remark` + `remark-html` to a sanitized HTML string. No MDX.

**Rationale:** The MVP content is structured (teams, sponsors, coaches, fixtures, stats) or prose (news posts, gallery captions). MDX's React-embedding power is not needed. Plain Markdown keeps authoring approachable for non-developers and keeps the build simpler.

**Alternatives considered:**
- *MDX* — useful if we ever need to embed a stats component or interactive widget mid-article. Trivial to add later (swap the loader) without breaking existing `.md` files.
- *JSON/YAML only (no prose)* — too rigid for news posts and gallery captions, which need body text.

### 4. `zod` schema validation at build time

**Choice:** Each content type has a `zod` schema in `lib/content/<type>.ts`. Loaders parse frontmatter through the schema; a parse failure aborts the build with a clear error.

**Rationale:** Markdown frontmatter is a string contract between authors and the site. Without validation, a typo (`medal.variant: "goold"`) silently renders nothing in production. `zod` gives typed, inferred TypeScript types and one source of truth.

**Alternatives considered:**
- *Hand-rolled types* — works for v1, but every content type doubles the boilerplate. `zod` is one small dep with high payoff.
- *No validation* — fastest, but the first typo becomes a production bug.

### 5. RSC content reads via Node `fs`

**Choice:** Content loaders live in `lib/content/<type>.ts` and read files at build time using `fs/promises`. Loaders are called from Server Components (the page and dynamic routes). No client JS, no API routes for content.

**Rationale:** This is a static site; content is known at build time. Using `fs` keeps content reads on the server (the build server) and out of the browser bundle. Loaders are tree-shaken into the build and don't ship to clients.

**Alternatives considered:**
- *Runtime fetch from an API route* — unnecessary indirection; adds latency and a failure mode.
- *Direct `import` of `.md` files via Turbopack/webpack* — works for fixed-import cases, but breaks for `getStaticParams`-style dynamic routes where we need to enumerate files at build time.

### 6. File-based content layout

**Choice:** One Markdown file per item, indexed by filename. Examples:

```
content/teams/senior-men.md
content/teams/women.md
content/teams/u18-u15.md
content/teams/u13-oldboys.md

content/news/2025-11-sports-gala.md
content/news/2025-09-women-silver.md
content/news/2025-08-youth-medals.md

content/honours/danish-championship.md
content/honours/dm-silver-medals.md
... (one per row in the HTML's honour list)
```

Lists are produced by reading the directory and sorting by frontmatter `order` field, then by `date` for news. This means "add a team" = "add a file," not "edit a config."

**Rationale:** File-based composition scales, version-controls cleanly, and survives merges better than a single big config file. Git history of `/content/teams/senior-men.md` is the history of that team.

**Alternatives considered:**
- *Single `content/teams/index.md` with all teams in one file's frontmatter* — simpler to seed but harder to review (one big diff per change). One-file-per-item wins for the kind of edits a club makes.

### 7. Section order is code, not content

**Choice:** The home page's section order is fixed in `app/page.tsx`. Content files are not responsible for ordering themselves onto the page.

**Rationale:** Section order is a layout decision, not a content decision. If we made it content-driven (each section declaring its position), one wrong field would silently break the page. Code-defined order means a reviewer sees the structure in one file.

### 8. "Join the Club" stays as an in-page anchor

**Choice:** All `Join the Club`, `Become a Member`, and `Sign up for a trial session` buttons render as `<a href="#join">` / `<a href="#contact">` / `<a href="#contact">` with the existing CSS. No `onClick`, no route handler, no `useRouter`. Smooth-scroll behavior is the browser's default (the HTML already sets `html { scroll-behavior: smooth }`).

**Rationale:** User explicitly said "do not implement it; it will just be there until I decide later." Anchors preserve visual presence, accessibility (real focusable elements, real URL hash), and the existing scroll UX — all without committing to an interaction design that hasn't been decided.

### 9. Vercel deployment via CLI

**Choice:** `vercel link` creates a Vercel project in `shaaf`'s team. `vercel git connect` installs the Vercel GitHub App on `sshaaf/gcc`. After that, every push to `main` triggers a production deploy. First deploy via `vercel deploy --prod`.

**Rationale:** CLI-led matches the user's framing ("you have gh and vercel cli; both are logged in"). It also keeps deployment config in code (`.vercel/project.json`) for reproducibility, while leaving the GitHub App installation as a one-time click the CLI walks through.

**Alternatives considered:**
- *Dashboard-led import* — works fine, but the user explicitly framed this as a CLI task.

### 10. Legacy HTML is moved, not deleted

**Choice:** `glostrup-cricket-redesign.html` is moved to `legacy/glostrup-cricket-redesign.html` so it ships outside the Next.js build but remains in the repo as design reference.

**Rationale:** The HTML is the source of truth for the visual design. If we ever need to compare a rendered page against the original pixel-for-pixel, we have the original CSS to diff against. Cheap insurance.

### 11. Image strategy

**Choice:** Use Next.js' built-in `<Image>` for all photos (coaches, gallery). Logos (sponsors, crest) stay as inline SVG or `<img>`. Sponsor logos in `public/sponsors/*.svg` (vector, sharp at any size). Coach photos and gallery images in `public/coaches/*.jpg` and `public/gallery/<slug>/*.jpg`.

**Rationale:** `<Image>` gives us automatic responsive sizing, lazy loading, and format negotiation without any image CDN config. SVG for logos is the right format for crisp display across DPI.

### 12. Authoring guide as a README, not docs/

**Choice:** `README.md` at repo root contains a "How to add content" section. No separate docs site, no `CONTRIBUTING.md`.

**Rationale:** MVP. README is where GitHub surfaces it; contributors will find it. We can split later if it grows past a screen or two.

## Risks / Trade-offs

- **[Risk]** Content reads at build time mean a typo in frontmatter breaks the build, not the deployed site. → **Mitigation**: zod schemas with clear error messages; CI step on PR is `next build` (Vercel preview deploys surface the failure to the author).
- **[Risk]** `vercel git connect` is the first interactive CLI step that may require browser-based GitHub App approval. → **Mitigation**: Document the step in the README; the CLI prints a URL the user follows. The build itself does not depend on this step.
- **[Risk]** Active `gh` account is `aminskey`, not `sshaaf`. Repo operations against `sshaaf/gcc` work via `gh -R sshaaf/gcc`, but `gh repo create` style calls would fail. → **Mitigation**: Repo already exists, so no creation needed. Any future `gh api` calls will use `gh auth switch --user sshaaf` or `-R sshaaf/gcc`.
- **[Risk]** The HTML uses one Google Fonts URL that references three families with many weights. Weights are tuned for display; truncating them changes line-heights and visual rhythm. → **Mitigation**: Port the exact `<link>` tag from the HTML into the App Router layout's `<head>`; do not refactor.
- **[Risk]** `IntersectionObserver` reveal-on-scroll is currently a single inline `<script>`. As a client component, it must be loaded only where needed. → **Mitigation**: A single `<Reveal>` client component that wraps section content; sections that opt in use it, others don't. Respect `prefers-reduced-motion` as the HTML does.
- **[Risk]** Footer "Legacy site" link is hardcoded to a single URL, but the WP site has many pages. → **Mitigation**: Single link to the WP homepage in MVP. Per-URL redirects are out of scope; can be added later via `vercel.json` rewrites.
- **[Risk]** Image-heavy galleries could bloat the build. → **Mitigation**: Use Next's `<Image>` with `sizes` and `priority=false`; defer loading of offscreen images. No CDN config needed at MVP scale.
- **[Risk]** TypeScript strict mode + `zod` inference can drift if schemas are edited without re-running the build. → **Mitigation**: `next build` is the source of truth; TS errors and zod errors both fail the build.
- **[Risk]** Public repo means anyone can see the build config and content drafts. → **Mitigation**: Acceptable for a public club site. No secrets in repo; Vercel env vars (none in MVP) live in Vercel.

## Migration Plan

This is the deployment plan, since "migration" here means "from static HTML to Next.js":

1. **Local scaffold + commit** (no remote push yet): scaffold Next.js, port CSS, add content + components, ensure `next build` and `next dev` both render the home page correctly.
2. **First commit on `main`**: contains the entire MVP. The repo's first commit is large; this is intentional and called out in the proposal.
3. **Push to `github.com/sshaaf/gcc`**: `git push -u origin main`.
4. **`vercel link`**: creates the Vercel project in `shaaf`'s team, writes `.vercel/project.json`.
5. **`vercel git connect`**: walks through GitHub App installation for `sshaaf/gcc`. CLI prints a URL if browser interaction is needed.
6. **`vercel deploy --prod`**: first production deploy. Subsequent pushes auto-deploy.
7. **Smoke test**: visit the Vercel URL, confirm all sections render, confirm reveal-on-scroll works, confirm `/news/<slug>` resolves.

**Rollback**: revert the commit (`git revert <sha>`); Vercel auto-deploys the previous version. No database to roll back (no DB). No env vars to roll back. Single-step rollback.

## Open Questions

- **Vercel project name**: defaults to `gcc` (matching the repo). Can be changed in the Vercel dashboard. Leaving as-is for MVP.
- **Branch protection**: out of scope for MVP. The `main` branch is unprotected initially. If the user wants PR-based deploys later, that's a follow-up.
- **Default `vercel.json`**: leaving unset. Next.js auto-detection handles routing. Will revisit if we add redirects (WP legacy) or headers (CSP).
- **Danish copy**: the HTML contains Danish phrases ("Siden 2. April 1959", "Kvinder og herrer", "fællesskab"). MVP keeps them as-is, English elsewhere. If we ever add full i18n, this is the seed string inventory.
- **Custom domain**: out of scope; will be added in Vercel dashboard by the user.