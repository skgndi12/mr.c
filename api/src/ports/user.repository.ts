import { User } from '@src/core/entities/user.entity';
import { TransactionClient } from '@src/ports/transaction.manager';

export interface UserRepository {
  create(
    name: string,
    email: string,
    transactionClient?: TransactionClient
  ): Promise<User>;
  findById(id: string, transactionClient?: TransactionClient): Promise<User>;
  updateById(
    id: string,
    name: string,
    email: string,
    transactionClient?: TransactionClient
  ): Promise<User>;
}
