import { z } from "zod";
import { photoSchema } from "./types";
import { readMarkdownDir, findMarkdownBySlug } from "./_io";

const gallerySchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  excerpt: z.string().optional(),
  photos: z.array(photoSchema).default([]),
});

export type Gallery = z.infer<typeof gallerySchema>;

export async function getGalleries(): Promise<
  Array<Gallery & { slug: string }>
> {
  const items = await readMarkdownDir("gallery", gallerySchema);
  return (items as Array<Gallery & { _slug: string; _body: string }>)
    .map(({ _slug, _body, ...rest }) => ({ ...rest, slug: _slug }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getGalleryBySlug(
  slug: string,
): Promise<(Gallery & { slug: string; body: string }) | null> {
  const found = await findMarkdownBySlug("gallery", slug, gallerySchema);
  if (!found) return null;
  return { ...found.data, slug, body: found.body };
}

export async function getGallerySlugs(): Promise<string[]> {
  const items = await getGalleries();
  return items.map((g) => g.slug);
}