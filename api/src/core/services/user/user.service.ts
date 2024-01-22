import { AccessLevel } from '@prisma/client';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { User } from '@src/core/entities/user.entity';
import { UserRepository } from '@src/core/ports/user.repository';
import { AccessLevelEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
