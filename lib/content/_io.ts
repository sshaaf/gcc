import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export class ContentError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
  ) {
    super(`${filePath}: ${message}`);
    this.name = "ContentError";
  }
}

export async function readMarkdownFile<T extends z.ZodTypeAny>(
  relativePath: string,
  schema: T,
): Promise<{ data: z.infer<T>; body: string; slug: string }> {
  const filePath = path.join(CONTENT_ROOT, relativePath);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (err) {
    throw new ContentError(
      `Could not read file: ${(err as Error).message}`,
      relativePath,
    );
  }
  const parsed = matter(raw);
  const result = schema.safeParse(parsed.data);
  if (!result.success) {
    throw new ContentError(
      `Invalid frontmatter: ${result.error.issues
        .map((i) => `${i.path.join(".") || "<root>"} — ${i.message}`)
        .join("; ")}`,
      relativePath,
    );
  }
  const slug = path.basename(relativePath, ".md");
  return { data: result.data, body: parsed.content.trim(), slug };
}

export async function readMarkdownDir<T extends z.ZodTypeAny>(
  dirRelative: string,
  schema: T,
  options: {
    sortBy?: (item: z.infer<T> & { _slug: string }) => number | string;
  } = {},
): Promise<Array<z.infer<T> & { _slug: string; _body: string }>> {
  const dirPath = path.join(CONTENT_ROOT, dirRelative);
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch (err) {
    throw new ContentError(
      `Could not list directory: ${(err as Error).message}`,
      dirRelative,
    );
  }
  const mdFiles = entries.filter((e) => e.endsWith(".md"));
  const results = await Promise.all(
    mdFiles.map(async (file) => {
      const rel = path.join(dirRelative, file);
      const { data, body, slug } = await readMarkdownFile(rel, schema);
      return { ...data, _slug: slug, _body: body };
    }),
  );
  if (options.sortBy) {
    const sortKey = options.sortBy;
    results.sort((a, b) => {
      const ka = sortKey(a as T & { _slug: string }) ?? 0;
      const kb = sortKey(b as T & { _slug: string }) ?? 0;
      if (typeof ka === "number" && typeof kb === "number") return ka - kb;
      return String(ka).localeCompare(String(kb));
    });
  }
  return results;
}

export async function findMarkdownBySlug<T extends z.ZodTypeAny>(
  dirRelative: string,
  slug: string,
  schema: T,
): Promise<{ data: z.infer<T>; body: string; slug: string } | null> {
  const dirPath = path.join(CONTENT_ROOT, dirRelative);
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return null;
  }
  const match = entries.find((e) => e === `${slug}.md`);
  if (!match) return null;
  return readMarkdownFile(path.join(dirRelative, match), schema);
}