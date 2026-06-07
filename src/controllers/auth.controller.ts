import { Request, Response } from "express";

import { registerSchema, loginSchema } from "../validators/auth.validator";

import { registerUser, loginUser, getCurrentUser } from "../services/auth.service"

import { AuthRequest } from "../middleware/auth.middleware";

export const test = async (req: Request, res: Response) => {
  res.json({
    message: "Auth controller working"
  });
};  


export const register = async (
  req: Request,
  res: Response
) => {
  const validatedResult =
    registerSchema.safeParse(req.body);

  if (!validatedResult.success) {
    return res.status(400).json({
      errors:
        validatedResult.error.flatten()
    });
  }

  try {
    const createdUser = await registerUser(
      validatedResult.data
    );

    return res.status(201).json({
      message: "User registered",
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email
      }
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong"
    });
  }
};


export const login = async (
  req: Request,
  res: Response
) => {
  const validatedResult =
    loginSchema.safeParse(req.body);

  if (!validatedResult.success) {
    return res.status(400).json({
      errors:
        validatedResult.error.flatten()
    });
  }

  try {
    const loginResult = await loginUser(
      validatedResult.data
    );

    return res.json(loginResult);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong"
    });
  }
};


export const me = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const user =
      await getCurrentUser(
        req.userId!
      );

    return res.json(user);

  } catch {

    return res.status(500).json({
      message:
        "Something went wrong"
    });

  }

};