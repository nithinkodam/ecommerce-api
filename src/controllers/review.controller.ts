import {
  Response
} from "express";

import {
  AuthRequest
} from "../middleware/auth.middleware";

import {
  createReviewSchema
} from "../validators/review.validator";

import {
  createReview
} from "../services/review.service";

export const create = async (
  req: AuthRequest,
  res: Response
) => {

  const validatedResult =
    createReviewSchema.safeParse(
      req.body
    );

  if (!validatedResult.success) {
    return res.status(400).json({
      success: false,
      errors:
        validatedResult.error.flatten()
    });
  }

  try {

    const result =
      await createReview(
        req.userId!,
        req.params.slug as string,
        validatedResult.data
      );

    return res.status(201).json({
      success: true,
      message:
        "Review added successfully",
      data: result
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong"
    });
  }
};