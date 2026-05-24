import {
  Request,
  Response,
  NextFunction
} from "express";

import redis from "../config/redis";

export const loginRateLimiter =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    const ip =
      req.ip;

    const key =
      `login_rate_limit:${ip}`;

    const requests =
      await redis.incr(key);

    if (requests === 1) {

      await redis.expire(
        key,
        60
      );
    }

    if (requests > 5) {

      return res.status(429).json({
        success: false,

        message:
          "Too many login attempts. Try again later."
      });
    }

    next();
};