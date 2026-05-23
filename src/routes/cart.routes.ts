import { Router } from "express";

import {
  add
} from "../controllers/cart.controller";

import {
  authMiddleware
} from "../middleware/auth.middleware";

const r = Router();

r.post(
  "/:slug",
  authMiddleware,
  add
);

export default r;