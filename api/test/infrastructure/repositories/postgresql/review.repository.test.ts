import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';

import { Review } from '@src/core/entities/review.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import { CreateReviewParams } from '@src/core/ports/review.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlReviewRepository } from '@src/infrastructure/repositories/postgresql/review.repository';

describe('Test review repository', () => {
  const logger: Partial<Logger> = {
    error: jest.fn()
  };
  let prismaClient: ExtendedPrismaClient;
  let reviewRepository: PostgresqlReviewRepository;

  beforeAll(() => {
    const config = {
      host: '127.0.0.1',
      port: 5435,
      user: 'mrc-client',
      password: 'Client123!'
    };
    prismaClient = generatePrismaClient(logger as Logger, config);
    reviewRepository = new PostgresqlReviewRepository(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('Test create', () => {
    const userId = randomUUID();
    const title = 'randomTitle';
    const movieName = 'randomMovieName';
    const content = 'randomContent';
    const createdAt = new Date();
    let reviewCreated: Review;

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
    });

    afterAll(async () => {
      await prismaClient.review.delete({ where: { id: reviewCreated.id } });
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      const params: CreateReviewParams = {
        userId,
        title,
        movieName,
        content
      };

      reviewCreated = await reviewRepository.create(params);

      expect(reviewCreated.getData()).toEqual(
        expect.objectContaining({ userId, title, movieName, content })
      );
    });
  });

  describe('Test find by ID', () => {
    const userId = randomUUID();
    const createdAt = new Date();
    let reviewCreated: Review;

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
      const reviewResultCreated = await prismaClient.review.create({
        data: {
          userId,
          title: 'randomTitle',
          movieName: 'randomMovieName',
          content: 'randomContent',
          createdAt,
          updatedAt: createdAt
        }
      });
      reviewCreated = reviewRepository['convertToEntity'](
        reviewResultCreated.id,
        reviewResultCreated.userId,
        reviewResultCreated.title,
        reviewResultCreated.movieName,
        reviewResultCreated.content,
        0,
        reviewResultCreated.createdAt,
        reviewResultCreated.updatedAt
      );
    });

    afterAll(async () => {
      await prismaClient.review.delete({ where: { id: reviewCreated.id } });
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      const reviewFound = await reviewRepository.findById(reviewCreated.id);

      expect(JSON.stringify(reviewFound)).toEqual(
        JSON.stringify(reviewCreated)
      );
    });

    it('should fail when no existing review is found for the given ID', async () => {
      try {
        await reviewRepository.findById(reviewCreated.id + 1);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });
});
