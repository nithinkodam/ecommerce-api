import prisma from "../config/prisma";

import {
  AddToCartDto
} from "../validators/cart.validator";

export const addToCart = async (
  userId: string,
  slug: string,
  data: AddToCartDto
) => {

  const product =
    await prisma.product.findFirst({
      where: {
        slug,
        isDeleted: false
      }
    });

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  if (product.stock < data.quantity) {
    throw new Error(
      "Insufficient stock"
    );
  }

  const existingCartItem =
    await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: product.id
        }
      }
    });

  if (existingCartItem) {

    const newQuantity =
      existingCartItem.quantity +
      data.quantity;

    if (newQuantity > product.stock) {
      throw new Error(
        "Stock limit exceeded"
      );
    }

    const updatedCartItem =
      await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId: product.id
          }
        },

        data: {
          quantity: newQuantity
        }
      });

    return updatedCartItem;
  }

  const cartItem =
    await prisma.cartItem.create({
      data: {
        userId,
        productId: product.id,
        quantity: data.quantity
      }
    });

  return cartItem;
};