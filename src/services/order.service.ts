import prisma from "../config/prisma";

import {
  OrderStatus
} from "@prisma/client";

import {
  canMove
} from "../utils/orderTransitions";

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
                "PENDING",

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

export const updateOrderStatus =
  async (
    orderId: string,
    status: OrderStatus
  ) => {

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId
        },

        include: {
          items: true,
          user: true
        }
      });

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    if (
      !canMove(
        order.status,
        status
      )
    ) {
      throw new Error(
        "Invalid status transition"
      );
    }

    const result =
     await prisma.$transaction(
      async (tx) => {

        if (
          status ===
          OrderStatus.CANCELLED
        ) {

          for (
            const item
            of order.items
          ) {

            await tx.product.update({
              where: {
                id: item.productId
              },

              data: {
                stock: {
                  increment:
                    item.quantity
                }
              }
            });

          }

        }

        const updatedOrder =
          await tx.order.update({
            where: {
              id: orderId
            },

            data: {
              status
            }
          });

        
        return updatedOrder;
      }
    );

    await orderQueue.add(
      "order-status-email",

      {
        orderId: order.id,
        userId: order.userId,
        status
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

  export const getMyOrders = async (
  userId: string
) => {

  const orders =
    await prisma.order.findMany({
      where: {
        userId
      },

      orderBy: {
        createdAt: "desc"
      }
    });

  return orders;
};

export const getOrderById =
  async (
    orderId: string,
    userId: string
  ) => {

    const order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          userId
        },

        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    return order;
};