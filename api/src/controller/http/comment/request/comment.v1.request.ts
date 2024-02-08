import { Direction, SortBy } from '@src/core/services/comment/types';

export interface CommentV1PathParameter {
  commentId: string;
}

export interface CreateCommentV1Request {
  movieName: string;
  content: string;
}

export type ListCommentsV1QueryParameter = {
  /**@allowReserved */
  nickname?: string;
  /**@allowReserved */
  movieName?: string;
  sortBy?: SortBy;
  direction?: Direction;
  pageOffset?: number;
  pageSize?: number;
};

export interface UpdateCommentV1Request {
  movieName: string;
  content: string;
}
