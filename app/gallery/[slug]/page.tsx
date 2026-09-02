import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getGalleryBySlug, getGallerySlugs } from "@/lib/content";

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await getGallerySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) return {};
  return {
    title: `${gallery.title} — Glostrup Cricket Club`,
    description: gallery.excerpt ?? gallery.title,
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span>Gallery</span>
          <span className="hide-m">Glostrup Cricket Club</span>
        </div>
      </div>
      <header className="nav" style={{ background: "rgba(10,26,74,0.92)" }}>
        <div className="nav-inner">
          <Link href="/" className="crest">
            <span className="crest-name">
              <span className="top">Glostrup</span>
              <br />
              <span className="sub">Cricket Club</span>
            </span>
          </Link>
          <Link className="btn btn-line" href="/">
            ← Back home
          </Link>
        </div>
      </header>
      <section style={{ padding: "96px 0" }}>
        <div className="wrap">
          <p className="kicker">Gallery</p>
          <h1 className="disp" style={{ fontSize: "clamp(36px,5vw,56px)" }}>
            {gallery.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--cond)",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--chalk-dim)",
              marginTop: 14,
              marginBottom: 36,
            }}
          >
            {new Date(gallery.date).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </p>
          {gallery.photos.length === 0 ? (
            <p className="gallery-empty">
              No photos in this gallery yet.
            </p>
          ) : (
            <div className="gallery-detail-grid">
              {gallery.photos.map((p) => (
                <figure key={p.src}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={1200}
                    height={800}
                    unoptimized
                  />
                  {p.caption ? <figcaption>{p.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}