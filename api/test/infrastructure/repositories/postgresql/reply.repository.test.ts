import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import seedrandom from 'seedrandom';
import { Logger } from 'winston';

import { Reply } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import {
  CreateReplyParams,
  FindRepliesParams,
  UpdateReplyParams
} from '@src/core/ports/reply.repository';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
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

  describe('Test find many and count', () => {
    const users: User[] = [];
    const userCount = 2;
    let reviewId: number;
    const replyCount = 20;
    const replies: Reply[] = [];
    const content = 'randomContent';

    beforeAll(async () => {
      const currentDate = new Date();

      for (let i = 1; i <= userCount; i++) {
        const userId = randomUUID();

        users.push(
          new User(
            userId,
            generateUserNickname(userId),
            generateUserTag(userId),
            new IdpEnum(Idp.GOOGLE),
            `${userId}@gmail.com`,
            new AccessLevelEnum(AccessLevel.USER),
            currentDate,
            currentDate
          )
        );
      }

      for (const user of users) {
        await prismaClient.user.create({
          data: {
            id: user.id,
            nickname: user.nickname,
            tag: user.tag,
            idp: user.idp.get(),
            email: user.email,
            accessLevel: user.accessLevel.get(),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
      }

      reviewId = generateRandomNumber(users[0].id);
      await prismaClient.review.create({
        data: {
          id: reviewId,
          userId: users[0].id,
          title: 'randomTitle',
          movieName: 'randomMovieName',
          content,
          createdAt: currentDate,
          updatedAt: currentDate
        }
      });

      for (let i = 1; i <= replyCount; i++) {
        const createdAt = new Date(currentDate.getTime() + i * 1000);

        if (i <= 10) {
          replies.push(
            new Reply(i, reviewId, users[0].id, content, createdAt, createdAt)
          );
        } else {
          replies.push(
            new Reply(i, reviewId, users[1].id, content, createdAt, createdAt)
          );
        }
      }

      for (const reply of replies) {
        await prismaClient.reply.create({
          data: {
            id: reply.id,
            reviewId: reply.reviewId,
            userId: reply.userId,
            content: reply.content,
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt
          }
        });
      }
    });

    afterAll(async () => {
      await prismaClient.review.delete({ where: { id: reviewId } });
      const userIds = users.map((user) => user.id);
      await prismaClient.user.deleteMany({
        where: { id: { in: userIds } }
      });
    });

    it('should success when pagination is valid and sorting in descending order', async () => {
      const params: FindRepliesParams = {
        reviewId,
        pageOffset: 1,
        pageSize: 10,
        direction: 'desc'
      };
      const repliesSorted = replies.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const repliesSpliced = repliesSorted.slice(start, end);

      const actualResult = await replyRepository.findManyAndCount(params);

      expect(actualResult.replyCount).toEqual(replyCount);
      expect(JSON.stringify(actualResult.replies)).toEqual(
        JSON.stringify(repliesSpliced)
      );
    });

    it('should success when pagination is valid and sorting in ascending order', async () => {
      const params: FindRepliesParams = {
        reviewId,
        pageOffset: 2,
        pageSize: 10,
        direction: 'asc'
      };
      const repliesSorted = replies.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const repliesSpliced = repliesSorted.slice(start, end);

      const actualResult = await replyRepository.findManyAndCount(params);

      expect(actualResult.replyCount).toEqual(replyCount);
      expect(JSON.stringify(actualResult.replies)).toEqual(
        JSON.stringify(repliesSpliced)
      );
    });

    it('should return an empty array when the page offset exceeds the available data size range', async () => {
      const params: FindRepliesParams = {
        reviewId: reviewId,
        pageOffset: 10,
        pageSize: 10,
        direction: 'asc'
      };

      const actualResult = await replyRepository.findManyAndCount(params);

      expect(actualResult.replyCount).toEqual(replyCount);
      expect(JSON.stringify(actualResult.replies)).toEqual(JSON.stringify([]));
    });

    it('should return an empty array when no data is found for the given review ID', async () => {
      const params: FindRepliesParams = {
        reviewId: reviewId + 1,
        pageOffset: 1,
        pageSize: 10,
        direction: 'asc'
      };

      const actualResult = await replyRepository.findManyAndCount(params);

      expect(actualResult.replyCount).toEqual(0);
      expect(JSON.stringify(actualResult.replies)).toEqual(JSON.stringify([]));
    });
  });

  describe('Test update', () => {
    const userId = randomUUID();
    const reviewId = generateRandomNumber(userId);
    const content = 'randomContent';
    const createdAt = new Date();
    const contentUpdated = 'updatedContent';
    const updatedAt = new Date();
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
      const replyExpectResult = new Reply(
        replyCreated.id,
        replyCreated.reviewId,
        replyCreated.userId,
        contentUpdated,
        replyCreated.createdAt,
        updatedAt
      );
      const params: UpdateReplyParams = {
        id: replyCreated.id,
        content: contentUpdated
      };

      const replyUpdated = await replyRepository.update(params);

      expect(replyUpdated.getData()).toEqual(
        expect.objectContaining({
          id: replyExpectResult.id,
          reviewId: replyExpectResult.reviewId,
          userId: replyExpectResult.userId,
          content: replyExpectResult.content,
          createdAt: replyExpectResult.createdAt
        })
      );
    });

    it('should fail to update a reply when no existing reply is found with the given ID', async () => {
      const params: UpdateReplyParams = {
        id: replyCreated.id + 1,
        content: contentUpdated
      };

      try {
        await replyRepository.update(params);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });
});
