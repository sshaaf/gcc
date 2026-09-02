import { z } from "zod";
import { readMarkdownFile } from "./_io";

const statsSchema = z.object({
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(1),
});

export type Stats = z.infer<typeof statsSchema>;

export async function getStats(): Promise<Stats["stats"]> {
  const { data } = await readMarkdownFile("stats/index.md", statsSchema);
  return data.stats;
}