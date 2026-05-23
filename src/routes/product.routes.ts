import { Router } from "express";

import {
  create,
  getAll,
  getOne
} from "../controllers/product.controller";

import {
  authMiddleware
} from "../middleware/auth.middleware";

import {
  adminMiddleware
} from "../middleware/admin.middleware";

const r = Router();

r.get("/", getAll);

r.get("/:slug", getOne);

r.post(
  "/",
  authMiddleware,
  adminMiddleware,
  create
);

export default r;