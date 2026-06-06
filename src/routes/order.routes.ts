import { Router } from "express";

import {
  checkoutOrder,
  updateStatus
} from "../controllers/order.controller";

import {
  authMiddleware
} from "../middleware/auth.middleware";

import {
  adminMiddleware
} from "../middleware/admin.middleware";

const r = Router();

r.post(
  "/checkout",
  authMiddleware,
  checkoutOrder
);

r.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateStatus
);

export default r;