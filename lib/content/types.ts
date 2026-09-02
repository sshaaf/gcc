import { z } from "zod";

export const medalSchema = z.object({
  label: z.string().min(1),
  variant: z.enum(["gold", "silver", "bronze"]).default("gold"),
});
export type Medal = z.infer<typeof medalSchema>;

export const photoSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
});
export type Photo = z.infer<typeof photoSchema>;

export const orderableSchema = z.object({
  order: z.number().int().default(100),
});