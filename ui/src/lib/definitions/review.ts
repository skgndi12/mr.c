import type { Pagination } from '@/lib/definitions/common';

export interface Review {
  id: number; // 213,
  userId: string; // "{UUID v4}",
  nickname: string; // "신비로운 평론가 붉은 여우",
  tag: string; // "#MQ3B",
  title: string; // "매드맥스 리뷰~",
  movieName: string; // "Mad Max",
  content: string; // "{review_content}",
  createdAt: string; //"2023-04-02T15:08:00+09:00",
  updatedAt: string; //"2023-04-02T15:08:00+09:00"
  replyCount: number;
}

export interface ReviewFilter {
  nickname?: string;
  title?: string;
  movieName?: string;
}

export interface ListReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
  filter?: ReviewFilter;
}

export interface ListReviewsQuery
  extends ReviewFilter,
    Partial<Omit<Pagination, 'totalPageCount' | 'totalEntryCount'>> {}

export interface CreateReviewRequest {
  title: string;
  movieName: string;
  content: string;
}

export interface CreateReviewResponse {
  review: Review;
}

export interface GetReviewResponse {
  review: Review;
}

export interface UpdateReviewRequest {
  title: string;
  movieName: string;
  content: string;
}

export interface UpdateReviewResponse {
  review: Review;
}
