import { AccessLevel, Idp } from '@prisma/client';
import { Request, Response } from 'express';

import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';
import { CommentService } from '@src/core/services/comment/comment.service';
import { CommentsPaginationResponse } from '@src/core/services/comment/types';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';

import { CommentV1Controller } from '@controller/http/comment/comment.v1.controller';
import { ListCommentsV1QueryParameter } from '@controller/http/comment/request/comment.v1.request';
import { ListCommentsV1Response } from '@controller/http/comment/response/comment.v1.response';
import { Middleware } from '@controller/http/middleware';

function calculateCommentTotalPageCount(
  commentCount: number,
  pageSize?: number
) {
  const givenPageSize = pageSize ?? 10;
  const additionalPageCount = commentCount % givenPageSize !== 0 ? 1 : 0;
  return Math.floor(commentCount / givenPageSize) + additionalPageCount;
}

describe('Test comment v1 controller', () => {
  const middleware: Partial<Middleware> = {};
  const commentService: Partial<CommentService> = {
    createComment: jest.fn(),
    getComments: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn()
  };
  let commentController: CommentV1Controller;

  beforeAll(() => {
    commentController = new CommentV1Controller(
      middleware as Middleware,
      commentService as CommentService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test list comments', () => {
    const users: User[] = [];
    const userCount = 3;
    const comments: Comment[] = [];
    const commentCountPerUser = 3;
    const commentCount = userCount * commentCountPerUser;
    const movieNames: string[] = ['firstMovie', 'secondMovie', 'thirdMovie'];
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

        for (let j = 1; j <= commentCountPerUser; j++) {
          const baseCommentId = (i - 1) * commentCountPerUser;

          comments.push(
            new Comment(
              baseCommentId + j,
              userId,
              movieNames[j - 1],
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
        query: {}
      } as unknown as Request<any, any, any, ListCommentsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListCommentsV1Response>;

      const totalPageCount = calculateCommentTotalPageCount(commentCount);
      const pagination: CommentsPaginationResponse = {
        sortBy: 'createdAt',
        direction: 'desc',
        pageOffset: 1,
        pageSize: 10,
        totalPageCount
      };
      commentService.getComments = jest.fn(() =>
        Promise.resolve({
          users,
          comments,
          pagination
        })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedCommentsResponse = comments.map((comment) =>
        commentController['buildCommentResponse'](
          userMapById.get(comment.userId) as User,
          comment
        )
      );

      await commentController.listComments(req, res);

      expect(commentService.getComments).toBeCalledTimes(1);
      expect(commentService.getComments).toBeCalledWith({});

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        comments: expectedCommentsResponse,
        pagination: {
          sortBy: 'createdAt',
          direction: 'desc',
          pageOffset: 1,
          pageSize: 10,
          totalPageCount
        }
      });
    });

    it('should success when only filter conditions are specified', async () => {
      const req = {
        query: {
          nickname: users[0].nickname,
          movieName: movieNames[0]
        }
      } as unknown as Request<any, any, any, ListCommentsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListCommentsV1Response>;

      const totalPageCount = calculateCommentTotalPageCount(commentCount);
      const pagination: CommentsPaginationResponse = {
        sortBy: 'createdAt',
        direction: 'desc',
        pageOffset: 1,
        pageSize: 10,
        totalPageCount
      };
      commentService.getComments = jest.fn(() =>
        Promise.resolve({
          users,
          comments,
          pagination
        })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedCommentsResponse = comments.map((comment) =>
        commentController['buildCommentResponse'](
          userMapById.get(comment.userId) as User,
          comment
        )
      );

      await commentController.listComments(req, res);

      expect(commentService.getComments).toBeCalledTimes(1);
      expect(commentService.getComments).toBeCalledWith({
        nickname: req.query.nickname,
        movieName: req.query.movieName
      });

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        comments: expectedCommentsResponse,
        pagination: {
          sortBy: 'createdAt',
          direction: 'desc',
          pageOffset: 1,
          pageSize: 10,
          totalPageCount
        },
        filter: {
          nickname: req.query.nickname,
          movieName: req.query.movieName
        }
      });
    });

    it('should succes when only pagination conditions are specified', async () => {
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
      } as unknown as Request<any, any, any, ListCommentsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListCommentsV1Response>;

      const totalPageCount = calculateCommentTotalPageCount(
        commentCount,
        givenPageSize
      );
      const pagination: CommentsPaginationResponse = {
        sortBy: givenSortBy,
        direction: givenDirection,
        pageOffset: givenPageOffset,
        pageSize: givenPageSize,
        totalPageCount
      };
      commentService.getComments = jest.fn(() =>
        Promise.resolve({
          users,
          comments,
          pagination
        })
      );

      const userMapById = users.reduce(
        (acc, user) => acc.set(user.id, user),
        new Map<string, User>()
      );
      const expectedCommentsResponse = comments.map((comment) =>
        commentController['buildCommentResponse'](
          userMapById.get(comment.userId) as User,
          comment
        )
      );

      await commentController.listComments(req, res);

      expect(commentService.getComments).toBeCalledTimes(1);
      expect(commentService.getComments).toBeCalledWith({
        sortBy: req.query.sortBy,
        direction: req.query.direction,
        pageOffset: req.query.pageOffset,
        pageSize: req.query.pageSize
      });

      expect(res.send).toBeCalledTimes(1);
      expect(res.send).toBeCalledWith({
        comments: expectedCommentsResponse,
        pagination: {
          sortBy: req.query.sortBy,
          direction: req.query.direction,
          pageOffset: req.query.pageOffset,
          pageSize: req.query.pageSize,
          totalPageCount
        }
      });
    });

    it('should fail when the commenting user is not found', async () => {
      const req = {
        query: {}
      } as unknown as Request<any, any, any, ListCommentsV1QueryParameter, any>;
      const res = {
        send: jest.fn()
      } as unknown as Response<ListCommentsV1Response>;

      const totalPageCount = calculateCommentTotalPageCount(commentCount);
      commentService.getComments = jest.fn(() =>
        Promise.resolve({
          users: users.splice(0, -1),
          comments,
          pagination: {
            sortBy: 'createdAt',
            direction: 'desc',
            pageOffset: 1,
            pageSize: 10,
            totalPageCount
          }
        })
      );

      try {
        await commentController.listComments(req, res);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.INTERNAL_ERROR);
      }
    });
  });
});
