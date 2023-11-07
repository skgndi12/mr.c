import { Prisma, PrismaClient } from '@prisma/client';

import { Profile } from '@src/core/entities/profile.entity';
import { RepositoryError } from '@src/infrastructure/repositories/errors';
import { ProfileRepository } from '@src/ports/profile.repository';
import { getErrorMessage } from '@src/util/error';

export class PostgresqlProfileRepository implements ProfileRepository {
  constructor(private readonly client: PrismaClient) {}

  public create = async (
    name: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<Profile> => {
    try {
      const client = transactionClient ?? this.client;
      return client.profile.create({ data: { name } });
    } catch (error: unknown) {
      throw new RepositoryError(getErrorMessage(error));
    }
  };

  public findById = async (
    id: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<Profile> => {
    try {
      const client = transactionClient ?? this.client;
      const profile = client.profile.findFirstOrThrow({
        where: { id }
      });
      return profile;
    } catch (error: unknown) {
      throw new RepositoryError(getErrorMessage(error));
    }
  };

  public updateById = async (
    id: string,
    name: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<Profile> => {
    try {
      const client = transactionClient ?? this.client;
      return client.profile.update({
        where: { id },
        data: { name }
      });
    } catch (error: unknown) {
      throw new RepositoryError(getErrorMessage(error));
    }
  };
}
