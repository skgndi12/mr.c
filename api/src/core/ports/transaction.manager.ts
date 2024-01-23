import { IsolationLevel } from '@src/infrastructure/repositories/types';

export interface TransactionClient {}

export interface TransactionManager {
  runInTransaction<T>(
    callback: (tx: TransactionClient) => Promise<T>,
    isolationLevel: IsolationLevel,
    maxRetries?: number
  ): Promise<T>;
}
