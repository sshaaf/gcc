import Link from "next/link";
import { getContact } from "@/lib/content";
import { WORDPRESS_URL } from "@/lib/constants";
import { Crest } from "./Crest";

export async function Footer() {
  const contact = await getContact();
  return (
    <footer id="contact">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="crest">
              <Crest size={42} />
              <span className="crest-name">
                <span className="top" style={{ fontSize: 16 }}>
                  Glostrup
                </span>
                <br />
                <span className="sub">Cricket Club</span>
              </span>
            </div>
            {contact.about ? <p>{contact.about}</p> : null}
          </div>

          <div className="footer-col">
            <h4>Club</h4>
            <a href="#teams">Teams</a>
            <a href="#honours">Honours</a>
            <a href="#news">News</a>
            <a href="#sponsors">Sponsors</a>
          </div>

          <div className="footer-col">
            <h4>Pages</h4>
            <Link href="/news/bestyrelsen">Bestyrelsen</Link>
            <Link href="/news/kontingent">Kontingent</Link>
            <Link href="/news/traening">Træning</Link>
            <Link href="/news/bliv-medlem">Bliv Medlem</Link>
            <Link href="/news/scorecards">Scorecards</Link>
            <Link href="/news/klub-info">Klub Info</Link>
          </div>

          <div className="footer-col">
            <h4>Visit</h4>
            <span>{contact.venue}</span>
            {contact.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            {contact.chairman ? <span>Chairman: {contact.chairman}</span> : null}
            {contact.youth ? <span>Youth: {contact.youth}</span> : null}
            {contact.oldboys ? (
              <span>Oldboys: {contact.oldboys}</span>
            ) : null}
            <a href={WORDPRESS_URL} target="_blank" rel="noopener noreferrer">
              Legacy site →
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Glostrup Cricket Club</span>
          <span>Member of Dansk Cricket Forbund since 1960</span>
        </div>
      </div>
    </footer>
  );
}