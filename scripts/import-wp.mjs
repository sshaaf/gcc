#!/usr/bin/env node
/**
 * Import WordPress WXR export into the Next.js content tree.
 *
 * Usage:
 *   node scripts/import-wp.mjs <path-to-wxr.xml>
 *   node scripts/import-wp.mjs <path-to-wxr.xml> --dry-run
 *
 * Inputs:
 *   - wordpress-backup/glostrupcricketclub.WordPress.2026-09-02.xml (WXR)
 *   - wordpress-backup/output/posts/<all>.md (already-Markdown bodies)
 *   - wordpress-backup/output/pages/<all>.md (already-Markdown bodies)
 *   - wordpress-backup/output/<all>/images/<file> (image assets)
 *
 * Outputs:
 *   - content/news/<slug>.md (one per published post)
 *   - content/pages/<slug>.md (one per published page, drafts skipped)
 *   - public/wp-images/<YYYY>/<MM>/<file> (image assets)
 *   - vercel.json (legacy permalink → new URL rewrites)
 *
 * Frontmatter remap:
 *   - wp:post_title → title
 *   - wp:post_date (YYYY-MM-DD) → date
 *   - categories[0] (or "Club News" fallback) → tag
 *   - excerpt:encoded or generated first paragraph → excerpt (posts only)
 *   - no `lead: true` set on imported items
 */

import { readdir, readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";

const ROOT = process.cwd();
const WXR = process.argv[2];
const DRY_RUN = process.argv.includes("--dry-run");

if (!WXR) {
  console.error("Usage: node scripts/import-wp.mjs <wxr.xml> [--dry-run]");
  process.exit(1);
}

const OUTPUT_DIR = path.join(ROOT, "wordpress-backup", "output");
const CONTENT_ROOT = path.join(ROOT, "content");
const PUBLIC_ROOT = path.join(ROOT, "public");

const POST_SLUGS = new Set();
const PAGE_SLUGS = new Set();
const REWRITES = [];

function log(...args) {
  console.log("[import-wp]", ...args);
}

// ── Frontmatter serialization ─────────────────────────────────────────────

function yamlEscape(s) {
  if (s == null) return '""';
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(fields) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`);
      } else {
        lines.push(`${k}:`);
        for (const item of v) lines.push(`  - ${yamlEscape(item)}`);
      }
    } else {
      lines.push(`${k}: ${yamlEscape(v)}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

// ── Excerpt generation ─────────────────────────────────────────────────────

function cleanBodyForExcerpt(body) {
  return body
    .replace(/\[caption[^\]]*\][^[]*\[!\[([^\]]*)\]\([^)]*\)\s*([^\[]*?)\s*\[\/caption\]/gi, (_, img, cap) => {
      const trimmed = img.replace(/^\!\[\]\((.*)\)$/, "![image]($1)").trim();
      return cap ? `${trimmed}\n\n*${cap.trim()}*` : trimmed;
    })
    .replace(/\[gallery[^\]]*\]/gi, "")
    .replace(/\[smartslider3[^\]]*\]/gi, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // strip links, keep text
    .replace(/[#*_`>]/g, "") // strip markdown formatting
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // strip remaining image refs
    .replace(/\s+/g, " ")
    .trim();
}

function firstParagraph(body) {
  // Take first paragraph (up to first blank line)
  const para = body.split(/\n\s*\n/)[0] || "";
  return cleanBodyForExcerpt(para);
}

function generateExcerpt(body, max = 200) {
  let text = firstParagraph(body);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSentence = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("? "),
    cut.lastIndexOf("! "),
  );
  if (lastSentence > max * 0.5) {
    return cut.slice(0, lastSentence + 1);
  }
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd() + "…";
}

// ── Image reference rewriting ──────────────────────────────────────────────

function rewriteImageRefs(body, yyyy, mm) {
  // images/<file> → /wp-images/<YYYY>/<MM>/<file>
  return body.replace(/(!\[[^\]]*\]\()?images\/([^)\s]+)(\)?)/g, (match, open, file, close) => {
    const replacement = `/wp-images/${yyyy}/${mm}/${file}`;
    if (open) return `${open}${replacement}${close || ")"}`;
    return replacement;
  });
}

// ── Caption shortcode cleanup ──────────────────────────────────────────────

function cleanupCaptions(body) {
  // WP caption shortcode, observed shapes include backslash-escaped variants:
  // 1. [caption id="x"][![](path)](url) text[/caption]
  // 2. \[caption id="x"\]\[![](path)\](url) text\[/caption\]
  // Goal: keep the embedded image (or text) and italicize the trailing caption text.
  // Build regexes via constructor for clarity.
  const openRe = String.raw`\\?\[caption[^\]]*?\\?\]`;
  const closeRe = String.raw`\\?\[/caption\\?\]`;
  return body
    .replace(
      new RegExp(`${openRe}\\s*([\\s\\S]*?)\\s*${closeRe}`, "g"),
      (_, inner) => {
        const trimmed = inner.trim();
        // Split on the image ref vs caption text. Image ref ends at ")" of its URL.
        // Pattern: [![](path)](outer-link) <text>
        const imgMatch = trimmed.match(/^!?\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/);
        if (imgMatch) {
          const after = trimmed.slice(imgMatch[0].length).trim();
          if (after) {
            return `${imgMatch[0]}\n\n*${after}*`;
          }
          return imgMatch[0];
        }
        // Plain text only (no image) — keep the text, italicize if non-trivial
        if (trimmed) {
          return `*${trimmed}*`;
        }
        return "";
      },
    );
}

// ── Find source Markdown file in wordpress-backup/output ───────────────────

async function findSourceMd(type, slug, dateStr) {
  // Layout: wordpress-backup/output/<type>/<YYYY>/<MM>/<date>-<slug>.md
  const [yyyy, mm] = dateStr.split("-");
  const candidates = [
    path.join(OUTPUT_DIR, type, yyyy, mm, `${dateStr}-${slug}.md`),
    path.join(OUTPUT_DIR, type, yyyy, mm, `${slug}.md`),
  ];
  for (const c of candidates) {
    try {
      await readFile(c);
      return c;
    } catch {}
  }
  return null;
}

async function readBody(sourcePath) {
  const raw = await readFile(sourcePath, "utf8");
  // Strip the frontmatter (gray-matter format with ---)
  const m = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return m ? m[1].trim() : raw;
}

// ── WXR parsing ───────────────────────────────────────────────────────────

const parser = new XMLParser({
  ignoreAttributes: false,
  cdataPropName: "__cdata",
  textNodeName: "#text",
  isArray: (name) => ["item"].includes(name),
});

const wxrRaw = await readFile(WXR, "utf8");
const wxr = parser.parse(wxrRaw);
const items = wxr.rss?.channel?.item ?? [];

// Pull only published posts and pages
const posts = items.filter(
  (i) =>
    i["wp:post_type"]?.__cdata === "post" &&
    i["wp:status"]?.__cdata === "publish",
);
const pages = items.filter(
  (i) =>
    i["wp:post_type"]?.__cdata === "page" &&
    i["wp:status"]?.__cdata === "publish",
);

log(`WXR parsed: ${items.length} items total`);
log(`  posts (published): ${posts.length}`);
log(`  pages (published): ${pages.length}`);

// ── Categories helper ──────────────────────────────────────────────────────

function getCategories(item) {
  // fast-xml-parser turns <category> into either an object (single) or array (multiple).
  const cats = item.category == null ? [] : Array.isArray(item.category) ? item.category : [item.category];
  const out = [];
  for (const c of cats) {
    if (!c) continue;
    const domain = c["@_domain"];
    const nicename = c["@_nicename"];
    if (domain !== "category" || !nicename) continue;
    out.push(nicename);
  }
  return out;
}

function getField(item, key) {
  const f = item[key];
  if (!f) return "";
  return typeof f === "string" ? f : (f.__cdata ?? "");
}

// ── Process posts ─────────────────────────────────────────────────────────

let postCount = 0;
let skippedPosts = 0;

for (const post of posts) {
  const slug = post["wp:post_name"]?.__cdata ?? "";
  const title = getField(post, "title");
  const dateStr = (post["wp:post_date"]?.__cdata ?? "").slice(0, 10);
  const excerptRaw = getField(post, "excerpt:encoded");
  const cats = getCategories(post);

  if (!slug || !dateStr) {
    skippedPosts++;
    continue;
  }
  POST_SLUGS.add(slug);

  // Read body from the converted Markdown source
  const sourcePath = await findSourceMd("posts", slug, dateStr);
  let body = "";
  if (sourcePath) {
    body = await readBody(sourcePath);
  } else {
    log(`  WARN post body not found: ${slug} (${dateStr})`);
    skippedPosts++;
    continue;
  }

  body = cleanupCaptions(body);
  const [yyyy, mm] = dateStr.split("-");
  body = rewriteImageRefs(body, yyyy, mm);

  const tag = cats[0] && cats[0] !== "ikke-kategoriseret" ? cats[0] : "Club News";

  let excerpt;
  if (excerptRaw.trim()) {
    // Strip any HTML in the WP excerpt
    const td = new TurndownService();
    excerpt = td.turndown(excerptRaw).replace(/\n+/g, " ").trim();
  } else {
    excerpt = generateExcerpt(body);
  }
  // Final guard: zod schema requires min(1); fall back if either path produced empty
  if (!excerpt) {
    excerpt = generateExcerpt(body) || title || "Read more.";
  }

  const fm = buildFrontmatter({ title, date: dateStr, tag, excerpt });
  const out = `${fm}${body}\n`;

  if (!DRY_RUN) {
    const outPath = path.join(CONTENT_ROOT, "news", `${slug}.md`);
    await writeFile(outPath, out, "utf8");
  }
  postCount++;

  // Build rewrite: /YYYY/MM/DD/<slug> → /news/<slug>
  const parts = dateStr.split("-");
  const source = `/${parts[0]}/${parts[1]}/${parts[2]}/${slug}`;
  REWRITES.push({ source, destination: `/news/${slug}` });
}

log(`Posts imported: ${postCount}, skipped: ${skippedPosts}`);

// ── Process pages ─────────────────────────────────────────────────────────

let pageCount = 0;
let skippedPages = 0;
const pageSlugDisambiguations = [];

for (const page of pages) {
  let slug = page["wp:post_name"]?.__cdata ?? "";
  const title = getField(page, "title");
  const dateStr = (page["wp:post_date"]?.__cdata ?? "").slice(0, 10);

  if (!slug || !dateStr) {
    skippedPages++;
    continue;
  }

  // Skip INFOSKÆRM draft (id-516 in the export; slug also id-516)
  if (slug === "id-516") {
    skippedPages++;
    continue;
  }

  // Disambiguate slug if it collides with a post slug
  if (POST_SLUGS.has(slug)) {
    const newSlug = `${slug}-page`;
    pageSlugDisambiguations.push(`${slug} → ${newSlug}`);
    slug = newSlug;
  }
  PAGE_SLUGS.add(slug);

  const sourcePath = await findSourceMd("pages", slug, dateStr);
  let body = "";
  if (sourcePath) {
    body = await readBody(sourcePath);
  } else {
    log(`  WARN page body not found: ${slug}`);
    skippedPages++;
    continue;
  }

  body = cleanupCaptions(body);
  const [yyyy, mm] = dateStr.split("-");
  body = rewriteImageRefs(body, yyyy, mm);

  const fm = buildFrontmatter({ title, date: dateStr });
  const out = `${fm}${body}\n`;

  if (!DRY_RUN) {
    await mkdir(path.join(CONTENT_ROOT, "pages"), { recursive: true });
    const outPath = path.join(CONTENT_ROOT, "pages", `${slug}.md`);
    await writeFile(outPath, out, "utf8");
  }
  pageCount++;

  // Rewrite for pages
  const parts = dateStr.split("-");
  const source = `/${parts[0]}/${parts[1]}/${parts[2]}/${slug}`;
  REWRITES.push({ source, destination: `/${slug}` });
}

log(`Pages imported: ${pageCount}, skipped: ${skippedPages}`);
if (pageSlugDisambiguations.length > 0) {
  log(`  Page slugs disambiguated:`);
  for (const d of pageSlugDisambiguations) log(`    ${d}`);
}

// ── Copy images ────────────────────────────────────────────────────────────

async function copyDirImages(srcDir, yyyy, mm) {
  let count = 0;
  let entries;
  try {
    entries = await readdir(srcDir);
  } catch {
    return 0;
  }
  for (const entry of entries) {
    if (!/\.(jpe?g|png|gif)$/i.test(entry)) continue;
    const src = path.join(srcDir, entry);
    const dst = path.join(PUBLIC_ROOT, "wp-images", yyyy, mm, entry);
    if (!DRY_RUN) {
      await mkdir(path.dirname(dst), { recursive: true });
      try {
        await copyFile(src, dst);
      } catch (e) {
        if (e.code !== "EEXIST") throw e;
      }
    }
    count++;
  }
  return count;
}

let imageCount = 0;
const wpImagesRoot = path.join(OUTPUT_DIR, "posts");

async function walkPostsImages() {
  // posts/<YYYY>/<MM>/images/*.{jpg,png,gif}
  let years;
  try {
    years = await readdir(wpImagesRoot, { withFileTypes: true });
  } catch {
    return;
  }
  for (const y of years) {
    if (!y.isDirectory()) continue;
    const yDir = path.join(wpImagesRoot, y.name);
    let months;
    try {
      months = await readdir(yDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const m of months) {
      if (!m.isDirectory()) continue;
      const imgDir = path.join(yDir, m.name, "images");
      imageCount += await copyDirImages(imgDir, y.name, m.name);
    }
  }
}

await walkPostsImages();

// Pages also have images — pages/<YYYY>/<MM>/images
async function walkPageImages() {
  const pagesRoot = path.join(OUTPUT_DIR, "pages");
  let years;
  try {
    years = await readdir(pagesRoot, { withFileTypes: true });
  } catch {
    return;
  }
  for (const y of years) {
    if (!y.isDirectory()) continue;
    if (y.name === "_drafts") continue;
    const yDir = path.join(pagesRoot, y.name);
    let months;
    try {
      months = await readdir(yDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const m of months) {
      if (!m.isDirectory()) continue;
      const imgDir = path.join(yDir, m.name, "images");
      imageCount += await copyDirImages(imgDir, y.name, m.name);
    }
  }
}

await walkPageImages();

log(`Images copied: ${imageCount}`);

// ── vercel.json ────────────────────────────────────────────────────────────

const vercelConfig = { rewrites: REWRITES };
if (!DRY_RUN) {
  await writeFile(
    path.join(ROOT, "vercel.json"),
    JSON.stringify(vercelConfig, null, 2) + "\n",
    "utf8",
  );
}
log(`Rewrites generated: ${REWRITES.length} entries → vercel.json`);

if (DRY_RUN) {
  log("(dry-run — no files written)");
} else {
  log("Done.");
}