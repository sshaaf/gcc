import { getHonours } from "@/lib/content";
import { Reveal } from "./Reveal";

export async function Honours() {
  const honours = await getHonours();
  return (
    <section className="honours" id="honours">
      <div className="wrap honours-grid">
        <Reveal>
          <p className="kicker">Honours</p>
          <div className="big-year">
            2008
            <br />
            <span>2011</span>
          </div>
          <p className="note">
            In 2008 the long wait ended: Glostrup beat Skanderborg in a replay to
            take the club&rsquo;s first Danish championship. Three seasons later
            the title returned — sealed with three rounds to spare.
          </p>
        </Reveal>
        <Reveal>
          <ul className="honour-list">
            {honours.map((h) => (
              <li key={h.slug}>
                <span className="title">{h.title}</span>
                <span className="yrs">{h.years}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}