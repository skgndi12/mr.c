import { Request, Response, Router } from 'express';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';
import { CommentService } from '@src/core/services/comment/comment.service';
import {
  CreateCommentDto,
  DeleteCommentDto,
  GetCommentsDto,
  UpdateCommentDto
} from '@src/core/services/comment/types';
import { AppErrorCode, CustomError } from '@src/error/errors';

import {
  CommentV1PathParameter,
  CreateCommentV1Request,
  ListCommentsV1QueryParameter,
  UpdateCommentV1Request
} from '@controller/http/comment/request/comment.v1.request';
import {
  CommentV1FilterType,
  CommentV1Response,
  CreateCommentV1Response,
  DeleteCommentV1Response,
  ListCommentsV1Response,
  UpdateCommentV1Response
} from '@controller/http/comment/response/comment.v1.response';
import { methodNotAllowed } from '@controller/http/handler';
import { Middleware } from '@controller/http/middleware';

export class CommentV1Controller {
  constructor(
    private readonly middleware: Middleware,
    private readonly service: CommentService
  ) {}

  public routes = (): Router => {
    const router: Router = Router();
    const prefix = '/v1/comments';

    router
      .route(`${prefix}/:commentId(\\d+)`)
      .all(this.middleware.issuePassport)
      .put(this.updateComment)
      .delete(this.deleteComment)
      .all(methodNotAllowed);

    router
      .route(`${prefix}`)
      .get(this.listComments)
      .all(this.middleware.issuePassport)
      .post(this.createComment)
      .all(methodNotAllowed);

    return router;
  };

  public createComment = async (
    req: Request<any, any, any, CreateCommentV1Request, AppIdToken>,
    res: Response<CreateCommentV1Response>
  ) => {
    const dto: CreateCommentDto = {
      requesterIdToken: res.locals.passport,
      movieName: req.body.movieName,
      content: req.body.content
    };
    const { user, comment } = await this.service.createComment(dto);

    res.send({ comment: this.buildCommentResponse(user, comment) });
  };

  public listComments = async (
    req: Request<any, any, any, ListCommentsV1QueryParameter, any>,
    res: Response<ListCommentsV1Response>
  ) => {
    const dto: GetCommentsDto = {
      nickname: req.query.nickname,
      movieName: req.query.movieName,
      sortBy: req.query.sortBy,
      direction: req.query.direction,
      pageOffset: req.query.pageOffset,
      pageSize: req.query.pageSize
    };

    const { users, comments, pagination } = await this.service.getComments(dto);

    let filter: CommentV1FilterType | undefined = {
      nickname: req.query.nickname,
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

    const commentsResponse = comments.map((comment) => {
      const userCommenting = userMapById.get(comment.userId);

      if (userCommenting === undefined) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'commenting user not found',
          context: { comment }
        });
      }

      return this.buildCommentResponse(userCommenting, comment);
    });

    res.send({ comments: commentsResponse, pagination, filter });
  };

  public updateComment = async (
    req: Request<
      CommentV1PathParameter,
      any,
      UpdateCommentV1Request,
      any,
      AppIdToken
    >,
    res: Response<UpdateCommentV1Response>
  ) => {
    const dto: UpdateCommentDto = {
      requesterIdToken: res.locals.passport,
      commentId: parseInt(req.params.commentId),
      movieName: req.body.movieName,
      content: req.body.content
    };
    const { user, comment } = await this.service.updateComment(dto);

    res.send({ comment: this.buildCommentResponse(user, comment) });
  };

  public deleteComment = async (
    req: Request<CommentV1PathParameter, any, any, any, AppIdToken>,
    res: Response<DeleteCommentV1Response>
  ) => {
    const dto: DeleteCommentDto = {
      requesterIdToken: res.locals.passport,
      commentId: parseInt(req.params.commentId)
    };
    await this.service.deleteComment(dto);

    res.send();
  };

  private buildCommentResponse = (
    user: User,
    comment: Comment
  ): CommentV1Response => {
    return {
      id: comment.id,
      userId: user.id,
      nickname: user.nickname,
      tag: user.tag,
      movieName: comment.movieName,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
  };
}
