import { z } from "zod";
import { readMarkdownFile } from "./_io";

const fixtureSchema = z.object({
  home: z.string().min(1),
  away: z.string().min(1),
  when: z.string().min(1),
  venue: z.string().min(1),
});

export type Fixture = z.infer<typeof fixtureSchema>;

export async function getNextFixture(): Promise<Fixture | null> {
  try {
    const { data } = await readMarkdownFile("fixtures/next.md", fixtureSchema);
    return data;
  } catch {
    return null;
  }
}