import { AccessLevel } from '@prisma/client';

import { validateUserAuthorization } from '@src/core/auth.manager';
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
      !validateUserAuthorization(
        new AccessLevelEnum(AccessLevel.DEVELOPER),
        requesterIdToken,
        requestedUserId
      )
    ) {
      throw new CustomError({
        code: AppErrorCode.PERMISSIION_DENIED,
        message: 'insufficient access level to fetch user information',
        context: { accessLevel: requesterIdToken.accessLevel }
      });
    }

    return await this.userRepository.findById(requestedUserId);
  };
}
