import { AccessLevel } from '@prisma/client';

import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';
import {
  CommentRepository,
  CreateCommentParams
} from '@src/core/ports/comment.repository';
import {
  TransactionClient,
  TransactionManager
} from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import {
  CreateCommentDto,
  CreateCommentResponse
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
}
