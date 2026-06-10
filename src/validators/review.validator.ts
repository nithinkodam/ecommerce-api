import { z } from "zod";

export const createReviewSchema =
  z.object({
    rating: z
      .number()
      .int()
      .min(1)
      .max(5),

    comment: z
      .string()
      .min(3)
      .max(500)
  });

export type CreateReviewDto =
  z.infer<
    typeof createReviewSchema
  >;

export const updateReviewSchema =
  z.object({

    rating: z
      .number()
      .int()
      .min(1)
      .max(5),

    comment: z
      .string()
      .min(3)
      .max(500)

  });

export type UpdateReviewDto =
  z.infer<
    typeof updateReviewSchema
  >;