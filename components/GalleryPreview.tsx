import { getGalleries } from "@/lib/content";
import Image from "next/image";
import { Reveal } from "./Reveal";

export async function GalleryPreview() {
  const galleries = await getGalleries();
  const gallery = galleries[0];
  const photos = gallery?.photos ?? [];

  return (
    <section id="gallery">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="kicker">Gallery</p>
            <h2 className="disp">From the Ground</h2>
          </div>
          {gallery ? (
            <a className="more" href={`/gallery/${gallery.slug}`}>
              View gallery
            </a>
          ) : null}
        </Reveal>
        {photos.length === 0 ? (
          <Reveal>
            <p className="gallery-empty">
              No photos yet — drop images into <code>/public/gallery/</code> and
              reference them from <code>content/gallery/</code>.
            </p>
          </Reveal>
        ) : (
          <Reveal className="gallery-preview-grid">
            {photos.slice(0, 4).map((p) => (
              <a
                key={p.src}
                href={gallery ? `/gallery/${gallery.slug}` : "#"}
                aria-label={p.caption ?? p.alt}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={600}
                  height={600}
                  unoptimized
                />
              </a>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}