import { Prisma } from '@prisma/client';

import { Reply } from '@src/core/entities/review.entity';
import {
  CreateReplyParams,
  FindManyAndCountResponse,
  FindRepliesParams,
  ReplyRepository,
  UpdateReplyParams
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

export class PostgresqlReplyRepository implements ReplyRepository {
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

  public findManyAndCount = async (
    params: FindRepliesParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<FindManyAndCountResponse> => {
    try {
      const client = txClient ?? this.client;
      const args: Prisma.ReplyFindManyArgs = {
        skip: (params.pageOffset - 1) * params.pageSize,
        take: params.pageSize,
        where: { reviewId: params.reviewId },
        orderBy: {
          createdAt: params.direction
        }
      };

      const replyResults = await client.reply.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: args.orderBy
      });
      const replyCount = await client.reply.count({ where: args.where });
      const replies = replyResults.map((reply) => reply.convertToEntity());

      return {
        replies,
        replyCount
      };
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to find replies and count',
        context: { params }
      });
    }
  };

  public update = async (
    params: UpdateReplyParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Reply> => {
    const updatedAt = new Date();
    try {
      const client = txClient ?? this.client;
      const replyUpdated = await client.reply.update({
        where: { id: params.id },
        data: {
          content: params.content,
          updatedAt
        }
      });

      return replyUpdated.convertToEntity();
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'reply not found for deletion',
          context: { params }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to update reply',
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
      await client.reply.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'reply not found for deletion',
          context: { id }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to delete reply by ID',
        context: { id }
      });
    }
  };
}
