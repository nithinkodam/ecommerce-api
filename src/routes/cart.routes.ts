import { Router } from "express";

import {
  add,
  get,
  update,
  remove
} from "../controllers/cart.controller";

import {
  authMiddleware
} from "../middleware/auth.middleware";

const r = Router();

r.get(
  "/",
  authMiddleware,
  get
);

r.post(
  "/:slug",
  authMiddleware,
  add
);

r.put(
  "/:slug",
  authMiddleware,
  update
);

r.delete(
  "/:slug",
  authMiddleware,
  remove
);

export default r;