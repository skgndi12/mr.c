import { Reply } from '@src/core/entities/review.entity';
import {
  CreateReplyParams,
  ReplyRepository
} from '@src/core/ports/reply.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  PrismaErrorCode,
  isErrorWithCode
} from '@src/infrastructure/prisma/errors';
import {
  ExtendedPrismaClient,
  ExtendedPrismaTransactionClient
} from '@src/infrastructure/prisma/types';

export class PostgresqlReplyRepository implements Partial<ReplyRepository> {
  constructor(private readonly client: ExtendedPrismaClient) {}

  public create = async (
    params: CreateReplyParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Reply> => {
    const createdAt = new Date();
    try {
      const client = txClient ?? this.client;
      const reply = await client.reply.create({
        data: {
          reviewId: params.reviewId,
          userId: params.userId,
          content: params.content,
          createdAt,
          updatedAt: createdAt
        }
      });

      return reply.convertToEntity();
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to create reply',
        context: { params }
      });
    }
  };

  public findById = async (
    id: number,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Reply> => {
    try {
      const client = txClient ?? this.client;
      const reply = await client.reply.findFirstOrThrow({ where: { id } });

      return reply.convertToEntity();
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'reply not found',
          context: { id }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to find reply by ID',
        context: { id }
      });
    }
  };
}
