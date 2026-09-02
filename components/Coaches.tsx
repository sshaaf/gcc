import { getCoaches } from "@/lib/content";
import { Reveal } from "./Reveal";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function Coaches() {
  const coaches = await getCoaches();
  if (coaches.length === 0) return null;
  return (
    <section id="coaches">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="kicker">Coaching Staff</p>
            <h2 className="disp">Who Runs the Club</h2>
          </div>
        </Reveal>
        <Reveal className="coach-grid">
          {coaches.map((c) => (
            <div key={c.slug} className="coach-card">
              <div className="photo" aria-hidden="true">
                {initials(c.name)}
              </div>
              <div className="role">{c.role}</div>
              <h3>{c.name}</h3>
              <p>{c.bio}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}