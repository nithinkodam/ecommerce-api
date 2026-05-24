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
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
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

export const get = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const cart =
      await getCart(
        req.userId!
      );

    return res.json({
      success: true,
      data: cart
    });

  } catch {

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong"
    });

  }
};

export const update = async (
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

    const updatedCartItem =
      await updateCartQuantity(
        req.userId!,
        req.params.slug as string,
        validatedResult.data.quantity
      );

    return res.json({
      success: true,
      message:
        "Cart updated successfully",

      data: updatedCartItem
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

export const remove = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    await removeFromCart(
      req.userId!,
      req.params.slug as string
    );

    return res.json({
      success: true,
      message:
        "Item removed from cart"
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