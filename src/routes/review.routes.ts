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

const r = Router();

r.get(
  "/:slug/reviews",
  getAll
);

r.post(
  "/:slug/reviews",
  authMiddleware,
  create
);

r.put(
  "/:id",
  authMiddleware,
  update
);

r.delete(
  "/:id",
  authMiddleware,
  remove
);

export default r;