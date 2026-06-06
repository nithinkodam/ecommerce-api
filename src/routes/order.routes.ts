import { Router } from "express";

import {
  checkoutOrder,
  updateStatus,
  getOrders,
  getOrder
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

r.get(
  "/",
  authMiddleware,
  getOrders
);

r.get(
  "/:id",
  authMiddleware,
  getOrder
);

r.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateStatus
);
export default r;