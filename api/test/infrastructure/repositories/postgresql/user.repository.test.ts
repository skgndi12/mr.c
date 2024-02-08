import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';

import { User } from '@src/core/entities/user.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';

describe('Test user repository', () => {
  const logger: Partial<Logger> = {
    error: jest.fn()
  };
  let prismaClient: ExtendedPrismaClient;
  let userRepository: PostgresqlUserRepository;

  beforeAll(() => {
    const config = {
      host: '127.0.0.1',
      port: 5435,
      user: 'mrc-client',
      password: 'Client123!'
    };
    prismaClient = generatePrismaClient(logger as Logger, config);
    userRepository = new PostgresqlUserRepository(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('Test find by ID', () => {
    const id = randomUUID();
    const nickname = generateUserNickname(id);
    const tag = generateUserTag(id);
    const idpEnum = new IdpEnum(Idp.GOOGLE);
    const email = 'user1@gmail.com';
    const accessLevelEnum = new AccessLevelEnum(AccessLevel.USER);
    const currentDate = new Date();
    const idp = idpEnum.get();
    const accessLevel = accessLevelEnum.get();

    beforeAll(async () => {
      await prismaClient.user.create({
        data: {
          id,
          nickname,
          tag,
          idp,
          email,
          accessLevel,
          createdAt: currentDate,
          updatedAt: currentDate
        }
      });
    });

    afterAll(async () => {
      await prismaClient.user.delete({ where: { id } });
    });

    it('should success when valid', async () => {
      const user = await userRepository.findById(id);
      expect(JSON.stringify(user)).toEqual(
        JSON.stringify({
          id,
          nickname,
          tag,
          idp: idpEnum,
          email,
          accessLevel: accessLevelEnum,
          createdAt: currentDate,
          updatedAt: currentDate
        })
      );
    });

    it('should fail when the given ID does not match any existing user', async () => {
      try {
        await userRepository.findById(randomUUID());
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });

  describe('Test find by email', () => {
    const id = randomUUID();
    const nickname = generateUserNickname(id);
    const tag = generateUserTag(id);
    const idpEnum = new IdpEnum(Idp.GOOGLE);
    const email = 'user1@gmail.com';
    const accessLevelEnum = new AccessLevelEnum(AccessLevel.USER);
    const createdAt = new Date();
    const idp = idpEnum.get();
    const accessLevel = accessLevelEnum.get();

    beforeAll(async () => {
      await prismaClient.user.create({
        data: {
          id,
          nickname,
          tag,
          idp,
          email,
          accessLevel,
          createdAt: createdAt,
          updatedAt: createdAt
        }
      });
    });

    afterAll(async () => {
      await prismaClient.user.delete({ where: { email } });
    });

    it('should success when valid', async () => {
      const user = await userRepository.findByEmail(email);
      expect(JSON.stringify(user)).toEqual(
        JSON.stringify({
          id,
          nickname,
          tag,
          idp: idpEnum,
          email,
          accessLevel: accessLevelEnum,
          createdAt: createdAt,
          updatedAt: createdAt
        })
      );
    });

    it('should fail when the given email does not match any existing user', async () => {
      try {
        await userRepository.findByEmail('user100@gmail.com');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });

  describe('Test user find by ids', () => {
    const userIds: string[] = [];
    const users: User[] = [];
    const userCount = 10;

    beforeAll(async () => {
      const idp = Idp.GOOGLE;
      const accessLevel = AccessLevel.USER;
      const baseEmail = 'user';
      const createdAt = new Date();

      for (let i = 1; i <= userCount; i++) {
        const userId = randomUUID();

        const user = await prismaClient.user.create({
          data: {
            id: userId,
            nickname: generateUserNickname(userId),
            tag: generateUserTag(userId),
            idp,
            email: `${baseEmail}${i}@gmail.com`,
            accessLevel,
            createdAt,
            updatedAt: createdAt
          }
        });
        userIds.push(user.id);
        users.push(user.convertToEntity());
      }
    });

    afterAll(async () => {
      await prismaClient.user.deleteMany({ where: { id: { in: userIds } } });
    });

    it('should success when valid', async () => {
      const actualResult = await userRepository.findByIds(userIds);

      expect(actualResult.length).toEqual(userCount);
      expect(JSON.stringify(actualResult)).toEqual(JSON.stringify(users));
    });
  });

  describe('Test upsert', () => {
    const id = randomUUID();
    const nickname = generateUserNickname(id);
    const tag = generateUserTag(id);
    const idp = new IdpEnum(Idp.GOOGLE);
    const email = randomUUID();
    const accessLevel = new AccessLevelEnum(AccessLevel.USER);
    const createdAt = new Date();

    afterEach(async () => {
      await prismaClient.user.delete({ where: { id } });
    });

    it('should success to create user', async () => {
      const userToCreate = new User(
        id,
        nickname,
        tag,
        idp,
        email,
        accessLevel,
        createdAt,
        createdAt
      );
      const user = await userRepository.upsert(userToCreate);
      expect(JSON.stringify(user)).toEqual(JSON.stringify(userToCreate));
    });

    it('should success to update user', async () => {
      await prismaClient.user.create({
        data: {
          id,
          nickname,
          tag,
          idp: idp.get(),
          email,
          accessLevel: accessLevel.get(),
          createdAt: createdAt,
          updatedAt: createdAt
        }
      });

      const updatedAt = new Date();
      const userToUpdate = new User(
        id,
        nickname,
        tag,
        new IdpEnum(Idp.GOOGLE),
        email,
        new AccessLevelEnum(AccessLevel.ADMIN),
        createdAt,
        updatedAt
      );
      const updatedUser = await userRepository.upsert(userToUpdate);

      expect(JSON.stringify(updatedUser)).toEqual(JSON.stringify(userToUpdate));
    });

    it('should fail to update the user when the provided data includes information that cannot be updated', async () => {
      await prismaClient.user.create({
        data: {
          id,
          nickname,
          tag,
          idp: idp.get(),
          email,
          accessLevel: accessLevel.get(),
          createdAt: createdAt,
          updatedAt: createdAt
        }
      });

      const updatedAt = new Date();
      const userToUpdate = new User(
        id,
        'randomnickanme',
        tag,
        new IdpEnum(Idp.GOOGLE),
        email,
        new AccessLevelEnum(AccessLevel.ADMIN),
        createdAt,
        updatedAt
      );
      try {
        await userRepository.upsert(userToUpdate);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.INTERNAL_ERROR);
        expect(error).toHaveProperty('context', { id });
      }
    });
  });

  describe('Test delete by ID', () => {
    const id = randomUUID();
    const nickname = generateUserNickname(id);
    const tag = generateUserTag(id);
    const idp = new IdpEnum(Idp.GOOGLE);
    const email = randomUUID();
    const accessLevel = new AccessLevelEnum(AccessLevel.USER);
    const createdAt = new Date();

    beforeEach(async () => {
      await prismaClient.user.create({
        data: {
          id,
          nickname,
          tag,
          idp: idp.get(),
          email,
          accessLevel: accessLevel.get(),
          createdAt: createdAt,
          updatedAt: createdAt
        }
      });
    });

    afterAll(async () => {
      await prismaClient.user.delete({ where: { id } });
    });

    it('should success when valid', async () => {
      await userRepository.deleteById(id);
      try {
        await userRepository.findById(id);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });

    it('should fail to delete user when given ID does not match any existing user', async () => {
      try {
        await userRepository.deleteById(randomUUID());
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });
});
