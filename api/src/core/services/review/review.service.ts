import { AccessLevel } from '@prisma/client';

import { Reply, Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import {
  CreateReplyParams,
  FindRepliesParams,
  ReplyRepository,
  UpdateReplyParams
} from '@src/core/ports/reply.repository';
import {
  CreateReviewParams,
  FindReviewsParams,
  ReviewRepository,
  UpdateReviewParams
} from '@src/core/ports/review.repository';
import {
  TransactionClient,
  TransactionManager
} from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import {
  CreateReplyDto,
  CreateReplyResponse,
  CreateReviewDto,
  CreateReviewResponse,
  DeleteReplyDto,
  DeleteReviewDto,
  GetRepliesDto,
  GetRepliesResponse,
  GetReviewResponse,
  GetReviewsDto,
  GetReviewsResponse,
  UpdateReplyDto,
  UpdateReplyResponse,
  UpdateReviewDto,
  UpdateReviewResponse
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

  public updateReview = async (
    dto: UpdateReviewDto
  ): Promise<UpdateReviewResponse> => {
    const [user, review] = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<[User, Review]> => {
        const reviewToUpdate = await this.reviewRepository.findById(
          dto.reviewId,
          txClient
        );
        const userReviewing = await this.userRepository.findById(
          reviewToUpdate.userId,
          txClient
        );

        if (
          !dto.requesterIdToken.isAccessLevelAndUserIdAuthorized(
            new AccessLevelEnum(AccessLevel.DEVELOPER),
            userReviewing.id
          )
        ) {
          throw new CustomError({
            code: AppErrorCode.PERMISSIION_DENIED,
            message: 'insufficient access level to update review',
            context: { dto, review: reviewToUpdate, user: userReviewing }
          });
        }

        const params: UpdateReviewParams = {
          id: dto.reviewId,
          title: dto.title,
          movieName: dto.movieName,
          content: dto.content
        };
        const reviewUpdated = await this.reviewRepository.update(
          params,
          txClient
        );

        return [userReviewing, reviewUpdated];
      },
      IsolationLevel.READ_COMMITTED
    );

    return {
      user,
      review
    };
  };

  public deleteReview = async (dto: DeleteReviewDto): Promise<null> => {
    return await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<null> => {
        const reviewToDelete = await this.reviewRepository.findById(
          dto.reviewId,
          txClient
        );
        const userReviewing = await this.userRepository.findById(
          reviewToDelete.userId,
          txClient
        );

        if (
          !dto.requesterIdToken.isAccessLevelAndUserIdAuthorized(
            new AccessLevelEnum(AccessLevel.DEVELOPER),
            userReviewing.id
          )
        ) {
          throw new CustomError({
            code: AppErrorCode.PERMISSIION_DENIED,
            message: 'insufficient access level to delete review',
            context: { dto, review: reviewToDelete, user: userReviewing }
          });
        }

        await this.reviewRepository.deleteById(dto.reviewId, txClient);

        return null;
      },
      IsolationLevel.READ_COMMITTED
    );
  };

  public createReply = async (
    dto: CreateReplyDto
  ): Promise<CreateReplyResponse> => {
    const [user, reply] = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<[User, Reply]> => {
        const userReplying = await this.userRepository.findById(
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
            message: 'insufficient access level to create reply',
            context: { dto, user: userReplying }
          });
        }

        const params: CreateReplyParams = {
          reviewId: dto.reviewId,
          userId: dto.requesterIdToken.userId,
          content: dto.content
        };
        const replyCreated = await this.replyRepository.create(
          params,
          txClient
        );

        return [userReplying, replyCreated];
      },
      IsolationLevel.READ_COMMITTED
    );

    return {
      user,
      reply
    };
  };

  public getReplies = async (
    dto: GetRepliesDto
  ): Promise<GetRepliesResponse> => {
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

    const [users, replies, replyCount] = await this.txManager.runInTransaction(
      async (
        txClient: TransactionClient
      ): Promise<[User[], Reply[], number]> => {
        const params: FindRepliesParams = {
          reviewId: dto.reviewId,
          direction,
          pageOffset,
          pageSize
        };
        const { replies, replyCount } =
          await this.replyRepository.findManyAndCount(params, txClient);

        const userIds = this.extractUserIds(replies);
        const users = await this.userRepository.findByIds(userIds, txClient);

        return [users, replies, replyCount];
      },
      IsolationLevel.READ_COMMITTED
    );

    const additionalPageCount = replyCount % pageSize !== 0 ? 1 : 0;
    const totalPageCount =
      Math.floor(replyCount / pageSize) + additionalPageCount;
    const pagination = {
      direction,
      pageOffset,
      pageSize,
      totalEntryCount: replyCount,
      totalPageCount
    };

    return {
      users,
      replies,
      pagination
    };
  };

  public updateReply = async (
    dto: UpdateReplyDto
  ): Promise<UpdateReplyResponse> => {
    const [user, reply] = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<[User, Reply]> => {
        const replyToUpdate = await this.replyRepository.findById(
          dto.replyId,
          txClient
        );
        const userReplying = await this.userRepository.findById(
          replyToUpdate.userId,
          txClient
        );

        if (
          !dto.requesterIdToken.isAccessLevelAndUserIdAuthorized(
            new AccessLevelEnum(AccessLevel.DEVELOPER),
            userReplying.id
          )
        ) {
          throw new CustomError({
            code: AppErrorCode.PERMISSIION_DENIED,
            message: 'insufficient access level to update reply',
            context: { dto, reply: replyToUpdate, user: userReplying }
          });
        }

        const params: UpdateReplyParams = {
          id: dto.replyId,
          content: dto.content
        };
        const replyUpdated = await this.replyRepository.update(
          params,
          txClient
        );

        return [userReplying, replyUpdated];
      },
      IsolationLevel.READ_COMMITTED
    );

    return {
      user,
      reply
    };
  };

  public deleteReply = async (dto: DeleteReplyDto): Promise<null> => {
    return await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<null> => {
        const replyToDelete = await this.replyRepository.findById(
          dto.replyId,
          txClient
        );
        const userReplying = await this.userRepository.findById(
          replyToDelete.userId,
          txClient
        );

        if (
          !dto.requesterIdToken.isAccessLevelAndUserIdAuthorized(
            new AccessLevelEnum(AccessLevel.DEVELOPER),
            userReplying.id
          )
        ) {
          throw new CustomError({
            code: AppErrorCode.PERMISSIION_DENIED,
            message: 'insufficient access level to delete reply',
            context: { dto, reply: replyToDelete, user: userReplying }
          });
        }

        await this.replyRepository.deleteById(dto.replyId);

        return null;
      },
      IsolationLevel.READ_COMMITTED
    );
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
