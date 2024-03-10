import { Review } from '@src/core/entities/review.entity';
import { TransactionClient } from '@src/core/ports/transaction.manager';
import { Direction, SortBy } from '@src/core/services/review/types';

export interface CreateReviewParams {
  userId: string;
  title: string;
  movieName: string;
  content: string;
}

export interface FindManyAndCountResponse {
  reviews: Review[];
  reviewCount: number;
}

export interface FindReviewsParams {
  // filter
  nickname?: string;
  title?: string;
  movieName?: string;

  // sort
  sortBy: SortBy;
  direction: Direction;

  //pagination
  pageOffset: number;
  pageSize: number;
}

export interface UpdateReviewParams {
  id: number;
  title: string;
  movieName: string;
  content: string;
}

export interface ReviewRepository {
  create(
    params: CreateReviewParams,
    txClient?: TransactionClient
  ): Promise<Review>;
  findById(id: number, txClient?: TransactionClient): Promise<Review>;
  findManyAndCount(
    params: FindReviewsParams,
    txClient?: TransactionClient
  ): Promise<FindManyAndCountResponse>;
  update(
    params: UpdateReviewParams,
    txClient?: TransactionClient
  ): Promise<Review>;
  deleteById(id: number, txClient?: TransactionClient): Promise<void>;
}
