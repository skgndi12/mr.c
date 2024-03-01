import { Direction, SortBy } from '@src/core/services/comment/types';

export type CommentV1PaginationType = {
  sortBy: SortBy;
  direction: Direction;
  pageOffset: number;
  pageSize: number;
  totalEntryCount: number;
  totalPageCount: number;
};

export type CommentV1FilterType = {
  nickname?: string;
  movieName?: string;
};

export interface CommentV1Response {
  id: number;
  userId: string;
  nickname: string;
  tag: string;
  movieName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentV1Response {
  comment: CommentV1Response;
}

export interface ListCommentsV1Response {
  comments: CommentV1Response[];
  pagination: CommentV1PaginationType;
  filter?: CommentV1FilterType;
}

export interface UpdateCommentV1Response {
  comment: CommentV1Response;
}

export interface DeleteCommentV1Response {}
