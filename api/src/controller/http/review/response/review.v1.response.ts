import { Direction, SortBy } from '@src/core/services/review/types';

export type ReviewV1PaginationType = {
  sortBy: SortBy;
  direction: Direction;
  pageOffset: number;
  pageSize: number;
  totalEntryCount: number;
  totalPageCount: number;
};

export type ReviewV1FilterType = {
  nickname?: string;
  title?: string;
  movieName?: string;
};

export type ReplyV1PaginationType = {
  direction: Direction;
  pageOffset: number;
  pageSize: number;
  totalEntryCount: number;
  totalPageCount: number;
};

export interface ReviewV1Response {
  id: number;
  userId: string;
  nickname: string;
  tag: string;
  title: string;
  movieName: string;
  content: string;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplyV1Response {
  id: number;
  reviewId: number;
  userId: string;
  nickname: string;
  tag: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewV1Response {
  review: ReviewV1Response;
}

export interface GetReviewV1Response {
  review: ReviewV1Response;
}

export interface ListReviewsV1Response {
  reviews: ReviewV1Response[];
  pagination: ReviewV1PaginationType;
  filter?: ReviewV1FilterType;
}

export interface UpdateReviewV1Response {
  review: ReviewV1Response;
}

export interface DeleteReviewV1Response {}

export interface CreateReplyV1Response {
  reply: ReplyV1Response;
}

export interface ListRepliesV1Response {
  replies: ReplyV1Response[];
  pagination: ReplyV1PaginationType;
}

export interface UpdateReplyV1Response {
  reply: ReplyV1Response;
}

export interface DeleteReplyV1Response {}
