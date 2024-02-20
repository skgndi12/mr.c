import { AppIdToken } from '@src/core/entities/auth.entity';
import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';

export type SortBy = 'createdAt' | 'movieName';

export type Direction = 'asc' | 'desc';

export type CreateCommentResponse = {
  user: User;
  comment: Comment;
};

export type GetCommentsResponse = {
  users: User[];
  comments: Comment[];
  totalPageCount: number;
};

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
