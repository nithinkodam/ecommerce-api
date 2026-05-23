import prisma from "../config/prisma";

import {
  CreateReviewDto
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

  return result;
};