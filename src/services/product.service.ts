import prisma from "../config/prisma";

import { CreateProductDto } from "../validators/product.validator";

export const createProduct = async (
  data: CreateProductDto
) => {
  const existingProduct =
    await prisma.product.findUnique({
      where: {
        slug: data.slug
      }
    });

  if (existingProduct) {
    throw new Error(
      "Product slug already exists"
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
      data
    });

  return product;
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

export const getProductBySlug = async (
  slug: string
) => {
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

  return product;
};