import bcrypt from "bcrypt";

import prisma from "../config/prisma";

import { RegisterDto, LoginDto } from "../validators/auth.validator";

import { generateToken } from "../utils/jwt";

export const registerUser = async (
  data: RegisterDto
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    10
  );

  const createdUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword
    }
  });

  return createdUser;
};

export const loginUser = async (
  data: LoginDto
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  });

  if (!existingUser) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid =
    await bcrypt.compare(
      data.password,
      existingUser.password
    );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(
    existingUser.id
  );

  return {
    token,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email
    }
  };
};