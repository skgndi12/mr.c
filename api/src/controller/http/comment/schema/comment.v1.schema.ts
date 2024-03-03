import { Tspec } from 'tspec';

import {
  CreateCommentV1Request,
  ListCommentsV1QueryParameter,
  UpdateCommentV1Request
} from '@controller/http/comment/request/comment.v1.request';
import {
  CreateCommentV1Response,
  DeleteCommentV1Response,
  ListCommentsV1Response,
  UpdateCommentV1Response
} from '@controller/http/comment/response/comment.v1.response';
import { HttpErrorResponse } from '@controller/http/response';

export type CommentV1ApiSpec = Tspec.DefineApiSpec<{
  security: 'jwt';
  basePath: '/api/v1';
  tags: ['Comment'];
  paths: {
    '/comments': {
      post: {
        summary: 'Create comment';
        body: CreateCommentV1Request;
        responses: {
          200: CreateCommentV1Response;
          default: HttpErrorResponse;
        };
      };
      get: {
        summary: 'List comments';
        query: ListCommentsV1QueryParameter;
        responses: {
          200: ListCommentsV1Response;
          default: HttpErrorResponse;
        };
      };
    };
    '/comments/{commentId}': {
      put: {
        summary: 'Update comment';
        path: { commentId: number };
        body: UpdateCommentV1Request;
        responses: {
          200: UpdateCommentV1Response;
          default: HttpErrorResponse;
        };
      };
      delete: {
        summary: 'Delete comment';
        path: { commentId: number };
        responses: {
          200: DeleteCommentV1Response;
          default: HttpErrorResponse;
        };
      };
    };
  };
}>;
