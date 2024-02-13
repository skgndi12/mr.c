import { Comment } from '@src/core/entities/comment.entity';
import { TransactionClient } from '@src/core/ports/transaction.manager';
import { Direction, SortBy } from '@src/core/services/comment/types';

export interface CreateCommentParams {
  userId: string;
  movieName: string;
  content: string;
}

export type FindManyAndCountResponse = {
  comments: Comment[];
  commentCount: number;
};

export interface FindCommentsParams {
  // filter
  nickname?: string;
  movieName?: string;

  // sort
  sortBy: SortBy;
  direction: Direction;

  // pagination
  pageOffset: number;
  pageSize: number;
}

export interface UpdateCommentParams {
  id: number;
  movieName: string;
  content: string;
}

export interface CommentRepository {
  create(
    params: CreateCommentParams,
    txClient?: TransactionClient
  ): Promise<Comment>;
  findById(id: number, txClient?: TransactionClient): Promise<Comment>;
  findManyAndCount(
    params: FindCommentsParams,
    txClient?: TransactionClient
  ): Promise<FindManyAndCountResponse>;
  update(
    params: UpdateCommentParams,
    txClient?: TransactionClient
  ): Promise<Comment>;
  deleteById(id: number, txClient?: TransactionClient): Promise<void>;
}
