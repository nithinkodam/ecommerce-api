

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


    // console.log(response);

    return response;
};