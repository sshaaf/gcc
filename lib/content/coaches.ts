import { z } from "zod";
import { readMarkdownDir } from "./_io";

const coachSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  photo: z.string().optional(),
  order: z.number().int().default(100),
});

export type Coach = z.infer<typeof coachSchema>;

export async function getCoaches(): Promise<Array<Coach & { slug: string }>> {
  const items = await readMarkdownDir("coaches", coachSchema, {
    sortBy: (c) => c.order,
  });
  return items.map((item) => {
    const { _slug, _body, ...rest } = item as Coach & {
      _slug: string;
      _body: string;
    };
    return { ...rest, slug: _slug };
  });
}