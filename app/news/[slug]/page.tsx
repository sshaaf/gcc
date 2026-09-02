import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsBySlug, getNewsSlugs } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Glostrup Cricket Club`,
    description: post.excerpt,
  };
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.body);
  const isMatchReport = post.type === "match-report";
  const isPage = !post.tag;
  const kicker = isMatchReport ? "Match Report" : isPage ? "Side" : "News";
  const topbarLabel = post.tag ?? "Glostrup Cricket Club";

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span>{topbarLabel}</span>
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
          <p className="kicker">{kicker}</p>
          <h1 className="disp" style={{ fontSize: "clamp(36px,5vw,56px)" }}>
            {post.title}
          </h1>
          {!isPage && (
            <p className="meta">
              {isMatchReport
                ? `${(post as { opponent: string }).opponent} · ${(post as { result: string }).result}`
                : post.tag}
            </p>
          )}
          <p className="when">
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {isMatchReport &&
            "scorecard" in post &&
            Array.isArray(post.scorecard) && (
              <div className="scorecard">
                {(post.scorecard as Array<{ label: string; value: string }>).map(
                  (row) => (
                    <div key={row.label} className="row">
                      <span>{row.label}</span>
                      <span className="v">{row.value}</span>
                    </div>
                  ),
                )}
              </div>
            )}

          <div
            className="body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    </>
  );
}