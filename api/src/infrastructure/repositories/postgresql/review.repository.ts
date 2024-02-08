import { Review } from '@src/core/entities/review.entity';
import {
  CreateReviewParams,
  ReviewRepository
} from '@src/core/ports/review.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  ExtendedPrismaClient,
  ExtendedPrismaTransactionClient
} from '@src/infrastructure/prisma/types';

export class PostgresqlReviewRepository implements Partial<ReviewRepository> {
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
}
