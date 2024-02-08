import { AccessLevel } from '@prisma/client';

import { Reply, Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import { ReplyRepository } from '@src/core/ports/reply.repository';
import {
  CreateReviewParams,
  FindReviewsParams,
  ReviewRepository
} from '@src/core/ports/review.repository';
import {
  TransactionClient,
  TransactionManager
} from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import {
  CreateReviewDto,
  CreateReviewResponse,
  GetReviewResponse,
  GetReviewsDto,
  GetReviewsResponse
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

  public getReview = async (id: number): Promise<GetReviewResponse> => {
    const [user, review] = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<[User, Review]> => {
        const review = await this.reviewRepository.findById(id, txClient);
        const userReviewing = await this.userRepository.findById(
          review.userId,
          txClient
        );

        return [userReviewing, review];
      },
      IsolationLevel.READ_COMMITTED
    );

    return {
      user,
      review
    };
  };

  public getReviews = async (
    dto: GetReviewsDto
  ): Promise<GetReviewsResponse> => {
    const sortBy = dto.sortBy ?? 'createdAt';
    const direction = dto.direction ?? 'desc';
    const pageOffset = dto.pageOffset ?? 1;
    const pageSize = dto.pageSize ?? 10;

    if (!(pageSize >= 1 && pageSize <= 100)) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        message: 'page size should be between 1 and 100',
        context: { pageSize }
      });
    }

    const [users, reviews, reviewCount] = await this.txManager.runInTransaction(
      async (
        txClient: TransactionClient
      ): Promise<[User[], Review[], number]> => {
        const params: FindReviewsParams = {
          nickname: dto.nickname,
          title: dto.title,
          movieName: dto.movieName,
          sortBy,
          direction,
          pageOffset,
          pageSize
        };
        const { reviews, reviewCount } =
          await this.reviewRepository.findManyAndCount(params, txClient);

        const userIds = this.extractUserIds(reviews);
        const users = await this.userRepository.findByIds(userIds, txClient);

        return [users, reviews, reviewCount];
      },
      IsolationLevel.READ_COMMITTED
    );

    const additionalPageCount = reviewCount % pageSize !== 0 ? 1 : 0;
    const totalPageCount =
      Math.floor(reviewCount / pageSize) + additionalPageCount;
    const pagination = {
      sortBy,
      direction,
      pageOffset,
      pageSize,
      totalEntryCount: reviewCount,
      totalPageCount
    };

    return {
      users,
      reviews,
      pagination
    };
  };

  private extractUserIds = (entries: Review[] | Reply[]): string[] => {
    const userIds: string[] = [];
    entries.forEach((entry) => {
      userIds.push(entry.userId);
    });
    const uniqueUserIds = [...new Set(userIds)];

    return uniqueUserIds;
  };
}
