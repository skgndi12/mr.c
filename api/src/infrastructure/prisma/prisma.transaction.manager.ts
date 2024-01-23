import { TransactionManager } from '@src/core/ports/transaction.manager';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  PrismaErrorCode,
  isErrorWithCode
} from '@src/infrastructure/prisma/errors';
import {
  ExtendedPrismaClient,
  ExtendedPrismaTransactionClient
} from '@src/infrastructure/prisma/types';
import { IsolationLevel } from '@src/infrastructure/repositories/types';

export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly client: ExtendedPrismaClient) {}

  public runInTransaction = async <T>(
    callback: (tx: ExtendedPrismaTransactionClient) => Promise<T>,
    isolationLevel: IsolationLevel,
    maxRetries = 3
  ): Promise<T> => {
    let retries = 0;
    let result: T | undefined = undefined;

    while (retries < maxRetries) {
      try {
        result = await this.client.$transaction(callback, {
          isolationLevel
        });
        break;
      } catch (error: unknown) {
        if (
          isErrorWithCode(error) &&
          error.code === PrismaErrorCode.TRANSACTION_CONFLICT
        ) {
          retries++;
          continue;
        }

        throw error;
      }
    }

    if (result === undefined) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        message: 'failed to transaction',
        context: { callback, isolationLevel }
      });
    }

    return result;
  };
}
