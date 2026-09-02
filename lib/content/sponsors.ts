import { z } from "zod";
import { readMarkdownFile } from "./_io";

const sponsorEntrySchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  url: z.string().url().optional(),
  order: z.number().int().default(100),
});

const sponsorsSchema = z.object({
  sponsors: z.array(sponsorEntrySchema).default([]),
});

export type Sponsor = z.infer<typeof sponsorEntrySchema>;

export async function getSponsors(): Promise<Sponsor[]> {
  try {
    const { data } = await readMarkdownFile(
      "sponsors/index.md",
      sponsorsSchema,
    );
    return [...data.sponsors].sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}