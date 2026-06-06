import { OrderStatus } from "@prisma/client";

export const orderTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: [
    OrderStatus.PACKED,
    OrderStatus.CANCELLED
  ],

  PACKED: [
    OrderStatus.SHIPPED
  ],

  SHIPPED: [
    OrderStatus.DELIVERED
  ],

  DELIVERED: [],

  CANCELLED: []
};

export const canMove = (
  current: OrderStatus,
  next: OrderStatus
) => {
  return orderTransitions[current]
    .includes(next);
};