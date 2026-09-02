import { z } from "zod";
import { readMarkdownFile } from "./_io";

const homeSchema = z.object({
  kicker: z.string(),
  titleRow1: z.string(),
  titleRow2: z.string(),
  estLabel: z.string(),
  estDate: z.string(),
  estVenue: z.string(),
  ctaPrimary: z.string(),
  ctaSecondary: z.string(),
});

export type HomePage = z.infer<typeof homeSchema>;

export async function getHome(): Promise<HomePage> {
  const { data } = await readMarkdownFile("home/page.md", homeSchema);
  return data;
}