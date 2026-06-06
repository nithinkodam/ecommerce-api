import {
  Response
} from "express";

import {
  updateOrderStatusSchema
} from "../validators/order.validator";

import {
  OrderStatus
} from "@prisma/client";

import {
  AuthRequest
} from "../middleware/auth.middleware";

import {
  checkout,
  updateOrderStatus
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

export const updateStatus =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const { status } =
        updateOrderStatusSchema.parse(
          req.body
        );

      const order =
        await updateOrderStatus(
          req.params.id as string,
          status as OrderStatus
        );

      return res.json({
        success: true,
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