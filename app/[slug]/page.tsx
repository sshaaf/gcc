import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug, getPageSlugs } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

const RESERVED_SLUGS = new Set([
  "news",
  "gallery",
  "contact",
  "about",
  "api",
  "_next",
  "favicon.ico",
  "logo.gif",
  "apple-touch-icon.png",
  "",
]);

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs
    .filter((slug) => !RESERVED_SLUGS.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} — Glostrup Cricket Club`,
    description: page.body.slice(0, 160).replace(/\n+/g, " ").trim(),
  };
}

export default async function PageBySlug({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  const html = await renderMarkdown(page.body);
  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span>{page.title}</span>
          <span className="hide-m">Glostrup Cricket Club</span>
        </div>
      </div>
      <header className="nav" style={{ background: "rgba(10,26,74,0.92)" }}>
        <div className="nav-inner">
          <Link href="/" className="crest">
            <span className="crest-name">
              <span className="top">Glostrup</span>
              <br />
              <span className="sub">Cricket Club</span>
            </span>
          </Link>
          <Link className="btn btn-line" href="/">
            ← Back home
          </Link>
        </div>
      </header>
      <section style={{ padding: "96px 0" }}>
        <div className="wrap news-detail">
          <p className="kicker">Side</p>
          <h1
            className="disp"
            style={{ fontSize: "clamp(36px,5vw,56px)" }}
          >
            {page.title}
          </h1>
          <div
            className="body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    </>
  );
}