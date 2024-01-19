import { User } from '@src/core/entities/user.entity';
import { TransactionClient } from '@src/core/ports/transaction.manager';

export interface UserRepository {
  findById(id: string, txClient?: TransactionClient): Promise<User>;
  findByEmail(email: string, txClient?: TransactionClient): Promise<User>;
  upsert(userData: User, txClient?: TransactionClient): Promise<User>;
  deleteById(id: string, txClient?: TransactionClient): Promise<void>;
}
