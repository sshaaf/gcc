import { z } from "zod";
import { readMarkdownDir, findMarkdownBySlug } from "./_io";

const scorecardRowSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const baseNewsFields = {
  title: z.string().min(1),
  date: z.string().min(1),
  tag: z.string().min(1),
  excerpt: z.string().min(1),
  lead: z.boolean().optional(),
};

const newsSchema = z.object({
  ...baseNewsFields,
  type: z.literal("news").optional(),
  scorecard: z.array(scorecardRowSchema).optional(),
  opponent: z.string().optional(),
  result: z.string().optional(),
});

const matchReportSchema = z.object({
  ...baseNewsFields,
  type: z.literal("match-report"),
  opponent: z.string().min(1),
  result: z.string().min(1),
  scorecard: z.array(scorecardRowSchema).min(1),
});

const newsUnionSchema = z
  .union([matchReportSchema, newsSchema])
  .refine(
    (v) => {
      if (v.type === "match-report") return true;
      return !("opponent" in v && v.opponent) && !("result" in v && v.result);
    },
    {
      message:
        "opponent and result fields are only valid when type is 'match-report'",
    },
  );

export type NewsItem = z.infer<typeof newsUnionSchema>;
export type NewsPost = NewsItem & { slug: string };

export async function getNews(): Promise<NewsPost[]> {
  const items = await readMarkdownDir("news", newsUnionSchema);
  return (items as Array<NewsItem & { _slug: string; _body: string }>)
    .map(({ _slug, _body, ...rest }) => ({ ...rest, slug: _slug }) as NewsPost)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getNewsBySlug(
  slug: string,
): Promise<(NewsItem & { slug: string; body: string }) | null> {
  const found = await findMarkdownBySlug("news", slug, newsUnionSchema);
  if (!found) return null;
  return { ...found.data, slug, body: found.body };
}

export async function getNewsSlugs(): Promise<string[]> {
  const items = await getNews();
  return items.map((n) => n.slug);
}