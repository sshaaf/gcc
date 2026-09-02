import { z } from "zod";
import { readMarkdownDir } from "./_io";

const pageSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
});

export type Page = z.infer<typeof pageSchema>;

export async function getPages(): Promise<Array<Page & { slug: string }>> {
  const items = await readMarkdownDir("pages", pageSchema);
  return items
    .map((item) => {
      const { _slug, _body, ...rest } = item as Page & {
        _slug: string;
        _body: string;
      };
      return { ...rest, slug: _slug };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "da"));
}

export async function getPageBySlug(
  slug: string,
): Promise<(Page & { slug: string; body: string }) | null> {
  const { findMarkdownBySlug } = await import("./_io");
  const found = await findMarkdownBySlug("pages", slug, pageSchema);
  if (!found) return null;
  return { ...found.data, slug, body: found.body };
}

export async function getPageSlugs(): Promise<string[]> {
  const pages = await getPages();
  return pages.map((p) => p.slug);
}