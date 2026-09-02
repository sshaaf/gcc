## Context

The WordPress site at `glostrupcricket.dk` ran from 2016 to 2024 and contains the club's actual history: 57 published posts, 7 pages (1 draft), and 177 image assets. A WXR export plus a hand-converted directory tree live at `wordpress-backup/output/`. The current Next.js site (`home-from-html` change) ships with only 3 seeded news posts and no static-info pages. We need to bring the legacy content forward so the new site carries the club's real history.

The WXR export was processed by an external script that produced Markdown files with frontmatter (`title`, `date`, `categories`) and partial shortcode cleanup. Image references in the export use a relative path (`images/<file>`) anchored to the post's directory. Post and page URLs follow the WP date-based permalink pattern (`/YYYY/MM/DD/<slug>/`).

The new site's content tree uses flat directories (`content/news/<slug>.md`, `content/gallery/<slug>.md`), zod-validated frontmatter, Server Components, and a Next.js Image-aware public directory. Routes are App Router-based: `/news/[slug]`, `/gallery/[slug]`, `/`. The legacy domain `glostrupcricket.dk` is currently live and serving traffic; it will be decommissioned after this change deploys.

The footer "Legacy site" link currently points at `glostrupcricket.wordpress.com` — a placeholder that was never validated. The actual legacy domain is `glostrupcricket.dk`.

## Goals / Non-Goals

**Goals:**
- Bring 57 posts and 6 publishable pages into the new content tree without losing content fidelity (text, images, dates, titles, slugs).
- Preserve the visual quality of the existing site; imported content slots into the design system without new component types.
- Preserve external legacy URLs after the WordPress site is decommissioned via edge rewrites.
- Provide a reproducible import workflow that can be re-run if the WXR export is regenerated.
- Fix the footer's "Legacy site" link to point at the correct domain.

**Non-Goals:**
- WP comments, author profiles, plugin tables, attachment records (these are in the SQL dump but not needed).
- Plugin shortcodes other than `[caption]` (the `[smartslider3]` draft is excluded; remaining shortcodes pass through as raw text).
- Image optimization beyond Next's defaults; no CDN config.
- Tag/category taxonomy work beyond preserving what's in the export.
- Migrating the WXR→Markdown conversion script into the repo (the import script is a one-off run; the resulting Markdown files are what we commit).

## Decisions

### 1. Posts go into a flat `content/news/` directory

**Choice:** All 57 posts land in `content/news/<slug>.md`, where `<slug>` is `<wp:post_name>` from the WXR export. The YYYY/MM nesting from the WP export directory is discarded.

**Rationale:** The existing `lib/content/news.ts` loader reads `content/news/*.md` as a flat list and sorts by date. Preserving the WP nesting would require restructuring the loader, gaining nothing.

**Alternatives considered:**
- *Keep YYYY/MM nesting* — would require the loader to recurse, special-case posts, and complicate slug uniqueness. Rejected.
- *Move posts into a `legacy/` subdirectory* — would segregate by source rather than by content type; rejected because the loader doesn't need to care about provenance.

### 2. Pages get a new `content/pages/` content type, not folded into news

**Choice:** Pages live at `content/pages/<slug>.md` with their own loader (`lib/content/pages.ts`) and route (`/<slug>`).

**Rationale:** Pages and posts serve different purposes. Posts are dated, chronologically ordered; pages are timeless static info. Different schemas, different routes. Folding them together would compromise both.

**Alternatives considered:**
- *Pages as a special "post" with `type: page`* — possible but conflates two distinct concepts in one schema. Rejected.
- *Hard-code pages as TSX files* — defeats the purpose of "everything is in `content/`." Rejected.

### 3. Page route is `/<slug>` with a reserved-path exclude list

**Choice:** The page route uses Next.js's catch-all dynamic segment `[slug]` (single segment, not `[...slug]`). The page component checks the slug against a reserved-paths list and calls `notFound()` if it collides.

**Rationale:** The user chose shorter URLs (`/bestyrelsen` over `/pages/bestyrelsen`) despite the collision risk. A reserved-paths list is a small price for cleaner URLs. The list lives as a constant in the page component, not in `vercel.json`, because `notFound()` produces a real 404 that Next.js handles correctly.

**Alternatives considered:**
- *Route group `(pages)/[slug]`* — would require moving other routes into route groups, a much larger refactor. Rejected.
- *Use Next.js middleware to exclude reserved paths* — possible but adds a runtime cost on every request; the in-component check is cheaper. Rejected.
- *Use `[...slug]` and match exact slugs only — complicates the path matching and is harder to reason about. Rejected.

### 4. `vercel.json` rewrites at the edge, generated from the WXR export

**Choice:** `vercel.json` at repo root contains one `rewrites` rule per imported post and page. Format:

```json
{
  "rewrites": [
    { "source": "/2017/03/06/hej-verden", "destination": "/news/hej-verden" },
    { "source": "/2017/03/14/bestyrelsen", "destination": "/bestyrelsen" }
  ]
}
```

**Rationale:** Vercel rewrites run at the edge before the request reaches Next.js, so they cost nothing at runtime. The rewrite map is generated once from the WXR export and committed; it's deterministic and reviewable in PRs.

**Alternatives considered:**
- *Next.js `redirects()` in `next.config.ts`* — works, but adds a runtime cost and requires a server-side render to produce the redirect. Edge rewrites are free.
- *Wildcard rewrite with query parameters* — `/<YYYY>/<MM>/<DD>/<slug>` rewritten via regex. Cleaner config but harder to verify each mapping; explicit per-URL rewrites are more auditable.

### 5. Footer URL constant changes

**Choice:** `lib/constants.ts#WORDPRESS_URL` is updated from `https://glostrupcricket.wordpress.com` to `https://www.glostrupcricket.dk`.

**Rationale:** The current value was a placeholder used during the MVP because the actual domain wasn't verified. It's been verified now (HTTP 200, valid WP site). Correcting the constant is the only code change needed — `Footer.tsx` reads the constant.

**Alternatives considered:**
- *Leave the placeholder, mark as TODO* — wrong, since we now know the real value. Rejected.

### 6. Pages go to `/<slug>` directly, with reserved-path checks

**Choice:** The page route component checks the slug against `RESERVED_SLUGS = ['news', 'gallery', 'contact', 'about', ...]`. Reserved slugs call `notFound()` so Next.js returns 404 instead of trying to render a missing page.

**Rationale:** The reserved-path list is small and stable. It catches current and likely future routes without coupling the page route to the rest of the site.

**Alternatives considered:**
- *Generate the reserved list from the file system at build time* — over-engineered; the list rarely changes.

### 7. Image references: rewrite to absolute `/wp-images/...`

**Choice:** All `images/<file>` references in post bodies are rewritten to `/wp-images/<YYYY>/<MM>/<file>` during import. The images directory tree is mirrored under `/public/wp-images/<YYYY>/<MM>/`.

**Rationale:** Using absolute paths matches how the new site's gallery (`<Image src="/wp-images/...">`) handles assets. The YYYY/MM prefix preserves the WP structure for cross-references.

**Alternatives considered:**
- *Flatten images to `/public/wp-images/<file>`* — would lose the WP structure but make URLs shorter. Not worth losing the structure.

### 8. Excerpt generation from first paragraph

**Choice:** Posts without `<excerpt:encoded>` in the WXR (the majority) get an `excerpt` field generated from the first paragraph of body text after shortcode cleanup. Limit: 200 chars max. Truncation prefers sentence boundaries.

**Rationale:** The home page News section shows the excerpt as a card preview. Posts without excerpts would render empty previews, which look broken. Generating a reasonable excerpt is better than missing excerpts.

**Alternatives considered:**
- *No excerpt, leave field empty* — zod schema requires excerpt, so the build would fail. Not viable.
- *Always require manual excerpt* — too much editorial overhead for 57 posts.

### 9. Categories → tag mapping with fallback

**Choice:** `categories: [x]` in the WXR frontmatter maps to `tag: x` in our schema, taking the first category. `"ikke-kategoriseret"` (uncategorized) maps to `"Club News"`.

**Rationale:** Our schema has `tag` as a single string. The WP posts each have one category. Picking the first preserves what was there; the fallback prevents "Uncategorized" appearing as a tag on the home page.

**Alternatives considered:**
- *Multi-tag support (`tags: [a, b, c]`)* — could be added later but requires schema changes for all 3 seeded news posts. Out of scope for this MVP.

### 10. Caption shortcode cleanup

**Choice:** The import script converts `[caption id="..." align="..." width="..."][![](path)](url) caption text[/caption]` to `![](path)\n\n*caption text*`. The caption text is italicized for visual distinction.

**Rationale:** Captions on images are useful editorial content. Plain `[caption]...[/caption]` markup is WP-specific and renders as raw text in our Markdown pipeline, looking broken.

**Alternatives considered:**
- *Strip captions entirely* — loses editorial content. Rejected.

### 11. WP export script is NOT committed

**Choice:** The WXR→Markdown conversion was done by an external script that's not in the repo. The resulting Markdown files are what we commit. The script is a one-off, not a recurring tool.

**Rationale:** The conversion logic is complex (HTML→MD, attachment URL rewriting, shortcode handling, image download) and not reusable — re-running it requires re-downloading the WXR. The output (committed Markdown) is the source of truth going forward.

**Alternatives considered:**
- *Commit the export script* — premature; we'd be committing tooling that isn't part of the build or content workflow. Rejected.

## Risks / Trade-offs

- **[Risk]** Caption-shortcode regex may fail on edge cases (multiline captions, embedded HTML) → **Mitigation**: accept best-effort cleanup; author can edit resulting Markdown if needed. Track any unconverted captions in a follow-up pass.
- **[Risk]** 57 posts at once on the home page may overwhelm the design (the design's news grid shows 1 lead + 2 cards) → **Mitigation**: the design is unchanged; we keep the 3-most-recent rule. Older posts remain at `/news/<slug>`. No visual regression.
- **[Risk]** Reserved-slug list misses a future route → **Mitigation**: the list is small and explicit. New routes added later must update the list. A test or a build-time assertion can guard against collisions if desired (out of scope for this MVP).
- **[Risk]** `vercel.json` rewrites intercept requests intended for the home page (e.g. `/2024/` could match a year path) → **Mitigation**: rewrites are anchored to the full YYYY/MM/DD/slug pattern; no year-only or month-only paths are mapped.
- **[Risk]** Image filenames with Danish characters (`Søren`, `å`) may not survive encoding round-trips → **Mitigation**: copy via `cp -n` directly; verify the first 5 imports visually after the script runs.
- **[Risk]** Slug collisions between posts and pages → **Mitigation**: scan the WXR before import. If collision found, append `-page` to the page slug or use the date prefix.
- **[Risk]** Footer's corrected URL points at a site that may be decommissioned → **Mitigation**: this is the user's call. The Vercel rewrites preserve the URLs after decommission, so external clicks keep working.
- **[Risk]** Repo's image footprint grows ~7 MB → **Mitigation**: acceptable for an MVP. Git LFS is out of scope. Future passes can move images to a CDN if needed.

## Migration Plan

1. **Verify imports first**: dry-run the script in a temp directory, count files, spot-check 3 posts visually.
2. **Generate `vercel.json` rewrites**: walk the WXR's `<item>` elements, build the rewrite map, write `vercel.json`. Verify JSON validity.
3. **Move content files**: copy and remap `wordpress-backup/output/posts/**/*.md` → `content/news/<slug>.md`. Move `pages/*.md` (excluding drafts) → `content/pages/<slug>.md`.
4. **Move images**: copy `wordpress-backup/output/**/images/*.{jpg,png,gif}` → `public/wp-images/<YYYY>/<MM>/<file>`. Update post-body image references.
5. **Add `app/[slug]/page.tsx`**: dynamic page route with reserved-path check.
6. **Update `lib/constants.ts`**: WORDPRESS_URL → `https://www.glostrupcricket.dk`.
7. **Update `components/Nav.tsx`**: add 6 page links.
8. **Build verification**: `npm run build` — confirm zod schemas accept the remapped frontmatter, confirm reserved-path logic works.
9. **Commit and deploy**: single commit covering all changes; push to `main`; `vercel deploy --prod` (or rely on the GitHub App integration if it's been wired).
10. **Smoke test**: visit 3 imported posts, 1 imported page, one legacy WP URL (rewritten), the footer link.

**Rollback**: revert the commit. No DB to roll back. `.vercel/project.json` already on Vercel; redeploys revert automatically. The WordPress site remains live during the rollback window so external URLs continue working.

## Open Questions

- *Slug `traening`*: the WP slug is `traening` (no Danish `æ`). Confirmed in the export. No action needed.
- *Klub Info page content*: it imports as a thin page. Should we expand it from contact info, or leave as-is? Defer to editorial review after import.
- *Scorecards page*: it links externally (to scoresheet PDFs on the WP site). If WP goes down, those links break. Decision: link rewrites for these PDFs are out of scope; the page renders with broken external links as a known limitation.
- *Nav order*: should the 6 page links replace the existing nav items, or be added after? Decision (user-confirmed): added after "Contact" in the existing nav.