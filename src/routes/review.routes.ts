import { Router } from "express";

import {
  create
} from "../controllers/review.controller";

import {
  authMiddleware
} from "../middleware/auth.middleware";

const r = Router();

r.post(
  "/:slug/reviews",
  authMiddleware,
  create
);

export default r;