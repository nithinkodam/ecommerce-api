import prisma from "../config/prisma";

import {  orderQueue } from "../queues/order.queue";

export const checkout = async (
  userId: string
) => {

  const cartItems =
    await prisma.cartItem.findMany({
      where: {
        userId
      },

      include: {
        product: true
      }
    });

  if (cartItems.length === 0) {
    throw new Error(
      "Cart is empty"
    );
  }

  for (const item of cartItems) {

    if (item.product.isDeleted) {
      throw new Error(
        `${item.product.name} is unavailable`
      );
    }

    if (
      item.quantity >
      item.product.stock
    ) {
      throw new Error(
        `Insufficient stock for ${item.product.name}`
      );
    }
  }

  const result =
    await prisma.$transaction(
      async (tx) => {

        let totalPrice = 0;

        for (const item of cartItems) {
          totalPrice +=
            item.quantity *
            item.product.price;
        }

        const order =
          await tx.order.create({
            data: {
              userId,

              totalPrice,

              status:
                "CONFIRMED",

              paymentStatus:
                "PAID"
            }
          });

        for (const item of cartItems) {

          await tx.orderItem.create({
            data: {
              orderId:
                order.id,

              productId:
                item.product.id,

              quantity:
                item.quantity,

              price:
                item.product.price
            }
          });

          await tx.product.update({
            where: {
              id:
                item.product.id
            },

            data: {
              stock: {
                decrement:
                  item.quantity
              }
            }
          });
        }

        await tx.cartItem.deleteMany({
          where: {
            userId
          }
        });

        return order;
      }
    );

  await orderQueue.add(
    "send-order-email",

    {
      orderId: result.id,
      userId
    },

    {
      attempts: 3,

      backoff: {
        type: "exponential",

        delay: 3000
      },

      removeOnComplete: true,

      removeOnFail: false
    }
  );

  return result;
};