import { Prisma, PrismaClient } from '@prisma/client';

import { User } from '@src/core/entities/user.entity';
import { RepositoryError } from '@src/infrastructure/repositories/errors';
import { UserRepository } from '@src/ports/user.repository';
import { getErrorMessage } from '@src/util/error';

export class PostgresqlUserRepository implements UserRepository {
  constructor(private readonly client: PrismaClient) {}

  public create = async (
    name: string,
    email: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<User> => {
    try {
      const client = transactionClient ?? this.client;
      return client.user.create({ data: { name, email } });
    } catch (error: unknown) {
      throw new RepositoryError(getErrorMessage(error));
    }
  };

  public findById = async (
    id: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<User> => {
    try {
      const client = transactionClient ?? this.client;
      return client.user.findFirstOrThrow({ where: { id } });
    } catch (error: unknown) {
      throw new RepositoryError(getErrorMessage(error));
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
      throw new RepositoryError(getErrorMessage(error));
    }
  };
}
