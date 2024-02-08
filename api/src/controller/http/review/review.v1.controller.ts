import { Request, Response, Router } from 'express';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { Reply, Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import { ReviewService } from '@src/core/services/review/review.service';
import {
  CreateReplyDto,
  CreateReviewDto,
  DeleteReplyDto,
  DeleteReviewDto,
  GetRepliesDto,
  GetReviewsDto,
  UpdateReplyDto,
  UpdateReviewDto
} from '@src/core/services/review/types';
import { AppErrorCode, CustomError } from '@src/error/errors';

import { methodNotAllowed } from '@controller/http/handler';
import { Middleware } from '@controller/http/middleware';
import {
  CreateReplyV1Request,
  CreateReviewV1Request,
  ListRepliesV1QueryParameter,
  ListReviewsV1QueryParameter,
  ReplyV1PathParameter,
  ReviewV1PathParameter,
  UpdateReplyV1Request,
  UpdateReviewV1Request
} from '@controller/http/review/request/review.v1.request';
import {
  CreateReplyV1Response,
  CreateReviewV1Response,
  DeleteReplyV1Response,
  DeleteReviewV1Response,
  GetReviewV1Response,
  ListRepliesV1Response,
  ListReviewsV1Response,
  ReplyV1Response,
  ReviewV1FilterType,
  ReviewV1Response,
  UpdateReplyV1Response,
  UpdateReviewV1Response
} from '@controller/http/review/response/review.v1.response';

export class ReviewV1Controller {
  constructor(
    private readonly middleware: Middleware,
    private readonly service: ReviewService
  ) {}

  public routes = (): Router => {
    const router: Router = Router();
    const prefix = '/v1/reviews';

    router
      .route(`${prefix}/:reviewId(\\d+)/replies/:replyId(\\d+)`)
      .all(this.middleware.issuePassport)
      .put(this.updateReply)
      .delete(this.deleteReply)
      .all(methodNotAllowed);

    router
      .route(`${prefix}/:reviewId(\\d+)/replies`)
      .get(this.listReplies)
      .all(this.middleware.issuePassport)
      .post(this.createReply)
      .all(methodNotAllowed);

    router
      .route(`${prefix}/:reviewId(\\d+)`)
      .get(this.getReview)
      .all(this.middleware.issuePassport)
      .put(this.updateReview)
      .delete(this.deleteReview)
      .all(methodNotAllowed);

    router
      .route(`${prefix}`)
      .get(this.listReviews)
      .all(this.middleware.issuePassport)
      .post(this.createReview)
      .all(methodNotAllowed);

    return router;
  };

  public createReview = async (
    req: Request<any, any, any, CreateReviewV1Request, AppIdToken>,
    res: Response<CreateReviewV1Response>
  ) => {
    const dto: CreateReviewDto = {
      requesterIdToken: res.locals.passport,
      title: req.body.title,
      movieName: req.body.movieName,
      content: req.body.content
    };
    const { user, review } = await this.service.createReview(dto);

    res.send({ review: this.buildReviewResponse(user, review) });
  };

  public getReview = async (
    req: Request<ReviewV1PathParameter, any, any, any, any>,
    res: Response<GetReviewV1Response>
  ) => {
    const { user, review } = await this.service.getReview(
      parseInt(req.params.reviewId)
    );

    res.send({ review: this.buildReviewResponse(user, review) });
  };

  public listReviews = async (
    req: Request<any, any, any, ListReviewsV1QueryParameter, any>,
    res: Response<ListReviewsV1Response>
  ) => {
    const dto: GetReviewsDto = {
      nickname: req.query.nickname,
      title: req.query.title,
      movieName: req.query.movieName,
      sortBy: req.query.sortBy,
      direction: req.query.direction,
      pageOffset: req.query.pageOffset,
      pageSize: req.query.pageSize
    };
    const { users, reviews, pagination } = await this.service.getReviews(dto);

    let filter: ReviewV1FilterType | undefined = {
      nickname: req.query.nickname,
      title: req.query.title,
      movieName: req.query.movieName
    };

    const isFilterEmpty = Object.values(filter).every(
      (value) => value === undefined
    );

    filter = isFilterEmpty ? undefined : filter;

    const userMapById = users.reduce(
      (acc, user) => acc.set(user.id, user),
      new Map<string, User>()
    );
    const reviewsResponse = reviews.map((review) => {
      const userReviewing = userMapById.get(review.userId);

      if (userReviewing === undefined) {
        throw new CustomError({
          code: AppErrorCode.INTERNAL_ERROR,
          message: 'reviewing user not found',
          context: { review }
        });
      }

      return this.buildReviewResponse(userReviewing, review);
    });

    res.send({ reviews: reviewsResponse, pagination, filter });
  };

  public updateReview = async (
    req: Request<
      ReviewV1PathParameter,
      any,
      UpdateReviewV1Request,
      any,
      AppIdToken
    >,
    res: Response<UpdateReviewV1Response>
  ) => {
    const dto: UpdateReviewDto = {
      requesterIdToken: res.locals.passport,
      reviewId: parseInt(req.params.reviewId),
      title: req.body.title,
      movieName: req.body.movieName,
      content: req.body.content
    };
    const { user, review } = await this.service.updateReview(dto);

    res.send({
      review: this.buildReviewResponse(user, review)
    });
  };

  public deleteReview = async (
    req: Request<ReviewV1PathParameter, any, any, any, AppIdToken>,
    res: Response<DeleteReviewV1Response>
  ) => {
    const dto: DeleteReviewDto = {
      requesterIdToken: res.locals.passport,
      reviewId: parseInt(req.params.reviewId)
    };
    await this.service.deleteReview(dto);

    res.send();
  };

  public createReply = async (
    req: Request<
      ReviewV1PathParameter,
      any,
      any,
      CreateReplyV1Request,
      AppIdToken
    >,
    res: Response<CreateReplyV1Response>
  ) => {
    const dto: CreateReplyDto = {
      requesterIdToken: res.locals.passport,
      reviewId: parseInt(req.params.reviewId),
      content: req.body.content
    };
    const { user, reply } = await this.service.createReply(dto);

    res.send({ reply: this.buildReplyResponse(user, reply) });
  };

  public listReplies = async (
    req: Request<
      ReviewV1PathParameter,
      any,
      any,
      ListRepliesV1QueryParameter,
      any
    >,
    res: Response<ListRepliesV1Response>
  ) => {
    const dto: GetRepliesDto = {
      reviewId: parseInt(req.params.reviewId),
      direction: req.query.direction,
      pageOffset: req.query.pageOffset,
      pageSize: req.query.pageSize
    };
    const { users, replies, pagination } = await this.service.getReplies(dto);

    const userMapById = users.reduce(
      (acc, user) => acc.set(user.id, user),
      new Map<string, User>()
    );
    const repliesResponse = replies.map((reply) => {
      const userReplying = userMapById.get(reply.userId);

      if (userReplying === undefined) {
        throw new CustomError({
          code: AppErrorCode.INTERNAL_ERROR,
          message: 'replying user not found',
          context: { reply }
        });
      }

      return this.buildReplyResponse(userReplying, reply);
    });

    res.send({ replies: repliesResponse, pagination });
  };

  public updateReply = async (
    req: Request<
      ReplyV1PathParameter,
      any,
      UpdateReplyV1Request,
      any,
      AppIdToken
    >,
    res: Response<UpdateReplyV1Response>
  ) => {
    const dto: UpdateReplyDto = {
      requesterIdToken: res.locals.passport,
      reviewId: parseInt(req.params.reviewId),
      replyId: parseInt(req.params.replyId),
      content: req.body.content
    };
    const { user, reply } = await this.service.updateReply(dto);

    res.send({ reply: this.buildReplyResponse(user, reply) });
  };

  public deleteReply = async (
    req: Request<ReplyV1PathParameter, any, any, any, AppIdToken>,
    res: Response<DeleteReplyV1Response>
  ) => {
    const dto: DeleteReplyDto = {
      requesterIdToken: res.locals.passport,
      reviewId: parseInt(req.params.reviewId),
      replyId: parseInt(req.params.replyId)
    };
    await this.service.deleteReply(dto);

    res.send();
  };

  private buildReviewResponse = (
    user: User,
    review: Review
  ): ReviewV1Response => {
    return {
      id: review.id,
      userId: user.id,
      nickname: user.nickname,
      tag: user.tag,
      title: review.title,
      movieName: review.movieName,
      content: review.content,
      replyCount: review.replyCount,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    };
  };

  private buildReplyResponse = (user: User, reply: Reply): ReplyV1Response => {
    return {
      id: reply.id,
      reviewId: reply.reviewId,
      userId: user.id,
      nickname: user.nickname,
      tag: user.tag,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt
    };
  };
}
