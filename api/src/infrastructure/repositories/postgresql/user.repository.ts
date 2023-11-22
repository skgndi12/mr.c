import { Prisma, PrismaClient } from '@prisma/client';

import { User } from '@src/core/entities/user.entity';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  PrismaErrorCode,
  isErrorWithCode
} from '@src/infrastructure/prisma/errors';
import { UserRepository } from '@src/ports/user.repository';

export class PostgresqlUserRepository implements UserRepository {
  constructor(private readonly client: PrismaClient) {}

  public create = async (
    name: string,
    email: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<User> => {
    const client = transactionClient ?? this.client;
    return client.user.create({ data: { name, email } });
  };

  public findById = async (
    id: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<User> => {
    try {
      const client = transactionClient ?? this.client;
      return client.user.findFirstOrThrow({ where: { id } });
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError(
          AppErrorCode.NOT_FOUND,
          error,
          `user not found by id: ${id})`
        );
      }

      throw error;
    }
  };

  public updateById = async (
    id: string,
    name: string,
    email: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<User> => {
    try {
      const client = transactionClient ?? this.client;
      return client.user.update({
        where: { id },
        data: { name, email }
      });
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError(
          AppErrorCode.NOT_FOUND,
          error,
          `user not found by id: ${id})`
        );
      }

      throw error;
    }
  };
}
