import { Crest } from "./Crest";

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#top" className="crest">
          <Crest />
          <span className="crest-name">
            <span className="top">Glostrup</span>
            <br />
            <span className="sub">Cricket Club</span>
          </span>
        </a>
        <nav className="main-links" aria-label="Primary">
          <a href="#teams">Teams</a>
          <a href="#honours">Honours</a>
          <a href="#ground">The Ground</a>
          <a href="#news">News</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="btn btn-gold" href="#join">
          Join the Club
        </a>
      </div>
    </header>
  );
}