import { Prisma } from '@prisma/client';

import { Comment } from '@src/core/entities/comment.entity';
import {
  CommentRepository,
  CreateCommentParams,
  FindCommentsParams,
  FindManyAndCountResponse,
  UpdateCommentParams
} from '@src/core/ports/comment.repository';
import { Direction, SortBy } from '@src/core/services/comment/types';
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

export class PostgresqlCommentRepository implements Partial<CommentRepository> {
  constructor(private readonly client: ExtendedPrismaClient) {}

  public create = async (
    params: CreateCommentParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Comment> => {
    const createdAt = new Date();

    try {
      const client = txClient ?? this.client;
      const comment = await client.comment.create({
        data: {
          userId: params.userId,
          movieName: params.movieName,
          content: params.content,
          createdAt,
          updatedAt: createdAt
        }
      });
      return comment.convertToEntity();
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to create comment',
        context: { params }
      });
    }
  };

  public findById = async (
    id: number,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Comment> => {
    try {
      const client = txClient ?? this.client;
      const comment = await client.comment.findFirstOrThrow({ where: { id } });
      return comment.convertToEntity();
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'comment not found',
          context: { id }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to find comment by ID',
        context: { id }
      });
    }
  };

  public findManyAndCount = async (
    params: FindCommentsParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<FindManyAndCountResponse> => {
    try {
      const client = txClient ?? this.client;
      const args: Prisma.CommentFindManyArgs = {
        skip: (params.pageOffset - 1) * params.pageSize,
        take: params.pageSize,
        where: {
          AND: [
            {
              user: { nickname: { contains: params.nickname } }
            },
            {
              movieName: { contains: params.movieName, mode: 'insensitive' }
            }
          ]
        },
        orderBy: this.convertToOrderBy(params)
      };

      const commentResults = await client.comment.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: args.orderBy
      });
      const commentCount = await client.comment.count({
        where: args.where
      });

      const comments = commentResults.map((commentResult) =>
        commentResult.convertToEntity()
      );

      return {
        comments,
        commentCount
      };
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        message: 'failed to find comments and count',
        cause: error,
        context: { params }
      });
    }
  };

  public update = async (
    params: UpdateCommentParams,
    txClient?: ExtendedPrismaTransactionClient
  ): Promise<Comment> => {
    const updatedAt = new Date();

    try {
      const client = txClient ?? this.client;
      const commentUpdated = await client.comment.update({
        where: { id: params.id },
        data: {
          movieName: params.movieName,
          content: params.content,
          updatedAt
        }
      });
      return commentUpdated.convertToEntity();
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          cause: error,
          message: 'comment not found for update',
          context: { params }
        });
      }
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to update comment',
        context: { params }
      });
    }
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
