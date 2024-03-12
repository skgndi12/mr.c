import { AppIdToken } from '@src/core/entities/auth.entity';
import { Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';

export type SortBy = 'createdAt' | 'movieName';

export type Direction = 'asc' | 'desc';

export interface CreateReviewResponse {
  user: User;
  review: Review;
}

export interface GetReviewResponse {
  user: User;
  review: Review;
}

export interface CreateReviewDto {
  requesterIdToken: AppIdToken;
  title: string;
  movieName: string;
  content: string;
}
