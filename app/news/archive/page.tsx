import Link from "next/link";
import { getNews } from "@/lib/content";

export const metadata = {
  title: "Arkiv — Glostrup Cricket Club",
  description: "Alle nyheder og indlæg fra Glostrup Cricket Club.",
};

function formatDate(d: string) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ArchivePage() {
  const allNews = await getNews();
  // Only items with a tag are real posts — pages live at /news/<slug>
  // but don't appear in the archive index.
  const posts = allNews.filter((n) => Boolean(n.tag));

  // Group by year
  const byYear = new Map<number, typeof posts>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(post);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span>Arkiv</span>
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
          <p className="kicker">Arkiv</p>
          <h1
            className="disp"
            style={{ fontSize: "clamp(36px,5vw,56px)" }}
          >
            Alle indlæg
          </h1>
          <p
            style={{
              color: "var(--chalk-dim)",
              marginTop: 18,
              marginBottom: 48,
            }}
          >
            {posts.length} indlæg fra {Math.min(...years)} til{" "}
            {Math.max(...years)}.
          </p>

          {years.map((year) => (
            <section key={year} style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontFamily: "var(--cond)",
                  fontWeight: 700,
                  fontSize: 22,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--gold)",
                  marginBottom: 14,
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: 8,
                }}
              >
                {year}{" "}
                <span
                  style={{
                    color: "var(--chalk-dim)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ({byYear.get(year)!.length})
                </span>
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {byYear.get(year)!.map((post) => (
                  <li
                    key={post.slug}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 16,
                      padding: "12px 0",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <Link
                      href={`/news/${post.slug}`}
                      style={{
                        fontFamily: "var(--cond)",
                        fontWeight: 700,
                        fontSize: 17,
                        letterSpacing: "0.03em",
                        color: "var(--chalk)",
                      }}
                    >
                      {post.title}
                    </Link>
                    <span
                      style={{
                        fontFamily: "var(--cond)",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--chalk-dim)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(post.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}