import { AccessLevel, Idp } from '@prisma/client';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { User } from '@src/core/entities/user.entity';
import { UserRepository } from '@src/core/ports/user.repository';
import { UserService } from '@src/core/services/user/user.service';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';

describe('Test user service', () => {
  const currentDate = new Date();
  const requestedUserId = 'randomId';
  const requesterUserId = 'anotherRandomId';
  const user: User = {
    id: requestedUserId,
    nickname: '도전적인 평론가 연두빛 하마',
    tag: '#AZ7J',
    idp: new IdpEnum(Idp.GOOGLE),
    email: 'test@gmail.com',
    accessLevel: new AccessLevelEnum(AccessLevel.USER),
    createdAt: currentDate,
    updatedAt: currentDate
  };
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      upsert: jest.fn(),
      deleteById: jest.fn()
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test get user', () => {
    const requesterIdToken = {
      userId: requesterUserId,
      accessLevel: new AccessLevelEnum(AccessLevel.DEVELOPER)
    } as AppIdToken;

    beforeAll(() => {
      userRepository.findById = jest.fn(() => Promise.resolve(user));
    });

    it('should success when valid', async () => {
      const actualResult = await new UserService(userRepository).getUser(
        requesterIdToken,
        requestedUserId
      );

      expect(actualResult).toStrictEqual(user);

      expect(userRepository.findById).toBeCalledTimes(1);
      expect(userRepository.findById).toBeCalledWith(requestedUserId);
    });

    it('should failure when user authorization is not valid', async () => {
      try {
        requesterIdToken.accessLevel = new AccessLevelEnum(AccessLevel.USER);
        await new UserService(userRepository).getUser(
          requesterIdToken,
          requestedUserId
        );
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.PERMISSIION_DENIED);
      }

      expect(userRepository.findById).toBeCalledTimes(0);
    });
  });
});
