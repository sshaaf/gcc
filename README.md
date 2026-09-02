# Glostrup Cricket Club — Website

Public website for **Glostrup Cricket Club**, built on Next.js 15 (App Router) with all content sourced from Markdown files in this repository.

> Glostrup Cricket Club · Est. 2 April 1959 · Solvangsparken, Glostrup, Denmark

## Stack

- **Next.js 15** (App Router, RSC) + TypeScript
- **Markdown content** parsed by `gray-matter` + `remark`, sanitized by `rehype-sanitize`
- **zod** schemas validate frontmatter at build time
- **Plain CSS** in `app/globals.css`, design tokens at `:root`
- **Vercel** for hosting (push-to-deploy from `main`)

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint
```

## How to add content

All editable site content lives in `/content/**/*.md`. One file per item. Frontmatter is YAML, validated against a `zod` schema — a missing or malformed field fails the build with a clear error.

### Add a news post (or match report)

Create `content/news/<YYYY-MM>-<slug>.md`:

```markdown
---
title: "Silver at DM 2025"
tag: "Women's Cricket"
date: "2025-09-08"
excerpt: "The women's team capped a superb campaign with silver at the Danish championships."
---

A breakthrough campaign ended in silver at the Danish women's championship in
September, with Glostrup falling just short in the final against a strong
Copenhagen side.
```

The post appears on the home page News section and at `/news/<slug>` after the next deploy.

**For a match report**, set `type: "match-report"` and add `opponent`, `result`, and `scorecard`:

```markdown
---
title: "Glostrup beat Svanholm in the season opener"
tag: "Match Report"
date: "2026-04-20"
excerpt: "A composed chase of 142 with four overs to spare."
type: "match-report"
opponent: "Svanholm CC"
result: "Won by 6 wickets"
scorecard:
  - { label: "Svanholm", value: "141/8 (35 ov)" }
  - { label: "Glostrup", value: "142/4 (31 ov)" }
---
```

Mark one post as `lead: true` to make it the headline card on the home page.

### Add a team

`content/teams/<slug>.md`:

```markdown
---
name: "Senior Men"
jersey: "1"
order: 1
description: "Competing at the top of Danish cricket."
medal:
  label: "DM Champions ’08 · ’11"
  variant: "gold"     # gold | silver | bronze
---
```

### Add a coach

`content/coaches/<slug>.md`:

```markdown
---
name: "Kamran Ahmed"
role: "Youth Coach"
order: 2
bio: "Runs the U13 and U15 programmes."
photo: /coaches/kamran.jpg   # optional, lives in /public
---
```

### Add a sponsor

Edit `content/sponsors/index.md` and append:

```markdown
---
sponsors:
  - { name: "Acme Co", order: 1, url: "https://acme.example", logo: /sponsors/acme.svg }
  - { name: "Local Café", order: 2 }
---
```

`logo` is optional. Without it, the sponsor name renders as a text fallback.

### Add a gallery photo

1. Drop the image into `/public/gallery/<slug>/<file>.jpg`.
2. Reference it from `content/gallery/<slug>.md`:

```markdown
---
title: "2025 Season"
date: "2025-09-30"
excerpt: "Photographs from the 2025 season."
photos:
  - src: /gallery/2025-season/01.jpg
    alt: "Opening fixture, April 2025"
    caption: "Opening fixture — April 2025"
---

Optional prose above the photo grid.
```

A `/gallery/<slug>` page is generated automatically.

### Edit the hero copy or stats

- `content/home/page.md` — kicker, title, est. line, CTA labels
- `content/stats/index.md` — the four hero statistics

### Update the next fixture

`content/fixtures/next.md`:

```markdown
---
home: "Glostrup CC"
away: "Svanholm CC"
when: "Sat 22 Aug · 11:00"
venue: "Solvangsparken, Glostrup"
---
```

If no `next.md` exists, the Match Centre strip hides itself.

### Edit honour rows

One file per row in `content/honours/`. Set `order` to control display order.

### Edit contact / footer

`content/contact/index.md` controls the footer's Visit and Contact columns and the address shown on the Ground section.

## Legacy WordPress site

The footer's **Legacy site** link points to the existing WordPress archive at the URL configured in `lib/constants.ts` (`WORDPRESS_URL`). Update that constant if the legacy domain changes.

## Deployment

- **Source**: `https://github.com/sshaaf/gcc` (public)
- **Hosting**: Vercel, project `gcc`
- **Trigger**: every push to `main` deploys automatically via the Vercel GitHub App

### Initial setup (already done if you're reading this on a live URL)

```bash
vercel link          # one-time, links this repo to the Vercel project
vercel git connect   # installs the Vercel GitHub App on sshaaf/gcc
vercel deploy --prod # first production deploy
```

Subsequent deploys are automatic on push.

## Project layout

```
app/                  # Next.js App Router routes
  layout.tsx          # root layout, fonts, metadata
  page.tsx            # home page composition
  globals.css         # design tokens + all section styles
  news/[slug]/        # dynamic news route
  gallery/[slug]/     # dynamic gallery route
  not-found.tsx

components/           # Server Components for each home section
  Topbar Nav Hero MatchCentre Teams Honours
  Coaches Ground Sponsors News GalleryPreview Join Footer
  Crest.tsx           # shared SVG
  Reveal.tsx          # client component: IntersectionObserver reveal

content/              # ALL editable site content (Markdown)
  home/ stats/ teams/ honours/ fixtures/ contact/
  news/ sponsors/ coaches/ gallery/

lib/
  content/            # zod schemas + loaders per content type
  markdown.ts         # remark + sanitized HTML renderer
  constants.ts        # WORDPRESS_URL and other constants

public/               # static assets (logos, gallery images, coach photos)

legacy/               # the original static HTML redesign (design reference)
```

## Conventions

- **One file per item.** Editing one team, one news post, or one coach should never touch other files.
- **Schema is the contract.** If you add a new frontmatter field, update the corresponding `zod` schema in `lib/content/<type>.ts` first.
- **Build fails on bad content.** Missing required fields, wrong enum values, or unparseable YAML all fail `npm run build` — they will not silently ship.