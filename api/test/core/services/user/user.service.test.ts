import { AccessLevel, Idp } from '@prisma/client';
import { DeepMockProxy, mockClear, mockDeep } from 'jest-mock-extended';

import extendedPrisma from '@root/test/infrastructure/prisma/test.prisma.client';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { User } from '@src/core/entities/user.entity';
import { TransactionManager } from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import { UserService } from '@src/core/services/user/user.service';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { PrismaTransactionManager } from '@src/infrastructure/prisma/prisma.transaction.manager';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';

jest.mock('@root/test/infrastructure/prisma/test.prisma.client', () => ({
  __esModule: true,
  default: mockDeep<ExtendedPrismaClient>()
}));

const prismaMock = extendedPrisma as DeepMockProxy<ExtendedPrismaClient>;

describe('Test user service', () => {
  const currentDate = new Date();
  const requestedUserId = 'randomId';
  const requesterUserId = 'anotherRandomId';
  const user = new User(
    requestedUserId,
    '도전적인 평론가 연두빛 하마',
    '#AZ7J',
    new IdpEnum(Idp.GOOGLE),
    'test@gmail.com',
    new AccessLevelEnum(AccessLevel.USER),
    currentDate,
    currentDate
  );
  let userRepository: UserRepository;
  let txManager: TransactionManager;

  beforeAll(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      upsert: jest.fn(),
      deleteById: jest.fn()
    };
    txManager = {
      runInTransaction: jest.fn()
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockClear(prismaMock);
  });

  describe('Test get user', () => {
    beforeAll(() => {
      userRepository.findById = jest.fn(() => Promise.resolve(user));
    });

    it('should success when valid', async () => {
      const givenRequesterIdToken = new AppIdToken(
        requesterUserId,
        'nickname',
        '#TAGG',
        new IdpEnum(Idp.GOOGLE),
        'user1@gmail.com',
        new AccessLevelEnum(AccessLevel.DEVELOPER)
      );
      const actualResult = await new UserService(
        userRepository,
        txManager
      ).getUser(givenRequesterIdToken, requestedUserId);

      expect(actualResult).toStrictEqual(user);

      expect(userRepository.findById).toBeCalledTimes(1);
      expect(userRepository.findById).toBeCalledWith(requestedUserId);
    });

    it('should failure when user authorization is not valid', async () => {
      try {
        const givenRequesterIdToken = new AppIdToken(
          requesterUserId,
          'nickname',
          '#TAGG',
          new IdpEnum(Idp.GOOGLE),
          'user1@gmail.com',
          new AccessLevelEnum(AccessLevel.USER)
        );
        await new UserService(userRepository, txManager).getUser(
          givenRequesterIdToken,
          requestedUserId
        );
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.PERMISSIION_DENIED);
      }

      expect(userRepository.findById).toBeCalledTimes(0);
    });
  });

  describe('Test update user', () => {
    const userFound = new User(
      user.id,
      user.nickname,
      user.tag,
      user.idp,
      user.email,
      new AccessLevelEnum(AccessLevel.USER),
      user.createdAt,
      user.updatedAt
    );
    const updatedAt = new Date();
    const requestedAccessLevel = AccessLevel.DEVELOPER;
    const userUpdated = new User(
      userFound.id,
      userFound.nickname,
      userFound.tag,
      userFound.idp,
      userFound.email,
      new AccessLevelEnum(requestedAccessLevel),
      userFound.createdAt,
      updatedAt
    );

    beforeAll(() => {
      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );
    });

    it('should success when valid', async () => {
      const userFindById = jest.fn(() =>
        Promise.resolve(userFound)
      ) as jest.Mock;
      const userUpsert = jest.fn(() =>
        Promise.resolve(userUpdated)
      ) as jest.Mock;
      userRepository = new PostgresqlUserRepository(prismaMock);
      txManager = new PrismaTransactionManager(prismaMock);
      userRepository.findById = userFindById;
      userRepository.upsert = userUpsert;

      const givenRequesterIdToken = new AppIdToken(
        requesterUserId,
        'nickname',
        '#TAGG',
        new IdpEnum(Idp.GOOGLE),
        'user1@gmail.com',
        new AccessLevelEnum(AccessLevel.ADMIN)
      );

      const actualResult = await new UserService(
        userRepository,
        txManager
      ).updateUser(
        givenRequesterIdToken,
        requestedUserId,
        requestedAccessLevel
      );

      expect(actualResult).toStrictEqual(userUpdated);

      expect(userRepository.findById).toBeCalledTimes(1);
      const userFindByIdArgs = userFindById.mock.calls[0][0];
      expect(userFindByIdArgs).toEqual(requestedUserId);

      expect(userRepository.upsert).toBeCalledTimes(1);
      const userUpsertArgs = userUpsert.mock.calls[0][0];
      expect(userUpsertArgs.getData()).toEqual(
        expect.objectContaining({
          id: userFound.id,
          nickname: userFound.nickname,
          tag: userFound.tag,
          idp: userFound.idp.get(),
          email: userFound.email,
          accessLevel: requestedAccessLevel
        })
      );
    });

    it("should failure when requester's access level is not sufficient", async () => {
      txManager.runInTransaction = jest.fn();

      try {
        const givenRequesterIdToken = new AppIdToken(
          requesterUserId,
          'nickname',
          '#TAGG',
          new IdpEnum(Idp.GOOGLE),
          'user1@gmail.com',
          new AccessLevelEnum(AccessLevel.USER)
        );
        await new UserService(userRepository, txManager).updateUser(
          givenRequesterIdToken,
          requestedUserId,
          requestedAccessLevel
        );
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.PERMISSIION_DENIED);
      }

      expect(txManager.runInTransaction).toBeCalledTimes(0);
    });
  });

  describe('Test delete user', () => {
    beforeAll(() => {
      userRepository.deleteById = jest.fn(() => Promise.resolve());
    });

    it('should success when valid', async () => {
      const givenRequesterIdToken = new AppIdToken(
        requesterUserId,
        'nickname',
        '#TAGG',
        new IdpEnum(Idp.GOOGLE),
        'user1@gmail.com',
        new AccessLevelEnum(AccessLevel.ADMIN)
      );

      await new UserService(userRepository, txManager).deleteUser(
        givenRequesterIdToken,
        requestedUserId
      );

      expect(userRepository.deleteById).toBeCalledTimes(1);
      expect(userRepository.deleteById).toBeCalledWith(requestedUserId);
    });

    it('should failure when user authorization is not valid', async () => {
      try {
        const givenRequesterIdToken = new AppIdToken(
          requesterUserId,
          'nickname',
          '#TAGG',
          new IdpEnum(Idp.GOOGLE),
          'user1@gmail.com',
          new AccessLevelEnum(AccessLevel.USER)
        );

        await new UserService(userRepository, txManager).deleteUser(
          givenRequesterIdToken,
          requestedUserId
        );
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.PERMISSIION_DENIED);
      }

      expect(userRepository.deleteById).toBeCalledTimes(0);
    });
  });
});
