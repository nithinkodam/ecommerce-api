import {
  NextFunction,
  Request,
  Response
} from "express";

import jwt from "jsonwebtoken";

export interface AuthRequest
  extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader =
    req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const token =
    authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
    };

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};