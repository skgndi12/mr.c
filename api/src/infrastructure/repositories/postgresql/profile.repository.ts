import { Prisma, PrismaClient } from '@prisma/client';

import { Profile } from '@src/core/entities/profile.entity';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  PrismaErrorCode,
  isErrorWithCode
} from '@src/infrastructure/prisma/errors';
import { ProfileRepository } from '@src/ports/profile.repository';

export class PostgresqlProfileRepository implements ProfileRepository {
  constructor(private readonly client: PrismaClient) {}

  public create = async (
    name: string,
    transactionClient?: Prisma.TransactionClient
  ): Promise<Profile> => {
    const client = transactionClient ?? this.client;
    return client.profile.create({ data: { name } });
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
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError(
          AppErrorCode.NOT_FOUND,
          error,
          `profile not found by id: ${id})`
        );
      }

      throw error;
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
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError(
          AppErrorCode.NOT_FOUND,
          error,
          `profile not found by id: ${id}`
        );
      }

      throw error;
    }
  };
}
