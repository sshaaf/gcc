import { getNews } from "@/lib/content";
import { Reveal } from "./Reveal";

function formatDate(d: string) {
  try {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export async function News() {
  const allNews = await getNews();
  // Only items with a tag are real posts — pages (static info) live at
  // /news/<slug> but don't appear in the home page cards.
  const news = allNews.filter((n) => Boolean(n.tag));
  if (news.length === 0) return null;

  const lead = news.find((n) => n.lead) ?? news[0];
  const others = news.filter((n) => n.slug !== lead.slug).slice(0, 2);

  return (
    <section id="news">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="kicker">Club News</p>
            <h2 className="disp">Latest from GCC</h2>
          </div>
          <a className="more" href="#">
            All news
          </a>
        </Reveal>
        <Reveal className="news-grid">
          <a className="news-card lead-card" href={`/news/${lead.slug}`}>
            <span className="tag">{lead.tag}</span>
            <h3>{lead.title}</h3>
            <p>{lead.excerpt}</p>
            <span className="date">{formatDate(lead.date)}</span>
          </a>
          {others.map((n) => (
            <a key={n.slug} className="news-card" href={`/news/${n.slug}`}>
              <span className="tag">{n.tag}</span>
              <h3>{n.title}</h3>
              <p>{n.excerpt}</p>
              <span className="date">{formatDate(n.date)}</span>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}