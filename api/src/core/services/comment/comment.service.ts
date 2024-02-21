import { AccessLevel } from '@prisma/client';

import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';
import {
  CommentRepository,
  CreateCommentParams,
  FindCommentsParams,
  UpdateCommentParams
} from '@src/core/ports/comment.repository';
import {
  TransactionClient,
  TransactionManager
} from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import {
  CreateCommentDto,
  CreateCommentResponse,
  GetCommentsDto,
  GetCommentsResponse,
  UpdateCommentDto,
  UpdateCommentResponse
} from '@src/core/services/comment/types';
import { AccessLevelEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { IsolationLevel } from '@src/infrastructure/repositories/types';

export class CommentService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly commentRepository: CommentRepository,
    private readonly txManager: TransactionManager
  ) {}

  public createComment = async (
    dto: CreateCommentDto
  ): Promise<CreateCommentResponse> => {
    const [user, comment] = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<[User, Comment]> => {
        const userCommenting = await this.userRepository.findById(
          dto.requesterIdToken.userId,
          txClient
        );

        if (
          !dto.requesterIdToken.isAccessLevelAuthorized(
            new AccessLevelEnum(AccessLevel.USER)
          )
        ) {
          throw new CustomError({
            code: AppErrorCode.PERMISSIION_DENIED,
            message: 'insufficient access level to create comment',
            context: { dto, user: userCommenting }
          });
        }

        const params: CreateCommentParams = {
          userId: dto.requesterIdToken.userId,
          movieName: dto.movieName,
          content: dto.content
        };
        const commentCreated = await this.commentRepository.create(
          params,
          txClient
        );

        return [userCommenting, commentCreated];
      },
      IsolationLevel.READ_COMMITTED
    );

    return {
      user,
      comment
    };
  };

  public getComments = async (
    dto: GetCommentsDto
  ): Promise<GetCommentsResponse> => {
    const pageSize = dto.pageSize ?? 10;

    if (!(pageSize >= 1 && pageSize <= 100)) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        message: 'page size should be between 1 and 100',
        context: { pageSize }
      });
    }

    const [users, comments, commentCount] =
      await this.txManager.runInTransaction(
        async (
          txClient: TransactionClient
        ): Promise<[User[], Comment[], number]> => {
          const params: FindCommentsParams = {
            nickname: dto.nickname,
            movieName: dto.movieName,
            sortBy: dto.sortBy ?? 'createdAt',
            direction: dto.direction ?? 'desc',
            pageOffset: dto.pageOffset ?? 1,
            pageSize
          };
          const { comments, commentCount } =
            await this.commentRepository.findManyAndCount(params, txClient);

          const userIds = this.extractUserIds(comments);
          const users = await this.userRepository.findByIds(userIds, txClient);

          return [users, comments, commentCount];
        },
        IsolationLevel.READ_COMMITTED
      );

    const additionalPageCount = commentCount % pageSize !== 0 ? 1 : 0;
    const totalPageCount =
      Math.floor(commentCount / pageSize) + additionalPageCount;

    return {
      users,
      comments,
      totalPageCount
    };
  };

  public updateComment = async (
    dto: UpdateCommentDto
  ): Promise<UpdateCommentResponse> => {
    const [user, comment] = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<[User, Comment]> => {
        const commentToUpdate = await this.commentRepository.findById(
          dto.commentId,
          txClient
        );
        const userCommenting = await this.userRepository.findById(
          commentToUpdate.userId,
          txClient
        );

        if (
          !dto.requesterIdToken.isAccessLevelAndUserIdAuthorized(
            new AccessLevelEnum(AccessLevel.DEVELOPER),
            userCommenting.id
          )
        ) {
          throw new CustomError({
            code: AppErrorCode.PERMISSIION_DENIED,
            message: 'insufficient access level to update comment',
            context: { dto, comment: commentToUpdate, user: userCommenting }
          });
        }

        const params: UpdateCommentParams = {
          id: dto.commentId,
          movieName: dto.movieName,
          content: dto.content
        };
        const commentUpdated = await this.commentRepository.update(
          params,
          txClient
        );

        return [userCommenting, commentUpdated];
      },
      IsolationLevel.READ_COMMITTED
    );

    return {
      user,
      comment
    };
  };

  private extractUserIds = (comments: Comment[]): string[] => {
    const userIds = comments.map((comment) => {
      return comment.userId;
    });
    const uniqueUserIds = [...new Set(userIds)];

    return uniqueUserIds;
  };
}
