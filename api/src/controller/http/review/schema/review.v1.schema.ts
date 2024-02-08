import { Tspec } from 'tspec';

import { HttpErrorResponse } from '@controller/http/response';
import {
  CreateReplyV1Request,
  CreateReviewV1Request,
  ListRepliesV1QueryParameter,
  ListReviewsV1QueryParameter,
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
  UpdateReplyV1Response,
  UpdateReviewV1Response
} from '@controller/http/review/response/review.v1.response';

export type ReviewV1ApiSpec = Tspec.DefineApiSpec<{
  security: 'jwt';
  basePath: '/api/v1';
  tags: ['Review'];
  paths: {
    '/reviews': {
      post: {
        summary: 'Create review';
        body: CreateReviewV1Request;
        responses: {
          200: CreateReviewV1Response;
          default: HttpErrorResponse;
        };
      };
      get: {
        summary: 'List reviews';
        query: ListReviewsV1QueryParameter;
        responses: {
          200: ListReviewsV1Response;
          default: HttpErrorResponse;
        };
      };
    };
    '/reviews/{reviewId}': {
      get: {
        summary: 'Get review detail';
        path: { reviewId: number };
        responses: {
          200: GetReviewV1Response;
          default: HttpErrorResponse;
        };
      };
      put: {
        sumary: 'Update review';
        path: { reviewId: number };
        body: UpdateReviewV1Request;
        responses: {
          200: UpdateReviewV1Response;
          default: HttpErrorResponse;
        };
      };
      delete: {
        summary: 'Delete review';
        path: { reviewId: number };
        responses: {
          200: DeleteReviewV1Response;
          default: HttpErrorResponse;
        };
      };
    };
    '/reviews/{reviewId}/replies': {
      post: {
        summary: 'Create reply';
        path: { reviewId: number };
        body: CreateReplyV1Request;
        responses: {
          200: CreateReplyV1Response;
          default: HttpErrorResponse;
        };
      };
      get: {
        summary: 'List replies';
        path: { reviewId: number };
        query: ListRepliesV1QueryParameter;
        responses: {
          200: ListRepliesV1Response;
          default: HttpErrorResponse;
        };
      };
    };
    '/reviews/{reviewId}/replies/{replyId}': {
      put: {
        summary: 'Update reply';
        path: { reviewId: number; replyId: number };
        body: UpdateReplyV1Request;
        responses: {
          200: UpdateReplyV1Response;
          default: HttpErrorResponse;
        };
      };
      delete: {
        summary: 'Delete reply';
        path: { reviewId: number; replyId: number };
        responses: {
          200: DeleteReplyV1Response;
          default: HttpErrorResponse;
        };
      };
    };
  };
}>;
