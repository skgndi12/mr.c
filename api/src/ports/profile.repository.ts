import { Profile } from '@src/core/entities/profile.entity';
import { TransactionClient } from '@src/ports/transaction.manager';

export interface ProfileRepository {
  create(name: string, transactionClient?: TransactionClient): Promise<Profile>;
  findById(id: string, transactionClient?: TransactionClient): Promise<Profile>;
  updateById(
    id: string,
    name: string,
    transactionClient?: TransactionClient
  ): Promise<Profile>;
}
