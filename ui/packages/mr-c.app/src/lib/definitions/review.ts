import type { Pagination } from '@/lib/definitions/pagination';

interface Review {
  id: number; // 213,
  userId: string; // "{UUID v4}",
  nickname: string; // "신비로운 평론가 붉은 여우",
  tag: string; // "#MQ3B",
  title: string; // "매드맥스 리뷰~",
  movieName: string; // "Mad Max",
  content: string; // "{review_content}",
  createdAt: string; //"2023-04-02T15:08:00+09:00",
  updatedAt: string; //"2023-04-02T15:08:00+09:00"
}

export type GetReviewDetailResponse = Review;

export interface ListReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
  filter?: {
    nickname?: string;
    title?: string;
    movieName?: string;
  };
}
