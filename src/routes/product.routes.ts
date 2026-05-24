import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove
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

r.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  update
);

r.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  remove
);

export default r;