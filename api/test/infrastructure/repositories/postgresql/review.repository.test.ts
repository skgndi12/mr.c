import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';

import { Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import {
  CreateReviewParams,
  FindReviewsParams,
  UpdateReviewParams
} from '@src/core/ports/review.repository';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { PrismaErrorCode } from '@src/infrastructure/prisma/errors';
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

  describe('Test find many and count', () => {
    const users: User[] = [];
    const userCount = 4;
    const reviewCount = 16;
    const reviews: Review[] = [];
    const movieNames: string[] = [
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID()
    ];
    const titles: string[] = [
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID()
    ];
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

      for (let i = 1; i <= reviewCount; i++) {
        const createdAt = new Date(currentDate.getTime() + i * 1000);

        if (i <= 4) {
          reviews.push(
            new Review(
              i,
              users[0].id,
              `${i}${titles[0]}`,
              `${movieNames[0]}${i}`,
              content,
              0,
              createdAt,
              createdAt
            )
          );
        } else if (i <= 8) {
          reviews.push(
            new Review(
              i,
              users[1].id,
              `${i}${titles[1]}`.toUpperCase(),
              `${movieNames[1]}${i}`.toUpperCase(),
              content,
              0,
              createdAt,
              createdAt
            )
          );
        } else if (i <= 12) {
          reviews.push(
            new Review(
              i,
              users[2].id,
              `${i}${titles[2]}${i}`.toLowerCase(),
              `${i}${movieNames[2]}${i}`.toLowerCase(),
              content,
              0,
              createdAt,
              createdAt
            )
          );
        } else {
          reviews.push(
            new Review(
              i,
              users[3].id,
              `${i}${titles[3]}${i}`,
              `${i}${movieNames[3]}${i}`,
              content,
              0,
              createdAt,
              createdAt
            )
          );
        }
      }

      for (const review of reviews) {
        await prismaClient.review.create({
          data: {
            id: review.id,
            userId: review.userId,
            title: review.title,
            movieName: review.movieName,
            content: review.content,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
          }
        });
      }
    });

    afterAll(async () => {
      const reviewIds = reviews.map((review) => review.id);
      const userIds = users.map((user) => user.id);
      await prismaClient.review.deleteMany({
        where: { id: { in: reviewIds } }
      });
      await prismaClient.user.deleteMany({
        where: {
          id: { in: userIds }
        }
      });
    });

    it('should success when pagination is valid and sorting by movieName in descending order', async () => {
      const params: FindReviewsParams = {
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'movieName',
        direction: 'desc'
      };
      const reviewsSorted = reviews.sort((a, b) =>
        b.movieName.localeCompare(a.movieName)
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewCount);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should success when pagination is valid and sorting by createdAt in ascending order', async () => {
      const params: FindReviewsParams = {
        pageOffset: 2,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const reviewsSorted = reviews.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewCount);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should succecss when filtering by nickname, pagination is valid, and sorting by createdAt in ascending order', async () => {
      const params: FindReviewsParams = {
        nickname: users[0].nickname,
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const reviewsFiltered = reviews.filter((review) =>
        generateUserNickname(review.userId).includes(users[0].nickname)
      );
      const reviewsSorted = reviewsFiltered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewsSpliced.length);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should succecss when filtering by title, pagination is valid, and sorting by createdAt in descending order', async () => {
      const params: FindReviewsParams = {
        title: titles[1],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'desc'
      };

      const reviewsFiltered = reviews.filter((review) =>
        review.title.toUpperCase().includes(titles[1].toUpperCase())
      );
      const reviewsSorted = reviewsFiltered.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewsSpliced.length);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should succecss when filtering by movieName, pagination is valid, and sorting by movieName in ascending order', async () => {
      const params: FindReviewsParams = {
        movieName: movieNames[2],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'movieName',
        direction: 'asc'
      };

      const reviewsFiltered = reviews.filter((review) =>
        review.movieName.toLowerCase().includes(movieNames[2].toLowerCase())
      );
      const reviewsSorted = reviewsFiltered.sort((a, b) =>
        a.movieName.localeCompare(b.movieName)
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewsSpliced.length);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should succecss when filtering by nickname and title, pagination is valid, and sorting by movieName in descending order', async () => {
      const params: FindReviewsParams = {
        nickname: users[3].nickname,
        title: titles[3],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'movieName',
        direction: 'desc'
      };

      const reviewsFiltered = reviews.filter(
        (review) =>
          generateUserNickname(review.userId).includes(users[3].nickname) &&
          review.title.includes(titles[3])
      );
      const reviewsSorted = reviewsFiltered.sort((a, b) =>
        b.movieName.localeCompare(a.movieName)
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewsSpliced.length);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should succecss when filtering by nickname and movieName, pagination is valid, and sorting by createdAt in ascending order', async () => {
      const params: FindReviewsParams = {
        nickname: users[3].nickname,
        movieName: movieNames[3],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const reviewsFiltered = reviews.filter(
        (review) =>
          generateUserNickname(review.userId).includes(users[3].nickname) &&
          review.movieName.includes(movieNames[3])
      );
      const reviewsSorted = reviewsFiltered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewsSpliced.length);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should succecss when filtering by title and movieName, pagination is valid, and sorting by createdAt in descending order', async () => {
      const params: FindReviewsParams = {
        title: titles[1],
        movieName: movieNames[1],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'desc'
      };

      const reviewsFiltered = reviews.filter(
        (review) =>
          review.title.toUpperCase().includes(titles[1].toUpperCase()) &&
          review.movieName.toUpperCase().includes(movieNames[1].toUpperCase())
      );
      const reviewsSorted = reviewsFiltered.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewsSpliced.length);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should succecss when filtering by nickname and title and movieName, pagination is valid, and sorting by createdAt in ascending order', async () => {
      const params: FindReviewsParams = {
        nickname: users[2].nickname,
        title: titles[2],
        movieName: movieNames[2],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const reviewsFiltered = reviews.filter(
        (review) =>
          generateUserNickname(review.userId)
            .toLowerCase()
            .includes(users[2].nickname.toLowerCase()) &&
          review.title.toLowerCase().includes(titles[2].toLowerCase()) &&
          review.movieName.toLowerCase().includes(movieNames[2].toLowerCase())
      );
      const reviewsSorted = reviewsFiltered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const reviewsSpliced = reviewsSorted.slice(start, end);

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewsSpliced.length);
      expect(JSON.stringify(actualResult.reviews)).toEqual(
        JSON.stringify(reviewsSpliced)
      );
    });

    it('should return an empty array when the page offset exceeds the available data size range', async () => {
      const params: FindReviewsParams = {
        pageOffset: 10,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(reviewCount);
      expect(JSON.stringify(actualResult.reviews)).toEqual(JSON.stringify([]));
    });

    it('should return an empty array when no data matching the condition is found', async () => {
      const params: FindReviewsParams = {
        nickname: 'randomNickname',
        title: 'randomTitle',
        movieName: 'randomMovie',
        pageOffset: 10,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const actualResult = await reviewRepository.findManyAndCount(params);

      expect(actualResult.reviewCount).toEqual(0);
      expect(JSON.stringify(actualResult.reviews)).toEqual(JSON.stringify([]));
    });
  });

  describe('Test update', () => {
    const userId = randomUUID();
    const createdAt = new Date();
    const titleUpdated = 'updatedTitle';
    const movieNameUpdated = 'updatedMovieName';
    const contentUpdated = 'updatedContent';
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
      const reviewExpectResult = new Review(
        reviewCreated.id,
        reviewCreated.userId,
        titleUpdated,
        movieNameUpdated,
        contentUpdated,
        0,
        reviewCreated.createdAt,
        reviewCreated.updatedAt
      );
      const params: UpdateReviewParams = {
        id: reviewCreated.id,
        title: titleUpdated,
        movieName: movieNameUpdated,
        content: contentUpdated
      };

      const reivewUpdated = await reviewRepository.update(params);

      expect(reivewUpdated.getData()).toEqual(
        expect.objectContaining({
          id: reviewExpectResult.id,
          title: reviewExpectResult.title,
          movieName: reviewExpectResult.movieName,
          content: reviewExpectResult.content,
          createdAt: reviewExpectResult.createdAt
        })
      );
    });

    it('should fail to update a review when no existing review is found with the given ID', async () => {
      const params: UpdateReviewParams = {
        id: reviewCreated.id + 1,
        title: titleUpdated,
        movieName: movieNameUpdated,
        content: contentUpdated
      };

      try {
        await reviewRepository.update(params);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });

  describe('Test delete by ID', () => {
    const userId = randomUUID();
    const content = 'randomContent';
    const createdAt = new Date();
    let reviewCreated: Review;
    const replyCount = 10;

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

    beforeEach(async () => {
      const reviewResultCreated = await prismaClient.review.create({
        data: {
          userId,
          title: 'randomTitle',
          movieName: 'randomMovieName',
          content,
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

      for (let i = 1; i <= replyCount; i++) {
        await prismaClient.reply.create({
          data: {
            reviewId: reviewResultCreated.id,
            userId,
            content,
            createdAt,
            updatedAt: createdAt
          }
        });
      }
    });

    afterAll(async () => {
      await prismaClient.review.delete({
        where: { id: reviewCreated.id }
      });
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      await reviewRepository.deleteById(reviewCreated.id);

      try {
        await prismaClient.review.findFirstOrThrow({
          where: { id: reviewCreated.id }
        });
      } catch (error: unknown) {
        expect(error).toHaveProperty('code', PrismaErrorCode.RECORD_NOT_FOUND);
      }

      const replies = await prismaClient.reply.findMany({
        where: { reviewId: reviewCreated.id }
      });

      expect(replies).toEqual([]);
    });

    it('should fail to delete a review when no existing review is found for the given ID', async () => {
      try {
        await reviewRepository.deleteById(reviewCreated.id + 1);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });
});
