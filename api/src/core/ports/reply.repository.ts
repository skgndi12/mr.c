import { Reply } from '@src/core/entities/review.entity';
import { TransactionClient } from '@src/core/ports/transaction.manager';
import { Direction } from '@src/core/services/review/types';

export interface CreateReplyParams {
  reviewId: number;
  userId: string;
  content: string;
}

export interface FindManyAndCountResponse {
  replies: Reply[];
  replyCount: number;
}

export interface FindRepliesParams {
  reviewId: number;

  // sort
  direction: Direction;

  // pagination
  pageOffset: number;
  pageSize: number;
}

export interface UpdateReplyParams {
  id: number;
  content: string;
}

export interface ReplyRepository {
  create(
    params: CreateReplyParams,
    txClient?: TransactionClient
  ): Promise<Reply>;
  findById(id: number, txClient?: TransactionClient): Promise<Reply>;
  findManyAndCount(
    params: FindRepliesParams,
    txClient?: TransactionClient
  ): Promise<FindManyAndCountResponse>;
  update(
    params: UpdateReplyParams,
    txClient?: TransactionClient
  ): Promise<Reply>;
  deleteById(id: number, txClient?: TransactionClient): Promise<void>;
}
