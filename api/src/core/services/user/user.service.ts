import { AccessLevel } from '@prisma/client';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { User } from '@src/core/entities/user.entity';
import {
  TransactionClient,
  TransactionManager
} from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import { AccessLevelEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { IsolationLevel } from '@src/infrastructure/repositories/types';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly txManager: TransactionManager
  ) {}

  public getUser = async (
    requesterIdToken: AppIdToken,
    requestedUserId: string
  ): Promise<User> => {
    if (
      !requesterIdToken.isAccessLevelAndUserIdAuthorized(
        new AccessLevelEnum(AccessLevel.DEVELOPER),
        requestedUserId
      )
    ) {
      throw new CustomError({
        code: AppErrorCode.PERMISSIION_DENIED,
        message: 'insufficient access level to fetch user information',
        context: { accessLevel: requesterIdToken.accessLevel.get() }
      });
    }

    return await this.userRepository.findById(requestedUserId);
  };

  public updateUser = async (
    requesterIdToken: AppIdToken,
    requestedUserId: string,
    requestedAccessLevel: AccessLevel
  ): Promise<User> => {
    if (
      !requesterIdToken.isAccessLevelAuthorized(
        new AccessLevelEnum(AccessLevel.ADMIN)
      )
    ) {
      throw new CustomError({
        code: AppErrorCode.PERMISSIION_DENIED,
        message: 'insufficient access level to update user',
        context: { accessLevel: requesterIdToken.accessLevel }
      });
    }

    return (await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<User> => {
        const userFound = await this.userRepository.findById(
          requestedUserId,
          txClient
        );
        userFound.accessLevel = new AccessLevelEnum(requestedAccessLevel);

        return await this.userRepository.upsert(userFound, txClient);
      },
      IsolationLevel.READ_COMMITTED
    )) as User;
  };
}
