import { z } from "zod";

export const updateOrderStatusSchema =
  z.object({
    status: z.enum([
      "PENDING",
      "PACKED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    ])
  });