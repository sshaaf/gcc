import { getNextFixture } from "@/lib/content";

export async function MatchCentre() {
  const fixture = await getNextFixture();
  if (!fixture) return null;
  return (
    <div className="match-centre">
      <div className="mc-inner">
        <div className="mc-label">
          <span className="kicker">Match Centre</span>
          <h2>Next Fixture</h2>
        </div>
        <div className="mc-fixture">
          <div className="mc-team">
            {fixture.home}
            <small>Home</small>
          </div>
          <div className="mc-vs">VS</div>
          <div className="mc-team">
            {fixture.away}
            <small>Away</small>
          </div>
        </div>
        <div className="mc-meta">
          <span className="when">{fixture.when}</span>
          <span className="where">{fixture.venue}</span>
        </div>
      </div>
    </div>
  );
}