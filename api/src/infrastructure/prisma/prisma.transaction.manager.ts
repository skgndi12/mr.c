import { Prisma, PrismaClient } from '@prisma/client';

import {
  PrismaErrorCode,
  isErrorWithCode
} from '@src/infrastructure/prisma/errors';
import { RepositoryError } from '@src/infrastructure/repositories/errors';
import { IsolationLevel } from '@src/infrastructure/repositories/types';
import { TransactionManager } from '@src/ports/transaction.manager';
import { getErrorMessage } from '@src/util/error';

export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly client: PrismaClient) {}

  public runInTransaction = async <T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    isolationLevel: IsolationLevel,
    maxRetries = 3
  ): Promise<T | null> => {
    let retries = 0;
    let result: T | null = null;

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

        throw new RepositoryError(getErrorMessage(error));
      }
    }

    return result;
  };
}
