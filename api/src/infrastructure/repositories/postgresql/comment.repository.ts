import { Comment } from '@src/core/entities/comment.entity';
import {
  CommentRepository,
  CreateCommentParams
} from '@src/core/ports/comment.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  ExtendedPrismaClient,
  ExtendedPrismaTransactionClient
} from '@src/infrastructure/prisma/types';

// TODO: Remove "Partial" once all methods in the comment repository are implemented.
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
        message: 'failed to create comment',
        context: { params }
      });
    }
  };
}
