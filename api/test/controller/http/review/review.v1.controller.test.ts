import { AccessLevel, Idp } from '@prisma/client';
import { Request, Response } from 'express';

import { Reply, Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import { ReviewService } from '@src/core/services/review/review.service';
import {
  RepliesPaginationResponse,
  ReviewsPaginationResponse
} from '@src/core/services/review/types';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';

import { Middleware } from '@controller/http/middleware';
import {
  ListRepliesV1QueryParameter,
  ListReviewsV1QueryParameter,
  ReviewV1PathParameter
} from '@controller/http/review/request/review.v1.request';
import {
  ListRepliesV1Response,
  ListReviewsV1Response
} from '@controller/http/review/response/review.v1.response';
import { ReviewV1Controller } from '@controller/http/review/review.v1.controller';

function calculateTotalPageCount(entryCount: number, pageSize?: number) {
  const givenPageSize = pageSize ?? 10;
  const additionalPageCount = entryCount % givenPageSize !== 0 ? 1 : 0;
  return Math.floor(entryCount / givenPageSize) + additionalPageCount;
}

describe('Test review v1 controller', () => {
  const middleware: Partial<Middleware> = {};
  const reviewService: Partial<ReviewService> = {
    createReview: jest.fn(),
    getReview: jest.fn(),
    getReviews: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    createReply: jest.fn(),
    getReplies: jest.fn(),
    updateReply: jest.fn(),
    deleteReply: jest.fn()
  };
  let reviewController: ReviewV1Controller;

  beforeAll(() => {
    reviewController = new ReviewV1Controller(
      middleware as Middleware,
      reviewService as ReviewService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test list reviews', () => {
    const users: User[] = [];
    const userCount = 4;
    const reviews: Review[] = [];
    const reviewCountPerUser = 4;
    const reviewCount = userCount * reviewCountPerUser;
    const movieNames: string[] = [
      'firstMovie',
      'secondMovie',
      'thirdMovie',
      'fourthMovie'
    ];
    const title = 'randomTitle';
    const content = 'randomContent';

    beforeAll(() => {
      const currentDate = new Date();
      const baseUserId = 'randomUserId';
      const baseNickname = 'randomNickname';
      const baseTag = '#TAG';

      for (let i = 1; i <= userCount; i++) {
        const userId = `${baseUserId}${i}`;

        users.push(
          new User(
            userId,
            `${baseNickname}${i}`,
            `${baseTag}${i}`,
            new IdpEnum(Idp.GOOGLE),
            `${userId}${i}@gmail.com`,
            new AccessLevelEnum(AccessLevel.USER),
            currentDate,
            currentDate
          )
        );

        for (let j = 1; j <= reviewCountPerUser; j++) {
          const baseReviewId = (i - 1) * reviewCountPerUser;

          reviews.push(
            new Review(
              baseReviewId + j,
              userId,
              title,
              movieNames[j - 1],
              content,
              0,
              currentDate,
              currentDate
            )
          );
        }
      }
    });

    it('should success when pagination and filter conditions are not specified', async () => {
      const req = {
        query: {}
      } as unknown as Request<any, any, any, ListReviewsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListReviewsV1Response>;

      const totalPageCount = calculateTotalPageCount(reviewCount);
      const pagination: ReviewsPaginationResponse = {
        sortBy: 'createdAt',
        direction: 'desc',
        pageOffset: 1,
        pageSize: 10,
        totalEntryCount: reviewCount,
        totalPageCount
      };
      reviewService.getReviews = jest.fn(() =>
        Promise.resolve({ users, reviews, pagination })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedReviewResponse = reviews.map((review) =>
        reviewController['buildReviewResponse'](
          userMapById.get(review.userId) as User,
          review
        )
      );

      await reviewController.listReviews(req, res);

      expect(reviewService.getReviews).toBeCalledTimes(1);
      expect(reviewService.getReviews).toBeCalledWith({});

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        reviews: expectedReviewResponse,
        pagination: {
          sortBy: 'createdAt',
          direction: 'desc',
          pageOffset: 1,
          pageSize: 10,
          totalEntryCount: reviewCount,
          totalPageCount
        }
      });
    });

    it('should success when only filter conditions are specified', async () => {
      const req = {
        query: {
          title,
          nickname: users[0].nickname,
          movieName: movieNames[0]
        }
      } as unknown as Request<any, any, any, ListReviewsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListReviewsV1Response>;

      const totalPageCount = calculateTotalPageCount(reviewCount);
      const pagination: ReviewsPaginationResponse = {
        sortBy: 'createdAt',
        direction: 'desc',
        pageOffset: 1,
        pageSize: 10,
        totalEntryCount: reviewCount,
        totalPageCount
      };
      reviewService.getReviews = jest.fn(() =>
        Promise.resolve({ users, reviews, pagination })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedReviewResponse = reviews.map((review) =>
        reviewController['buildReviewResponse'](
          userMapById.get(review.userId) as User,
          review
        )
      );

      await reviewController.listReviews(req, res);

      expect(reviewService.getReviews).toBeCalledTimes(1);
      expect(reviewService.getReviews).toBeCalledWith({
        title: req.query.title,
        nickname: req.query.nickname,
        movieName: req.query.movieName
      });

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        reviews: expectedReviewResponse,
        pagination: {
          sortBy: 'createdAt',
          direction: 'desc',
          pageOffset: 1,
          pageSize: 10,
          totalEntryCount: reviewCount,
          totalPageCount
        },
        filter: {
          title: req.query.title,
          nickname: req.query.nickname,
          movieName: req.query.movieName
        }
      });
    });

    it('should success when only paginaton conditions are specified', async () => {
      const givenSortBy = 'movieName';
      const givenDirection = 'asc';
      const givenPageOffset = 2;
      const givenPageSize = 5;
      const req = {
        query: {
          sortBy: givenSortBy,
          direction: givenDirection,
          pageOffset: givenPageOffset,
          pageSize: givenPageSize
        }
      } as unknown as Request<any, any, any, ListReviewsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListReviewsV1Response>;

      const totalPageCount = calculateTotalPageCount(
        reviewCount,
        givenPageSize
      );
      const pagination: ReviewsPaginationResponse = {
        sortBy: givenSortBy,
        direction: givenDirection,
        pageOffset: givenPageOffset,
        pageSize: givenPageSize,
        totalEntryCount: reviewCount,
        totalPageCount
      };
      reviewService.getReviews = jest.fn(() =>
        Promise.resolve({ users, reviews, pagination })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedReviewResponse = reviews.map((review) =>
        reviewController['buildReviewResponse'](
          userMapById.get(review.userId) as User,
          review
        )
      );

      await reviewController.listReviews(req, res);

      expect(reviewService.getReviews).toBeCalledTimes(1);
      expect(reviewService.getReviews).toBeCalledWith({
        sortBy: req.query.sortBy,
        direction: req.query.direction,
        pageOffset: req.query.pageOffset,
        pageSize: req.query.pageSize
      });

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        reviews: expectedReviewResponse,
        pagination: {
          sortBy: req.query.sortBy,
          direction: req.query.direction,
          pageOffset: req.query.pageOffset,
          pageSize: req.query.pageSize,
          totalEntryCount: reviewCount,
          totalPageCount
        }
      });
    });

    it('should fail when the reviewing user is not found', async () => {
      const req = {
        query: {}
      } as unknown as Request<any, any, any, ListReviewsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListReviewsV1Response>;

      const totalPageCount = calculateTotalPageCount(reviewCount);

      reviewService.getReviews = jest.fn(() =>
        Promise.resolve({
          users: users.splice(0, -1),
          reviews,
          pagination: {
            sortBy: 'createdAt',
            direction: 'desc',
            pageOffset: 1,
            pageSize: 10,
            totalEntryCount: reviewCount,
            totalPageCount
          }
        })
      );

      try {
        await reviewController.listReviews(req, res);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.INTERNAL_ERROR);
      }
    });
  });

  describe('Test list replies', () => {
    const users: User[] = [];
    const userCount = 3;
    const reviewId = 100;
    const replies: Reply[] = [];
    const replyCountPerUser = 3;
    const replyCount = userCount * replyCountPerUser;
    const content = 'randomContent';

    beforeAll(() => {
      const currentDate = new Date();
      const baseUserId = 'randomUserId';
      const baseNickname = 'randomNickname';
      const baseTag = '#TAG';

      for (let i = 1; i <= userCount; i++) {
        const userId = `${baseUserId}${i}`;

        users.push(
          new User(
            userId,
            `${baseNickname}${i}`,
            `${baseTag}${i}`,
            new IdpEnum(Idp.GOOGLE),
            `${userId}${i}}@gmail.com`,
            new AccessLevelEnum(AccessLevel.USER),
            currentDate,
            currentDate
          )
        );

        for (let j = 1; j <= replyCountPerUser; j++) {
          const baseReplyId = (i - 1) * replyCountPerUser;

          replies.push(
            new Reply(
              baseReplyId + j,
              reviewId,
              userId,
              content,
              currentDate,
              currentDate
            )
          );
        }
      }
    });

    it('should success when pagination and filter conditions are not specified', async () => {
      const req = {
        params: { reviewId: `${reviewId}` },
        query: {}
      } as unknown as Request<
        ReviewV1PathParameter,
        any,
        any,
        ListRepliesV1QueryParameter,
        any
      >;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListRepliesV1Response>;

      const totalPageCount = calculateTotalPageCount(replyCount);
      const pagination: RepliesPaginationResponse = {
        direction: 'desc',
        pageOffset: 1,
        pageSize: 10,
        totalEntryCount: replyCount,
        totalPageCount
      };
      reviewService.getReplies = jest.fn(() =>
        Promise.resolve({ users, replies, pagination })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedRepliesResponse = replies.map((reply) =>
        reviewController['buildReplyResponse'](
          userMapById.get(reply.userId) as User,
          reply
        )
      );

      await reviewController.listReplies(req, res);

      expect(reviewService.getReplies).toBeCalledTimes(1);
      expect(reviewService.getReplies).toBeCalledWith({ reviewId });

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        replies: expectedRepliesResponse,
        pagination: {
          direction: 'desc',
          pageOffset: 1,
          pageSize: 10,
          totalEntryCount: replyCount,
          totalPageCount
        }
      });
    });

    it('should success when paginaton conditions are specified', async () => {
      const givenDirection = 'asc';
      const givenPageOffset = 2;
      const givenPageSize = 5;
      const req = {
        params: { reviewId: `${reviewId}` },
        query: {
          direction: givenDirection,
          pageOffset: givenPageOffset,
          pageSize: givenPageSize
        }
      } as unknown as Request<
        ReviewV1PathParameter,
        any,
        any,
        ListRepliesV1QueryParameter,
        any
      >;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListRepliesV1Response>;

      const totalPageCount = calculateTotalPageCount(replyCount, givenPageSize);
      const pagination: RepliesPaginationResponse = {
        direction: givenDirection,
        pageOffset: givenPageOffset,
        pageSize: givenPageSize,
        totalEntryCount: replyCount,
        totalPageCount
      };
      reviewService.getReplies = jest.fn(() =>
        Promise.resolve({ users, replies, pagination })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedRepliesResponse = replies.map((reply) =>
        reviewController['buildReplyResponse'](
          userMapById.get(reply.userId) as User,
          reply
        )
      );

      await reviewController.listReplies(req, res);

      expect(reviewService.getReplies).toBeCalledTimes(1);
      expect(reviewService.getReplies).toBeCalledWith({
        reviewId,
        direction: req.query.direction,
        pageOffset: req.query.pageOffset,
        pageSize: req.query.pageSize
      });

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        replies: expectedRepliesResponse,
        pagination: {
          direction: req.query.direction,
          pageOffset: req.query.pageOffset,
          pageSize: req.query.pageSize,
          totalEntryCount: replyCount,
          totalPageCount
        }
      });
    });

    it('should fail when the reviewing user is not found', async () => {
      const req = {
        params: { reviewId: `${reviewId}` },
        query: {}
      } as unknown as Request<
        ReviewV1PathParameter,
        any,
        any,
        ListRepliesV1QueryParameter,
        any
      >;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListRepliesV1Response>;

      const totalPageCount = calculateTotalPageCount(replyCount);
      reviewService.getReplies = jest.fn(() =>
        Promise.resolve({
          users: users.splice(0, -1),
          replies,
          pagination: {
            direction: 'desc',
            pageOffset: 1,
            pageSize: 10,
            totalEntryCount: replyCount,
            totalPageCount
          }
        })
      );

      try {
        await reviewController.listReplies(req, res);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.INTERNAL_ERROR);
      }
    });
  });
});
