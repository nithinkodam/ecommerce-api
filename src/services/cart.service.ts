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

export const getCart = async (
  userId: string
) => {

  const cartItems =
    await prisma.cartItem.findMany({
      where: {
        userId
      },

      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

  const formattedItems =
    cartItems.map((item) => {

      const total =
        item.quantity *
        item.product.price;

      return {
        id: item.id,

        quantity:
          item.quantity,

        total,

        product: {
          id: item.product.id,

          name:
            item.product.name,

          slug:
            item.product.slug,

          price:
            item.product.price,

          imageUrl:
            item.product.imageUrl,

          stock:
            item.product.stock,

          averageRating:
            item.product.averageRating,

          category:
            item.product.category
        }
      };
    });

  const grandTotal =
    formattedItems.reduce(
      (sum, item) =>
        sum + item.total,
      0
    );

  return {
    items: formattedItems,
    grandTotal
  };
};

export const updateCartQuantity =
  async (
    userId: string,
    slug: string,
    quantity: number
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

    const cartItem =
      await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: product.id
          }
        }
      });

    if (!cartItem) {
      throw new Error(
        "Cart item not found"
      );
    }

    if (quantity > product.stock) {
      throw new Error(
        "Insufficient stock"
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
          quantity
        }
      });

    return updatedCartItem;
};

export const removeFromCart =
  async (
    userId: string,
    slug: string
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

    const cartItem =
      await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: product.id
          }
        }
      });

    if (!cartItem) {
      throw new Error(
        "Cart item not found"
      );
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId: product.id
        }
      }
    });

    return;
};