import { z } from "zod";
import { readMarkdownFile } from "./_io";

const contactSchema = z.object({
  addressLines: z.array(z.string()).min(1),
  venue: z.string(),
  chairman: z.string().optional(),
  youth: z.string().optional(),
  oldboys: z.string().optional(),
  about: z.string().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

export async function getContact(): Promise<Contact> {
  const { data } = await readMarkdownFile("contact/index.md", contactSchema);
  return data;
}