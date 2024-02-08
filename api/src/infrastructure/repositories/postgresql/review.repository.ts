import { Prisma } from '@prisma/client';

import { Review } from '@src/core/entities/review.entity';
import {
  CreateReviewParams,
  FindManyAndCountResponse,
  FindReviewsParams,
  ReviewRepository,
  UpdateReviewParams
} from '@src/core/ports/review.repository';
import { Direction, SortBy } from '@src/core/services/review/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  PrismaErrorCode,
  isErrorWithCode
} from '@src/infrastructure/prisma/errors';
import {
  ExtendedPrismaClient,
  ExtendedPrismaTransactionClient
} from '@src/infrastructure/prisma/types';

type OrderBy =
  | {
      movieName: Direction;
    }
  | { createdAt: Direction };

type SortingCriteria = {
  sortBy: SortBy;
  direction: Direction;
};

export class PostgresqlReviewRepository implements ReviewRepository {
  constructor(private readonly client: ExtendedPrismaClient) {}

  public create = async (
    params: CreateReviewParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Review> => {
    const createdAt = new Date();
    try {
      const client = txClient ?? this.client;
      const review = await client.review.create({
        data: {
          userId: params.userId,
          title: params.title,
          movieName: params.movieName,
          content: params.content,
          createdAt,
          updatedAt: createdAt
        }
      });

      return this.convertToEntity(
        review.id,
        review.userId,
        review.title,
        review.movieName,
        review.content,
        0,
        review.createdAt,
        review.updatedAt
      );
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to create review',
        context: { params }
      });
    }
  };

  public findById = async (
    id: number,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Review> => {
    try {
      const client = txClient ?? this.client;
      const review = await client.review.findFirstOrThrow({
        where: { id },
        include: {
          _count: {
            select: { Reply: true }
          }
        }
      });

      return this.convertToEntity(
        review.id,
        review.userId,
        review.title,
        review.movieName,
        review.content,
        review._count.Reply,
        review.createdAt,
        review.updatedAt
      );
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'review not found',
          context: { id }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to find review by ID',
        context: { id }
      });
    }
  };

  public findManyAndCount = async (
    params: FindReviewsParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<FindManyAndCountResponse> => {
    try {
      const client = txClient ?? this.client;
      const args: Prisma.ReviewFindManyArgs = {
        skip: (params.pageOffset - 1) * params.pageSize,
        take: params.pageSize,
        where: {
          AND: [
            { user: { nickname: { contains: params.nickname } } },
            { title: { contains: params.title, mode: 'insensitive' } },
            {
              movieName: { contains: params.movieName, mode: 'insensitive' }
            }
          ]
        },
        orderBy: this.convertToOrderBy(params)
      };

      const reviewResults = await client.review.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        include: {
          _count: {
            select: { Reply: true }
          }
        },
        orderBy: args.orderBy
      });
      const reviewCount = await client.review.count({ where: args.where });

      const reviews = reviewResults.map((review) =>
        this.convertToEntity(
          review.id,
          review.userId,
          review.title,
          review.movieName,
          review.content,
          review._count.Reply,
          review.createdAt,
          review.updatedAt
        )
      );

      return {
        reviews,
        reviewCount
      };
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to find many reviews and count',
        context: { params }
      });
    }
  };

  public update = async (
    params: UpdateReviewParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Review> => {
    const updatedAt = new Date();
    try {
      const client = txClient ?? this.client;
      const reviewUpdated = await client.review.update({
        where: { id: params.id },
        data: {
          title: params.title,
          movieName: params.movieName,
          content: params.content,
          updatedAt
        },
        include: {
          _count: {
            select: { Reply: true }
          }
        }
      });

      return this.convertToEntity(
        reviewUpdated.id,
        reviewUpdated.userId,
        reviewUpdated.title,
        reviewUpdated.movieName,
        reviewUpdated.content,
        reviewUpdated._count.Reply,
        reviewUpdated.createdAt,
        reviewUpdated.updatedAt
      );
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'review not found for update',
          context: { params }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to update review',
        context: { params }
      });
    }
  };

  public deleteById = async (
    id: number,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<void> => {
    try {
      const client = txClient ?? this.client;
      await client.review.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'review not found for deletion',
          context: { id }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to delete review by ID',
        context: { id }
      });
    }
  };

  private convertToEntity = (
    id: number,
    userId: string,
    title: string,
    movieName: string,
    content: string,
    replyCount: number,
    createdAt: Date,
    updatedAt: Date
  ): Review => {
    return new Review(
      id,
      userId,
      title,
      movieName,
      content,
      replyCount,
      createdAt,
      updatedAt
    );
  };

  private convertToOrderBy = (criteria: SortingCriteria): OrderBy => {
    switch (criteria.sortBy) {
      case 'movieName':
        return {
          movieName: criteria.direction
        };
      case 'createdAt':
        return {
          createdAt: criteria.direction
        };
    }
  };
}
