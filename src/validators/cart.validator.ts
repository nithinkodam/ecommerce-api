import { z } from "zod";

export const addToCartSchema =
  z.object({
    quantity: z
      .number()
      .int()
      .min(1)
  });

export type AddToCartDto =
  z.infer<
    typeof addToCartSchema
  >;