import { Router } from "express";

import {
  create,
  getAll,
  update,
  remove
} from "../controllers/review.controller";

import {
  authMiddleware
} from "../middleware/auth.middleware";

export const productReviewRoutes =
  Router();

export const reviewRoutes =
  Router();

productReviewRoutes.get(
  "/:slug/reviews",
  getAll
);

productReviewRoutes.post(
  "/:slug/reviews",
  authMiddleware,
  create
);

reviewRoutes.put(
  "/:id",
  authMiddleware,
  update
);

reviewRoutes.delete(
  "/:id",
  authMiddleware,
  remove
);