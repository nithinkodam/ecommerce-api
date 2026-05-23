import {
  NextFunction,
  Response
} from "express";

import { AuthRequest } from "./auth.middleware";

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied"
    });
  }

  next();
};