import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import seedrandom from 'seedrandom';
import { Logger } from 'winston';

import { Reply } from '@src/core/entities/review.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import {
  CreateReplyParams,
} from '@src/core/ports/reply.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlReplyRepository } from '@src/infrastructure/repositories/postgresql/reply.repository';

function generateRandomNumber(userId: string): number {
  const rand = seedrandom(userId);
  return Math.floor(rand() * 100000);
}

describe('Test reply repository', () => {
  const logger: Partial<Logger> = {
    error: jest.fn()
  };
  let prismaClient: ExtendedPrismaClient;
  let replyRepository: PostgresqlReplyRepository;

  beforeAll(() => {
    const config = {
      host: '127.0.0.1',
      port: 5435,
      user: 'mrc-client',
      password: 'Client123!'
    };
    prismaClient = generatePrismaClient(logger as Logger, config);
    replyRepository = new PostgresqlReplyRepository(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('Test create', () => {
    const userId = randomUUID();
    const reviewId = generateRandomNumber(userId);
    const content = 'randomContent';
    const createdAt = new Date();

    beforeAll(async () => {
      await prismaClient.user.create({
        data: {
          id: userId,
          nickname: generateUserNickname(userId),
          tag: generateUserTag(userId),
          idp: Idp.GOOGLE,
          email: `${userId}@gmail.com`,
          accessLevel: AccessLevel.USER,
          createdAt,
          updatedAt: createdAt
        }
      });
      await prismaClient.review.create({
        data: {
          id: reviewId,
          userId,
          title: 'randomTitle',
          movieName: 'randomMovieName',
          content,
          createdAt,
          updatedAt: createdAt
        }
      });
    });

    afterAll(async () => {
      await prismaClient.review.delete({ where: { id: reviewId } });
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      const params: CreateReplyParams = {
        reviewId,
        userId,
        content
      };

      const replyCreated = await replyRepository.create(params);

      expect(replyCreated.getData()).toEqual(
        expect.objectContaining({ reviewId, userId, content })
      );
    });
  });

  describe('Test find by ID', () => {
    const userId = randomUUID();
    const reviewId = generateRandomNumber(userId);
    const content = 'randomContent';
    const createdAt = new Date();
    let replyCreated: Reply;

    beforeAll(async () => {
      await prismaClient.user.create({
        data: {
          id: userId,
          nickname: generateUserNickname(userId),
          tag: generateUserTag(userId),
          idp: Idp.GOOGLE,
          email: `${userId}@gmail.com`,
          accessLevel: AccessLevel.USER,
          createdAt,
          updatedAt: createdAt
        }
      });
      await prismaClient.review.create({
        data: {
          id: reviewId,
          userId,
          title: 'randomTitle',
          movieName: 'randomMovieName',
          content,
          createdAt,
          updatedAt: createdAt
        }
      });
      const replyResultCreated = await prismaClient.reply.create({
        data: {
          reviewId,
          userId,
          content,
          createdAt,
          updatedAt: createdAt
        }
      });
      replyCreated = replyResultCreated.convertToEntity();
    });

    afterAll(async () => {
      await prismaClient.review.delete({ where: { id: reviewId } });
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      const replyFound = await replyRepository.findById(replyCreated.id);

      expect(JSON.stringify(replyFound)).toEqual(JSON.stringify(replyCreated));
    });

    it('should fail when no existing reply is found for the given ID', async () => {
      try {
        await replyRepository.findById(replyCreated.id + 1);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });
});
