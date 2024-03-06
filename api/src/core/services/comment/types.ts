import { AppIdToken } from '@src/core/entities/auth.entity';
import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';

export type SortBy = 'createdAt' | 'movieName';

export type Direction = 'asc' | 'desc';

export interface CommentsPaginationResponse {
  sortBy: SortBy;
  direction: Direction;
  pageOffset: number;
  pageSize: number;
  totalEntryCount: number;
  totalPageCount: number;
}

export interface CreateCommentResponse {
  user: User;
  comment: Comment;
}

export interface GetCommentsResponse {
  users: User[];
  comments: Comment[];
  pagination: CommentsPaginationResponse;
}

export interface UpdateCommentResponse {
  user: User;
  comment: Comment;
}

export interface CreateCommentDto {
  requesterIdToken: AppIdToken;
  movieName: string;
  content: string;
}

export interface GetCommentsDto {
  // filter
  nickname?: string;
  movieName?: string;

  // sort
  sortBy?: SortBy;
  direction?: Direction;

  // pagination
  pageOffset?: number;
  pageSize?: number;
}

export interface UpdateCommentDto {
  requesterIdToken: AppIdToken;
  commentId: number;
  movieName: string;
  content: string;
}

export interface DeleteCommentDto {
  requesterIdToken: AppIdToken;
  commentId: number;
}
