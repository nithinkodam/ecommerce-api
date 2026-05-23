import {
  Response
} from "express";

import {
  AuthRequest
} from "../middleware/auth.middleware";

import {
  addToCartSchema
} from "../validators/cart.validator";

import {
  addToCart
} from "../services/cart.service";

export const add = async (
  req: AuthRequest,
  res: Response
) => {

  const validatedResult =
    addToCartSchema.safeParse(
      req.body
    );

  if (!validatedResult.success) {
    return res.status(400).json({
      success: false,
      errors:
        validatedResult.error.flatten()
    });
  }

  try {

    const cartItem =
      await addToCart(
        req.userId!,
        req.params.slug as string,
        validatedResult.data
      );

    return res.status(201).json({
      success: true,
      message:
        "Item added to cart",
      data: cartItem
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