import dotenv from "dotenv";

dotenv.config();

import prisma from "../config/prisma";

import { sendOrderEmail } from "../services/mail.service";

import { Worker } from "bullmq";

import redis from "../config/redis";

const worker = new Worker(
  "orderQueue",

  async (job) => {

    console.log(
      "Processing job:",
      job.name
    );

    console.log(
      "Job data:",
      job.data
    );

    const user = await prisma.user.findUnique({
        where: {
        id: job.data.userId
        }
    });

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    await sendOrderEmail(
        user.email,
        job.data.orderId
    );

    console.log(
        `Email sent to ${user.email}`
    );
  },

  {
    connection: redis
  }
);

worker.on(
  "completed",
  (job) => {
    console.log(
      `Job ${job.id} completed`
    );
  }
);

worker.on(
  "failed",
  (job, err) => {
    console.log(
      `Job ${job?.id} failed`,
      err
    );
  }
);