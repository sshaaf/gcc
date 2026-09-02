## 1. Repo preparation

- [x] 1.1 Move `glostrup-cricket-redesign.html` to `legacy/glostrup-cricket-redesign.html` so it ships outside the Next.js build but remains in the repo as design reference.
- [x] 1.2 Create a top-level `.gitignore` covering `node_modules`, `.next`, `.vercel`, `.env*`, and OS junk.
- [x] 1.3 Add a placeholder `README.md` (will be expanded in task 10).

## 2. Next.js scaffold

- [x] 2.1 Run `npx create-next-app@latest .` with options: TypeScript yes, ESLint yes, Tailwind no, `src/` no, App Router yes, import alias no (default `@/*`). Confirm the scaffold writes `package.json`, `next.config.ts`/`next.config.js`, `tsconfig.json`, `app/`, `public/`.
- [x] 2.2 Verify `package.json` scripts include `dev`, `build`, `start`, `lint`.
- [ ] 2.3 Run `npm install` (or the package manager chosen in 2.1) and confirm `node_modules` resolves without errors.

## 3. Dependencies for content layer

- [ ] 3.1 Install runtime deps: `npm install gray-matter remark remark-html zod`.
- [ ] 3.2 Install dev deps: `npm install -D @types/node` (if not already present).

## 4. CSS port

- [x] 4.1 Replace `app/globals.css` with a verbatim port of the `<style>` block from `legacy/glostrup-cricket-redesign.html`, lines 9–495 (CSS variables in `:root`, all selectors, media queries, and `prefers-reduced-motion` rules). The `<link>` to Google Fonts is handled separately in step 5.
- [x] 4.2 Replace `app/layout.tsx` so its `<html>` and `<body>` classes don't override the design tokens; keep `metadata` set to "Glostrup Cricket Club — Est. 1959".
- [x] 4.3 Replace `app/page.tsx` with a placeholder that renders `<main>Glostrup Cricket Club</main>` so the build is green before content/components land.
- [ ] 4.4 Run `npm run build` and confirm it succeeds with the placeholder page.
- [x] 5.1 Add the Google Fonts `<link>` (preconnect + stylesheet URL for `Archivo`, `Barlow`, `Barlow Condensed`) from the HTML into `app/layout.tsx`. Use Next's metadata API or a raw `<link>` tag rendered in the layout.
- [x] 5.2 Add the inline crest SVG to a shared component or import path (used by both Nav and Footer).

## 6. Content schemas (zod)

- [x] 6.1 Create `lib/content/types.ts` with shared sub-schemas (`medalSchema`, `photoSchema`, `orderableSchema`).
- [x] 6.2 Create one schema + loader file per content type: `lib/content/home.ts`, `stats.ts`, `teams.ts`, `honours.ts`, `news.ts`, `fixtures.ts`, `sponsors.ts`, `coaches.ts`, `gallery.ts`, `contact.ts`. Each exports a zod schema and a typed loader that reads from the corresponding subdirectory.
- [x] 6.3 Add `lib/content/index.ts` re-exporting loaders and types.
- [x] 6.4 Add `lib/markdown.ts` with a `renderMarkdown(md: string): Promise<string>` helper using `remark` + `remark-html` with a sanitization step (rehype-sanitize) to strip scripts and dangerous attributes.

## 7. Seed content from the HTML

- [x] 7.1 Create `content/home/page.md` with the hero kicker ("Danish Champions 2008 · 2011"), title (`Glostrup / Cricket Club`), est. line ("Siden 2. April 1959 · Solvangsparken"), and CTA labels.
- [x] 7.2 Create `content/stats/index.md` with the four hero stats: `2×` Danish Champions, `16` DM Medals 1982–2007, `67` Years of Cricket, `6` Teams All Ages.
- [x] 7.3 Create `content/teams/{senior-men,women,u18-u15,u13-oldboys}.md` from the four team cards in the HTML.
- [x] 7.4 Create `content/honours/{danish-championship,dm-silver-medals,dm-bronze-medals,women-dm-silver,u18-u15-dm-bronze,u13-dm-silver}.md` from the six honour rows.
- [x] 7.5 Create `content/fixtures/next.md` with the next fixture data (Sat 22 Aug · 11:00 · Glostrup CC vs Svanholm CC · Solvangsparken).
- [x] 7.6 Create `content/contact/index.md` with the address (Nørre Allé 41, 2600 Glostrup), Solvangsparken, and the three footer contacts (Chairman: Rocky Chawla, Youth: Kamran Ahmed, Oldboys: Ole Roland).
- [x] 7.7 Create `content/news/2025-11-sports-gala.md` as the first news post (lead), with a plausible 2-paragraph body dated November 2025.
- [x] 7.8 Create `content/news/2025-09-women-silver.md` and `content/news/2025-08-youth-medals.md` as the other two news cards from the HTML.
- [x] 7.9 Create `content/sponsors/index.md` with one placeholder sponsor entry (so the Sponsors section is not empty).
- [x] 7.10 Create `content/coaches/rocky-chawla.md` as a placeholder coach (so the Coaches section is not empty).
- [x] 7.11 Create `content/gallery/2025-season.md` with one placeholder photo entry referencing `/gallery/2025-season/01.jpg` (do not add the image file yet; the gallery preview section will gracefully hide when the array is empty or per task 8.x logic).
- [x] 7.12 Add `legacy/WORDPRESS_URL` constant or document the URL in the README so the Footer link target is known.

## 8. Section components

- [x] 8.1 Build `components/Topbar.tsx` (Server Component, constants in component).
- [x] 8.2 Build `components/Nav.tsx` (Server Component, accepts `joinHref` prop or constant).
- [x] 8.3 Build `components/Hero.tsx` — reads `content/home/page.md` and `content/stats/index.md`.
- [x] 8.4 Build `components/MatchCentre.tsx` — reads `content/fixtures/next.md`.
- [x] 8.5 Build `components/Teams.tsx` — reads `content/teams/`.
- [x] 8.6 Build `components/Honours.tsx` — reads `content/honours/`.
- [x] 8.7 Build `components/Coaches.tsx` — reads `content/coaches/`.
- [x] 8.8 Build `components/Ground.tsx` — uses `content/contact/index.md` for the address.
- [x] 8.9 Build `components/Sponsors.tsx` — reads `content/sponsors/index.md`.
- [x] 8.10 Build `components/News.tsx` — reads the three most recent `content/news/` items, marks the lead card.
- [x] 8.11 Build `components/GalleryPreview.tsx` — reads latest `content/gallery/` (placeholder shows nothing if photos array is empty).
- [x] 8.12 Build `components/Join.tsx` — Join CTA stays as `<a href="#contact">`.
- [x] 8.13 Build `components/Footer.tsx` — reads `content/contact/index.md`, renders the legacy WordPress link from the constant.
- [x] 8.14 Build `components/Reveal.tsx` (Client Component) — wraps children, uses `IntersectionObserver` (threshold 0.12), respects `prefers-reduced-motion`, removes the observer once the element has revealed. Used by sections that should animate.
- [x] 8.15 Build `components/Crest.tsx` (shared SVG) — accepts `size` prop, used by Nav and Footer.
- [x] 8.16 Wire the components in `app/page.tsx` in the order: Topbar, Nav, Hero, MatchCentre, Teams, Honours, Coaches, Ground, Sponsors, News, GalleryPreview, Join, Footer.

## 9. Dynamic routes

- [x] 9.1 Create `app/news/[slug]/page.tsx` — Server Component that calls `getNewsBySlug(params.slug)`; on null, calls `notFound()`. Renders title, tag, date, excerpt, and the rendered Markdown body.
- [x] 9.2 Create `app/news/[slug]/page.tsx`'s `generateStaticParams` — lists all `content/news/*.md` slugs.
- [x] 9.3 Create `app/gallery/[slug]/page.tsx` — Server Component that calls `getGalleryBySlug(params.slug)`; on null, calls `notFound()`. Renders the photo grid using Next's `<Image>`.
- [x] 9.4 Create `app/gallery/[slug]/page.tsx`'s `generateStaticParams` — lists all `content/gallery/*.md` slugs.
- [x] 9.5 Add `app/not-found.tsx` with a simple "Not found" page in the design's typography.

## 10. README

- [x] 10.1 Replace the placeholder `README.md` with a project intro, the "How to add content" guide (one example per type), and the deployment notes (Vercel URL once known).
- [x] 10.2 Document the legacy WordPress link target in the README so future maintainers know where the footer points.

## 11. Build verification

- [x] 11.1 Run `npm run build` and confirm zero warnings about missing frontmatter, missing slugs, or broken images.
- [x] 11.2 Run `npm run dev`, open `http://localhost:3000`, and verify all sections render with seeded content.
- [x] 11.3 Visit `/news/2025-11-sports-gala` in dev and confirm the post body renders.
- [x] 11.4 Visit a non-existent slug (e.g. `/news/nope`) and confirm 404.
- [x] 11.5 Verify the reveal-on-scroll animation works and respects `prefers-reduced-motion` (toggle in DevTools).
- [x] 11.6 Resize the browser to <960px and <560px and confirm the responsive rules from the original CSS apply.
- [x] 11.7 Verify "Join the Club" and "Become a Member" buttons scroll to their anchors without navigating.
- [x] 11.8 Run `npm run lint` and confirm zero errors.

## 12. Commit and push

- [ ] 12.1 `git add` all new and modified files (except anything in `.gitignore`).
- [ ] 12.2 `git commit -m "feat: scaffold next.js site with markdown-driven content"` (or similar message; this is the first commit, so a verbose message is appropriate).
- [ ] 12.3 `git remote add origin https://github.com/sshaaf/gcc.git` (if not already added).
- [ ] 12.4 `git push -u origin main`.

## 13. Vercel setup and first deploy

- [ ] 13.1 Run `vercel link` in the repo root; accept the default project name (`gcc`); confirm `.vercel/project.json` is created and committed in 12.x.
- [ ] 13.2 Run `vercel git connect` and follow the CLI prompts (this is the step that may require browser interaction to install the Vercel GitHub App on `sshaaf/gcc`).
- [ ] 13.3 Confirm in the Vercel dashboard that the project is linked to `sshaaf/gcc` and that pushes to `main` trigger production builds.
- [ ] 13.4 Run `vercel deploy --prod` for the initial production deploy.
- [ ] 13.5 Visit the deployed URL and confirm the home page renders identically to the local build.
- [ ] 13.6 Visit `/news/2025-11-sports-gala` on the deployed URL and confirm the post renders.
- [ ] 13.7 Add the deployed URL to the README's deployment notes section.
- [ ] 13.8 Commit and push the README update; confirm Vercel auto-deploys the change (validates the push-to-deploy wiring).