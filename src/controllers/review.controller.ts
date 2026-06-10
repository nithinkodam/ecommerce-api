import {
  Response
} from "express";

import {
  AuthRequest
} from "../middleware/auth.middleware";

import {
  createReviewSchema,
  updateReviewSchema
} from "../validators/review.validator";

import {
  createReview,
  getReviewsByProductSlug,
  updateReview,
  deleteReview
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

export const getAll =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const reviews =
        await getReviewsByProductSlug(
          req.params.slug as string
        );

      return res.json({
        success: true,
        data: reviews
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

export const update =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const validated =
      updateReviewSchema.safeParse(
        req.body
      );

    if (!validated.success) {

      return res.status(400).json({
        success: false,
        errors:
          validated.error.flatten()
      });

    }

    try {

      const result =
        await updateReview(
          req.userId!,
          req.params.id as string,
          validated.data
        );

      return res.json({
        success: true,
        message:
          "Review updated successfully",
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

export const remove =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const result =
        await deleteReview(
          req.userId!,
          req.params.id as string
        );

      return res.json({
        success: true,
        message:
          "Review deleted successfully",
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