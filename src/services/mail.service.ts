

import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export const sendOrderEmail =
  async (
    to: string,
    orderId: string
  ) => {

    const response =
      await resend.emails.send({

        from:
          "onboarding@resend.dev",

        to,

        subject:
          "Order Confirmed",

        html: `
          <h1>Order Confirmed</h1>

          <p>
            Your order has been placed successfully.
          </p>

          <p>
            Order ID:
            ${orderId}
          </p>
        `
      });


    console.log(response);

    return response;
};

export const sendOrderStatusEmail =
  async (
    to: string,
    orderId: string,
    status: string
  ) => {

    const response =
      await resend.emails.send({

        from:
          "onboarding@resend.dev",

        to,

        subject:
          "Order Status Updated",

        html: `
          <h1>Order Status Updated</h1>

          <p>
            Your order status has been updated.
          </p>

          <p>
            Order ID:
            ${orderId}
          </p>

          <p>
            New Status:
            <b>${status}</b>
          </p>
        `
      });

    console.log(response);

    return response;
};