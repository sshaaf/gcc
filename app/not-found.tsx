import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span>404 · Not Found</span>
        </div>
      </div>
      <section style={{ padding: "120px 0" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="kicker" style={{ marginBottom: 18 }}>
            404
          </p>
          <h1
            className="disp"
            style={{
              fontSize: "clamp(48px,8vw,96px)",
              marginBottom: 24,
            }}
          >
            Page Not Found
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "var(--chalk-dim)",
              maxWidth: 520,
              margin: "0 auto 32px",
            }}
          >
            The page you&rsquo;re looking for doesn&rsquo;t exist — or it has
            moved to the new site from the legacy archive.
          </p>
          <Link className="btn btn-gold" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}