import { AppIdToken } from '@src/core/entities/auth.entity';
import { Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';

export type SortBy = 'createdAt' | 'movieName';

export type Direction = 'asc' | 'desc';

export interface ReviewsPaginationResponse {
  sortBy: SortBy;
  direction: Direction;
  pageOffset: number;
  pageSize: number;
  totalEntryCount: number;
  totalPageCount: number;
}

export interface CreateReviewResponse {
  user: User;
  review: Review;
}

export interface GetReviewResponse {
  user: User;
  review: Review;
}

export interface GetReviewsResponse {
  users: User[];
  reviews: Review[];
  pagination: ReviewsPaginationResponse;
}

export interface UpdateReviewResponse {
  user: User;
  review: Review;
}

export interface CreateReviewDto {
  requesterIdToken: AppIdToken;
  title: string;
  movieName: string;
  content: string;
}

export interface GetReviewsDto {
  // filter
  nickname?: string;
  title?: string;
  movieName?: string;

  // sort
  sortBy?: SortBy;
  direction?: Direction;

  // pagination
  pageOffset?: number;
  pageSize?: number;
}

export interface UpdateReviewDto {
  requesterIdToken: AppIdToken;
  reviewId: number;
  title: string;
  movieName: string;
  content: string;
}
