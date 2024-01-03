import { Prisma, PrismaClient } from '@prisma/client';

import { User } from '@src/core/entities/user.entity';
import { UserRepository } from '@src/core/ports/user.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  PrismaErrorCode,
  isErrorWithCode
} from '@src/infrastructure/prisma/errors';

export class PostgresqlUserRepository implements UserRepository {
  constructor(private readonly client: PrismaClient) {}

  public findByEmail = async (
    email: string,
    txClient?: Prisma.TransactionClient
  ): Promise<User> => {
    try {
      const client = txClient ?? this.client;
      return await client.user.findFirstOrThrow({ where: { email } });
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'user not found',
          context: { email }
        });
      }
      throw error;
    }
  };

  // NOTE: You should satisfy the criteria for the database upsert. https://www.prisma.io/docs/orm/reference/prisma-client-reference#database-upserts
  public upsert = async (
    userData: User,
    txClient?: Prisma.TransactionClient
  ): Promise<User> => {
    const client = txClient ?? this.client;
    let upsertUser;

    try {
      upsertUser = await client.user.upsert({
        where: {
          email: userData.email
        },
        update: {
          accessLevel: userData.accessLevel,
          updatedAt: userData.updatedAt
        },
        create: {
          id: userData.id,
          nickname: userData.nickname,
          tag: userData.tag,
          idp: userData.idp,
          email: userData.email,
          accessLevel: userData.accessLevel,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        },
        select: { id: true }
      });
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        cause: error,
        message: 'failed to upsert user',
        context: { userData }
      });
    }

    try {
      return await client.user.findFirstOrThrow({
        where: { id: upsertUser.id }
      });
    } catch (error: unknown) {
      if (
        isErrorWithCode(error) &&
        error.code === PrismaErrorCode.RECORD_NOT_FOUND
      ) {
        throw new CustomError({
          code: AppErrorCode.INTERNAL_ERROR,
          cause: error,
          message: 'upserted user not found',
          context: { id: upsertUser.id }
        });
      }

      throw error;
    }
  };
}
