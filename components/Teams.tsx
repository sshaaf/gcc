import { getTeams } from "@/lib/content";
import { Reveal } from "./Reveal";

export async function Teams() {
  const teams = await getTeams();
  return (
    <section id="teams">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="kicker">The Squad</p>
            <h2 className="disp">Our Teams</h2>
          </div>
          <a className="more" href="#">
            All fixtures &amp; results
          </a>
        </Reveal>
        <Reveal className="team-grid">
          {teams.map((t) => (
            <div key={t.slug} className="team-card">
              <span className="jersey" aria-hidden="true">
                {t.jersey}
              </span>
              <h3>{t.name}</h3>
              <p>{t.description}</p>
              {t.medal ? (
                <span
                  className={
                    t.medal.variant === "gold"
                      ? "medal"
                      : `medal ${t.medal.variant}`
                  }
                >
                  {t.medal.label}
                </span>
              ) : null}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}