## Why

The WordPress site at `glostrupcricket.dk` has run for ten years and contains 57 published posts, 7 pages, and ~177 image assets — the actual history of the club. Today, none of it lives in the new Next.js site; `content/news/` only has three 2025 seed posts. We need to bring that history forward into the new content tree so the home page News section shows real club history, the static information pages (Bestyrelsen, Kontingent, Træning, Bliv Medlem, Scorecards, Klub Info) become first-class content types on the new site, and external links from the live WordPress site keep working as that site ages out.

## What Changes

- **Import 57 legacy posts** from `wordpress-backup/output/posts/YYYY/MM/*.md` into `content/news/<slug>.md`, flattening the date-based directory structure to match the existing `news/` loader. Skip the draft (`pages/_drafts/id-516.md`).
- **Remap frontmatter** during import: `categories: [x]` → `tag: x` (first category wins); generate `excerpt` from the first body paragraph; preserve `date` and `title`; do not set `lead` on any imported post.
- **Clean up WordPress shortcodes** in post bodies: convert `[caption]![](path) caption text[/caption]` → `![](path)\n\n*caption text*`. Other shortcodes (`[gallery]`, `[smartslider3]`) remain as raw text — most affected posts are drafts already excluded.
- **Move all image variants** (177 files) from `wordpress-backup/output/posts/YYYY/MM/images/*.jpg` (and the pages/images directory) into `public/wp-images/<YYYY>/<MM>/<original-filename>`, preserving the WP month-based structure so cross-references in post bodies stay valid. Update each post body's image references from `images/<file>` to `/wp-images/<YYYY>/<MM>/<file>`.
- **Import 6 publishable pages** (Bestyrelsen, Kontingent, Træning, Bliv Medlem, Scorecards, Klub Info) into a new `content/pages/<slug>.md` directory, one file per page, no date nesting. Skip the draft page (`_drafts/INFOSKÆRM`).
- **Add a new dynamic route** `/<slug>` (catch-all for imported pages) that renders a static-info page with title and rendered Markdown body. The route MUST exclude reserved paths (`/news`, `/gallery`, `/contact`, `/`, `/api`, `/_next`, `/favicon.ico`, etc.) to avoid collision with existing routes and Next.js internals.
- **Update footer link**: change `lib/constants.ts#WORDPRESS_URL` from `glostrupcricket.wordpress.com` (incorrect placeholder) to `glostrupcricket.dk` (the live legacy domain).
- **Add `vercel.json` rewrites** that map old WordPress permalinks (`/YYYY/MM/DD/<slug>/`) to the new site's URLs: `/news/<slug>` for posts, `/<slug>` for pages. Only generate rewrites for posts/pages we're actually importing. The rewrites preserve legacy URLs even after the WordPress site is decommissioned.
- **Add 6 nav links** to the top navigation for the imported pages (Bestyrelsen, Kontingent, Træning, Bliv Medlem, Scorecards, Klub Info). Order them after "Contact".
- **Home page News section behavior**: after import, the 3 most-recent WP posts (latest is 2024-03-03) take over the home page lead+grid slots. The 3 seeded 2025 posts remain live at `/news/<slug>` but no longer appear on the home page.

## Capabilities

### New Capabilities

- `site-pages`: A new content type `content/pages/<slug>.md` and a new dynamic route `/<slug>` for static informational pages imported from the legacy WordPress site. Pages are flat (no date nesting), validated by zod, and rendered with the same Markdown pipeline as news posts. The route MUST NOT collide with existing reserved paths.

- `site-legacy-redirects`: A `vercel.json` rewrite map that translates legacy WordPress permalinks (`/YYYY/MM/DD/<slug>/`) to the new site's URLs. Source of truth for the redirect map is the WXR export's `<wp:post_name>` and `<wp:post_date_gmt>` fields. Rewrites apply at the edge before reaching Next.js routing.

### Modified Capabilities

- `site-content-management`: The news loader's flat-directory contract is unchanged (posts at `content/news/<slug>.md`), but the **import workflow** is now part of the capability. The capability MUST cover: how to import a WordPress WXR export, how to remap frontmatter (`categories` → `tag`), how to generate `excerpt` when missing, and how to handle WordPress shortcodes in body content.

- `site-home-page`: The home page's News section composition rule changes. Previously it rendered 3 most-recent posts. Now it additionally states that the lead card is the post marked `lead: true` if present, falling back to the most-recent post. No more `lead: true` is set during WP import; the 2024-03 post becomes the lead by default.

- `site-deployment`: The footer link to the legacy WordPress site points at the actual legacy domain (`glostrupcricket.dk`), not the `.wordpress.com` placeholder used during MVP. The deployment capability additionally covers `vercel.json` rewrites for legacy URL preservation.

## Impact

- **Content directory**: gains `content/pages/` (6 files), `content/news/` gains 57 files (total 60 news files).
- **Public assets**: gains `public/wp-images/YYYY/MM/*.{jpg,png,gif}` (177 files, ~7 MB estimated). Repo size grows by ~7 MB.
- **Routes**: gains `app/[slug]/page.tsx` for imported pages (with reserved-path exclusion).
- **Config**: `lib/constants.ts` updates `WORDPRESS_URL`. New `vercel.json` at repo root with the redirect map.
- **Navigation**: `components/Nav.tsx` adds 6 page links.
- **Footer**: `components/Footer.tsx` automatically reflects the corrected `WORDPRESS_URL`.
- **OpenSpec**: this change adds 2 new capabilities (`site-pages`, `site-legacy-redirects`) and modifies 3 existing (`site-content-management`, `site-home-page`, `site-deployment`).
- **External**: the WordPress site at `glostrupcricket.dk` continues to serve traffic until decommissioned. After decommission, Vercel rewrites preserve the permalinks.
- **Breaking**: none. All new URLs are additive; legacy URLs continue to work via the WP site (today) or via Vercel rewrites (after decommission).
- **Out of scope**: WP comments, WP author profiles, plugin-specific shortcodes (`smartslider3`), WP media attachments (treated as images, not as their own content), full-text search, scheduled publish, i18n.