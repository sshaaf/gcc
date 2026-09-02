import { getSponsors } from "@/lib/content";
import Image from "next/image";

export async function Sponsors() {
  const sponsors = await getSponsors();
  if (sponsors.length === 0) return null;

  return (
    <section className="sponsor-band" id="sponsors">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="kicker">Sponsors</p>
            <h2 className="disp">Partners of the Club</h2>
          </div>
        </div>
        <div className="sponsor-grid">
          {sponsors.map((s) => {
            const inner = s.logo ? (
              <Image
                src={s.logo}
                alt={s.name}
                width={200}
                height={64}
                unoptimized
              />
            ) : (
              <span className="sponsor-fallback">{s.name}</span>
            );
            return s.url ? (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <span key={s.name}>{inner}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}