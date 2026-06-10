import prisma from "../config/prisma";
import { deleteCache } from "../utils/cache";

import {
  CreateReviewDto,
  UpdateReviewDto
} from "../validators/review.validator";

export const createReview = async (
  userId: string,
  slug: string,
  data: CreateReviewDto
) => {

  const product =
    await prisma.product.findUnique({
      where: {
        slug
      }
    });

  if (!product || product.isDeleted) {
    throw new Error(
      "Product not found"
    );
  }

  const productId = product.id;

  const purchased =
    await prisma.order.findFirst({
      where: {
        userId,

        status: "DELIVERED",

        items: {
          some: {
            productId
          }
        }
      }
    });

  if (!purchased) {
    throw new Error(
      "Only verified purchasers can review this product"
    );
  }

  const existingReview =
    await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

  if (existingReview) {
    throw new Error(
      "You already reviewed this product"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {

        await tx.review.create({
          data: {
            userId,
            productId,
            rating: data.rating,
            comment: data.comment
          }
        });

        const aggregates =
          await tx.review.aggregate({
            where: {
              productId
            },

            _avg: {
              rating: true
            },

            _count: true
          });

        await tx.product.update({
          where: {
            id: productId
          },

          data: {
            averageRating:
              aggregates._avg.rating || 0,

            reviewCount:
              aggregates._count
          }
        });

        return {
          averageRating:
            aggregates._avg.rating,

          reviewCount:
            aggregates._count
        };
      }
    );

    await deleteCache(
      `product:${slug}`
    );

  return result;
};

export const getReviewsByProductSlug =
  async (slug: string) => {

    const product =
      await prisma.product.findUnique({
        where: {
          slug
        }
      });

    if (
      !product ||
      product.isDeleted
    ) {
      throw new Error(
        "Product not found"
      );
    }

    const reviews =
      await prisma.review.findMany({
        where: {
          productId: product.id
        },

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
      });

    return reviews;
};

export const updateReview =
  async (
    userId: string,
    reviewId: string,
    data: UpdateReviewDto
  ) => {

    const review =
      await prisma.review.findUnique({
        where: {
          id: reviewId
        }
      });

    if (!review) {
      throw new Error(
        "Review not found"
      );
    }

    if (
      review.userId !== userId
    ) {
      throw new Error(
        "Unauthorized"
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {

          await tx.review.update({
            where: {
              id: reviewId
            },

            data
          });

          const aggregates =
            await tx.review.aggregate({
              where: {
                productId:
                  review.productId
              },

              _avg: {
                rating: true
              },

              _count: true
            });

          await tx.product.update({
            where: {
              id:
                review.productId
            },

            data: {
              averageRating:
                aggregates._avg.rating || 0,

              reviewCount:
                aggregates._count
            }
          });

          return aggregates;
        }
      );

      const product =
        await prisma.product.findUnique({
          where: {
            id: review.productId
          }
        });
      
      if (product) {
        await deleteCache(
          `product:${product.slug}`
        );
      }

    return result;
};

export const deleteReview =
  async (
    userId: string,
    reviewId: string
  ) => {

    const review =
      await prisma.review.findUnique({
        where: {
          id: reviewId
        }
      });

    if (!review) {
      throw new Error(
        "Review not found"
      );
    }

    if (
      review.userId !== userId
    ) {
      throw new Error(
        "Unauthorized"
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {

          await tx.review.delete({
            where: {
              id: reviewId
            }
          });

          const aggregates =
            await tx.review.aggregate({
              where: {
                productId:
                  review.productId
              },

              _avg: {
                rating: true
              },

              _count: true
            });

          await tx.product.update({
            where: {
              id:
                review.productId
            },

            data: {
              averageRating:
                aggregates._avg.rating || 0,

              reviewCount:
                aggregates._count
            }
          });

          return {
            averageRating:
              aggregates._avg.rating || 0,

            reviewCount:
              aggregates._count
          };
        }
      );

    const product =
        await prisma.product.findUnique({
          where: {
            id: review.productId
          }
        });
      
      if (product) {
        await deleteCache(
          `product:${product.slug}`
        );
      }

    return result;
};