import { getHome, getStats } from "@/lib/content";

export async function Hero() {
  const home = await getHome();
  const stats = await getStats();
  return (
    <section className="hero" id="top" style={{ padding: 0 }}>
      <div className="hero-inner">
        <p className="kicker">{home.kicker}</p>
        <h1 className="disp">
          {home.titleRow1}
          <br />
          <span className="row2">{home.titleRow2}</span>
        </h1>
        <p className="est">
          {home.estLabel} <b>{home.estDate}</b> · {home.estVenue}
        </p>
        <div className="hero-ctas">
          <a className="btn btn-gold" href="#join">
            {home.ctaPrimary}
          </a>
          <a className="btn btn-line" href="#teams">
            {home.ctaSecondary}
          </a>
        </div>
        <div className="hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="hstat">
              <div className="num">{s.value}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}