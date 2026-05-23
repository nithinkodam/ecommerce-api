import {
  Request,
  Response
} from "express";

import {
  createProductSchema
} from "../validators/product.validator";

import {
  createProduct,
  getProducts, 
  getProductBySlug
} from "../services/product.service";



export const create = async (
  req: Request,
  res: Response
) => {
  const validatedResult =
    createProductSchema.safeParse(
      req.body
    );

  if (!validatedResult.success) {
    return res.status(400).json({
      success: false,
      errors:
        validatedResult.error.flatten()
    });
  }

  try {
    const product =
      await createProduct(
        validatedResult.data
      );

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong"
    });
  }
};

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await getProducts(req.query);

    return res.json({
      success: true,
      message:
        "Products fetched successfully",
      data: result.products,

      pagination:
        result.pagination
    });
  } catch {
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong"
    });
  }
};

export const getOne = async (
  req: Request,
  res: Response
) => {
  try {
    const product =
      await getProductBySlug(
        req.params.slug as string
      );

    return res.json({
      success: true,
      message:
        "Product fetched successfully",
      data: product
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong"
    });
  }
};