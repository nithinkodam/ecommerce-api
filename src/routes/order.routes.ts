import { Router } from "express";

import {
  checkoutOrder
} from "../controllers/order.controller";

import {
  authMiddleware
} from "../middleware/auth.middleware";

const r = Router();

r.post(
  "/checkout",
  authMiddleware,
  checkoutOrder
);

export default r;