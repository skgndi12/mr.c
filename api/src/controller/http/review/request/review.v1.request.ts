import { Direction, SortBy } from '@src/core/services/review/types';

export interface ReviewV1PathParameter {
  reviewId: string;
}

export interface ReplyV1PathParameter {
  reviewId: string;
  replyId: string;
}

export interface CreateReviewV1Request {
  title: string;
  movieName: string;
  content: string;
}

export type ListReviewsV1QueryParameter = {
  /**@allowReserved */
  nickname?: string;
  /**@allowReserved */
  title?: string;
  /**@allowReserved */
  movieName?: string;
  sortBy?: SortBy;
  direction?: Direction;
  pageOffset?: number;
  pageSize?: number;
};

export interface UpdateReviewV1Request {
  title: string;
  movieName: string;
  content: string;
}

export interface CreateReplyV1Request {
  content: string;
}

export type ListRepliesV1QueryParameter = {
  direction?: Direction;
  pageOffset?: number;
  pageSize?: number;
};

export interface UpdateReplyV1Request {
  content: string;
}
