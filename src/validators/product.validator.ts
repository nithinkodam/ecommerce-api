import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3),

  slug: z
    .string()
    .min(3),

  description: z
    .string()
    .min(10),

  price: z
    .number()
    .positive(),

  stock: z
    .number()
    .int()
    .min(0),

  imageUrl: z
    .string()
    .url()
    .optional(),

  categoryId: z
    .string()
});

export type CreateProductDto =
  z.infer<typeof createProductSchema>;
  