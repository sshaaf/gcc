import { z } from "zod";
import { medalSchema } from "./types";
import { readMarkdownDir } from "./_io";

const teamSchema = z.object({
  name: z.string().min(1),
  jersey: z.string().min(1),
  description: z.string().min(1),
  medal: medalSchema.optional(),
  order: z.number().int().default(100),
});

export type Team = z.infer<typeof teamSchema>;

export async function getTeams(): Promise<Array<Team & { slug: string }>> {
  const items = await readMarkdownDir("teams", teamSchema, {
    sortBy: (t) => t.order,
  });
  return items.map((item) => {
    const { _slug, _body, ...rest } = item as Team & {
      _slug: string;
      _body: string;
    };
    return { ...rest, slug: _slug };
  });
}