import { AccessLevel } from '@prisma/client';

import { Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import { ReplyRepository } from '@src/core/ports/reply.repository';
import {
  CreateReviewParams,
  ReviewRepository
} from '@src/core/ports/review.repository';
import {
  TransactionClient,
  TransactionManager
} from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import {
  CreateReviewDto,
  CreateReviewResponse
} from '@src/core/services/review/types';
import { AccessLevelEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { IsolationLevel } from '@src/infrastructure/repositories/types';

export class ReviewService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly replyRepository: ReplyRepository,
    private readonly txManager: TransactionManager
  ) {}

  public createReview = async (
    dto: CreateReviewDto
  ): Promise<CreateReviewResponse> => {
    const [user, review] = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<[User, Review]> => {
        const userReviewing = await this.userRepository.findById(
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
            message: 'insufficient access level to create review',
            context: { dto, user: userReviewing }
          });
        }

        const params: CreateReviewParams = {
          userId: dto.requesterIdToken.userId,
          title: dto.title,
          movieName: dto.movieName,
          content: dto.content
        };
        const reviewCreated = await this.reviewRepository.create(
          params,
          txClient
        );

        return [userReviewing, reviewCreated];
      },
      IsolationLevel.READ_COMMITTED
    );

    return {
      user,
      review
    };
  };
}
