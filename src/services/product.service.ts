import prisma from "../config/prisma";

import slugify from "slugify";

import { CreateProductDto, UpdateProductDto } from "../validators/product.validator";

import { getCache, setCache, deleteCache } from "../utils/cache";

export const createProduct =
  async (
    data: CreateProductDto
  ) => {

    const slug =
      slugify(
        data.name,
        {
          lower: true,
          strict: true
        }
      );

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          slug
        }
      });

    if (existingProduct) {
      throw new Error(
        "Product already exists"
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: data.categoryId
        }
      });

    if (!category) {
      throw new Error(
        "Category not found"
      );
    }

    const product =
      await prisma.product.create({
        data: {
          ...data,
          slug
        }
      });

    return product;
};

export const updateProduct =
  async (
    productId: string,
    data: UpdateProductDto
  ) => {

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId
        }
      });

    if (!existingProduct) {
      throw new Error(
        "Product not found"
      );
    }

    let slug =
      existingProduct.slug;

    if (data.name) {

      slug =
        slugify(
          data.name,
          {
            lower: true,
            strict: true
          }
        );
    }

    if (data.categoryId) {

      const category =
        await prisma.category.findUnique({
          where: {
            id: data.categoryId
          }
        });

      if (!category) {
        throw new Error(
          "Category not found"
        );
      }
    }

    const updatedProduct =
      await prisma.product.update({
        where: {
          id: productId
        },

        data: {
          ...data,
          slug
        }
      });

    await deleteCache(
      `product:${existingProduct.slug}`
    );

    if (
      existingProduct.slug !== slug
    ) {

      await deleteCache(
        `product:${slug}`
      );
    }

    return updatedProduct;
};

export const deleteProduct =
  async (
    productId: string
  ) => {

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId
        }
      });

    if (!existingProduct) {
      throw new Error(
        "Product not found"
      );
    }

    if (existingProduct.isDeleted) {
      throw new Error(
        "Product already deleted"
      );
    }

    const deletedProduct =
      await prisma.product.update({
        where: {
          id: productId
        },

        data: {
          isDeleted: true
        }
      });

    await deleteCache(
      `product:${existingProduct.slug}`
    );

    return deletedProduct;
};

interface GetProductsQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  sort?: string;
}

export const getProducts = async (
  query: GetProductsQuery
) => {
  const page =
    Number(query.page) || 1;

  const limit =
    Number(query.limit) || 10;

  const skip =
    (page - 1) * limit;

  const search =
    query.search || "";

  const category =
    query.category;

  const sort =
    query.sort || "newest";

  const where: any = {
    isDeleted: false
  };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive"
    };
  }

  if (category) {
    where.category = {
      slug: category
    };
  }

  let orderBy: any = {
    createdAt: "desc"
  };

  if (sort === "price_asc") {
    orderBy = {
      price: "asc"
    };
  }

  if (sort === "price_desc") {
    orderBy = {
      price: "desc"
    };
  }

  if (sort === "rating_desc") {
    orderBy = {
      averageRating: "desc"
    };
  }

  const [products, total] =
    await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,

        include: {
          category: true
        }
      }),

      prisma.product.count({
        where
      })
    ]);

  return {
    products,

    pagination: {
      total,
      page,
      limit,
      totalPages:
        Math.ceil(total / limit)
    }
  };
};

export const getProductBySlug =
  async (slug: string) => {

    const cacheKey =
      `product:${slug}`;

    const cachedProduct =
      await getCache(cacheKey);

    if (cachedProduct) {

      console.log(
        "Cache HIT"
      );

      return cachedProduct;
    }

    console.log(
      "Cache MISS"
    );

    const product =
      await prisma.product.findFirst({
        where: {
          slug,
          isDeleted: false
        },

        include: {
          category: true,

          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },

            orderBy: {
              createdAt: "desc"
            }
          }
        }
      });

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    await setCache(
      cacheKey,
      product,
      60
    );

    return product;
};