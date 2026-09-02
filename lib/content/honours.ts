import { z } from "zod";
import { readMarkdownDir } from "./_io";

const honourSchema = z.object({
  title: z.string().min(1),
  years: z.string().min(1),
  order: z.number().int().default(100),
});

export type Honour = z.infer<typeof honourSchema>;

export async function getHonours(): Promise<Array<Honour & { slug: string }>> {
  const items = await readMarkdownDir("honours", honourSchema, {
    sortBy: (h) => h.order,
  });
  return items.map((item) => {
    const { _slug, _body, ...rest } = item as Honour & {
      _slug: string;
      _body: string;
    };
    return { ...rest, slug: _slug };
  });
}