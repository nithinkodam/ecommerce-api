import {
  Response
} from "express";

import {
  AuthRequest
} from "../middleware/auth.middleware";

import {
  checkout
} from "../services/order.service";

export const checkoutOrder =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const order =
        await checkout(
          req.userId!
        );

      return res.status(201).json({
        success: true,
        message:
          "Order placed successfully",

        data: order
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong"
      });

    }
};