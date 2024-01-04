import { User } from '@src/core/entities/user.entity';
import { TransactionClient } from '@src/core/ports/transaction.manager';

export interface UserRepository {
  findByEmail(email: string, txClient?: TransactionClient): Promise<User>;
  upsert(userData: User, txClient?: TransactionClient): Promise<User>;
}
