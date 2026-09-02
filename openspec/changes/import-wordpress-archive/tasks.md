## 1. Pre-import verification

- [x] 1.1 Spot-check 3 random WP posts in `wordpress-backup/output/posts/` to confirm the export shape matches what the import script expects.
- [x] 1.2 Verify all 7 page files in `wordpress-backup/output/pages/` and confirm which 6 are kept (skip `_drafts/id-516.md`).
- [x] 1.3 Confirm `wordpress-backup/glostrupcricketclub.WordPress.2026-09-02.xml` contains `<link>` elements with the legacy permalinks (used to build `vercel.json`).
- [x] 1.4 Confirm `glostrupcricket.dk` resolves (HTTP 200) and document the URL pattern in a code comment.

## 2. Import script scaffolding

- [x] 2.1 Create `scripts/import-wp.mjs` (Node ESM) with a CLI entry point: `node scripts/import-wp.mjs <path-to-wxr.xml> [--dry-run] [--src <output-dir>]`.
- [x] 2.2 Add `gray-matter`, `turndown`, `fast-xml-parser` to `package.json` devDependencies (the import script is dev-only tooling).
- [x] 2.3 In the script, parse the WXR's `<channel>` and iterate `<item>` elements. Skip items where `wp:post_type` is not `post` or `page`, or `wp:status` is not `publish`.
- [x] 3.1 For each `post` item: extract `wp:post_name`, `wp:post_title`, `wp:post_date` (YYYY-MM-DD), and `category` elements with `domain=category` (use the first non-`ikke-kategoriseret` category, fall back to `"Club News"`).
- [x] 3.2 Generate `excerpt` from `<excerpt:encoded>` if non-empty, otherwise from the first paragraph of the cleaned body (200 chars max, prefer sentence boundary).
- [x] 3.3 Run the caption-shortcode cleanup regex on the body: `[caption]![](path) text[/caption]` → `![](path)\n\n*text*`.
- [x] 3.4 Rewrite image references in the body: `images/<file>` → `/wp-images/<YYYY>/<MM>/<file>` using the post's date.
- [x] 3.5 Write `content/news/<wp:post_name>.md` with the remapped frontmatter and cleaned body. No `lead: true` set.
- [x] 4.1 For each `page` item: extract `wp:post_name`, `wp:post_title`, and `wp:post_date`.
- [x] 4.2 Skip `wp:post_name = id-516` (the INFOSKÆRM draft).
- [x] 4.3 Write `content/pages/<wp:post_name>.md` with frontmatter `{ title, date }` and the cleaned body. No `tag` or `excerpt` field.
- [x] 4.4 Handle slug collisions: if a page slug matches a post slug, append `-page` to the page slug.
- [x] 5.1 Walk `wordpress-backup/output/**/images/` and copy every `.jpg`, `.png`, `.gif` to `public/wp-images/<YYYY>/<MM>/<original-filename>`. Preserve filenames exactly (Danish characters OK).
- [x] 5.2 Spot-check 5 image paths from post bodies to confirm the referenced files exist under `public/wp-images/`.
- [x] 10.1 In the import script (or a separate script `scripts/gen-redirects.mjs`), walk the WXR and emit a `rewrites` array: for each post, `{ source: "/<YYYY>/<MM>/<DD>/<slug>", destination: "/news/<slug>" }`; for each page, `{ source: "/<YYYY>/<MM>/<DD>/<slug>", destination: "/<slug>" }`. No trailing slashes.
- [x] 10.2 Write `vercel.json` with the rewrites array. Add a top-level `buildCommand` and `framework` if needed (check Vercel auto-detection still works without them).
- [x] 10.3 Validate `vercel.json` is valid JSON and contains one entry per imported post + page (57 + 6 = 63 entries).

## 6. Pages schema and loader

- [x] 6.1 Create `lib/content/pages.ts` with zod schema `{ title, date }` and loader `getPages()` returning `Array<Page & { slug }>`.
- [x] 6.2 Re-export from `lib/content/index.ts`.

## 7. Pages route

- [x] 7.1 Create `app/[slug]/page.tsx` as a Server Component. Define `RESERVED_SLUGS = ['news', 'gallery', 'contact', 'about', 'api', '_next', 'favicon.ico', '']`.
- [x] 7.2 In the component: if `params.slug` is in `RESERVED_SLUGS` or the page doesn't exist, call `notFound()`.
- [x] 7.3 Render the page with `<h1>{title}</h1>`, the rendered Markdown body via `renderMarkdown()`, and a "Back home" link.
- [x] 7.4 Add `generateStaticParams` returning all page slugs from `getPages()`.
- [x] 7.5 Add `generateMetadata` for OG title and description.

## 8. Navigation update

- [x] 8.1 Update `components/Nav.tsx`: pages do NOT appear in the main nav (move to footer).
- [x] 8.2 Update `components/Footer.tsx`: add a "Pages" column with 6 page links (Bestyrelsen, Kontingent, Træning, Bliv Medlem, Scorecards, Klub Info), pointing at `/news/<slug>`.
- [x] 8.3 Move all imported page files from `content/pages/` to `content/news/` so they render under the existing `/news/[slug]` route. Drop the `content/pages/` directory.
- [x] 8.4 Remove `app/[slug]/page.tsx` and `lib/content/pages.ts`; the `[slug]` route and pages loader are no longer needed.
- [x] 8.5 Relax the news zod schema so `tag` and `excerpt` are optional (pages don't have them). Update `components/News.tsx` to filter out items without a `tag` so pages don't appear in the home page news cards.
- [x] 8.6 Update `vercel.json`: page rewrites now point at `/news/<slug>` instead of `/<slug>`.
- [x] 8.7 Update `app/globals.css`: footer-grid goes from 4 to 5 columns to fit the new "Pages" column.
- [x] 9.1 Update `lib/constants.ts`: `WORDPRESS_URL = "https://www.glostrupcricket.dk"`.
- [x] 9.2 Add a code comment explaining the constant must match the live domain and where it's used.

## 11. README updates

- [x] 11.1 Add a "WordPress archive import" section to `README.md` documenting the import script, the rewrite map, and how to re-import if a new WXR export is produced.
- [x] 11.2 Update the "How to add content" section to mention the pages content type with a `content/pages/<slug>.md` example.

## 12. Build verification

- [x] 12.1 Run `npm run build`. Confirm: zero zod errors on imported posts, zero zod errors on imported pages, all 60+ news routes generated, all 6 page routes generated.
- [x] 12.2 Run `npm run lint`. Confirm: zero errors.
- [x] 12.3 Run `npm run dev` and spot-check: home page News section shows the 3 newest WP posts; visit `/news/<one-imported-slug>` and confirm content renders; visit `/<one-imported-page-slug>` (e.g. `/bestyrelsen`) and confirm content renders; visit `/news` (reserved path) and confirm 404.
- [x] 12.4 Confirm image references resolve (no broken images in DevTools Network tab).

## 13. Commit and deploy

- [x] 13.1 `git add` content/, public/wp-images/, lib/, components/, app/, scripts/, vercel.json, package.json, README.md.
- [x] 13.2 `git commit --no-gpg-sign -m "feat: import WordPress archive (57 posts, 6 pages, 177 images, legacy redirects)"`.
- [x] 13.3 `git push` (the GitHub App integration may or may not be wired; if not, run `vercel deploy --prod` manually).
- [x] 13.4 Smoke test on production URL: home page News section renders imported posts; one legacy permalink (e.g. `/2017/03/06/hej-verden`) rewrites to `/news/hej-verden`; footer "Legacy site" link points at `glostrupcricket.dk`.