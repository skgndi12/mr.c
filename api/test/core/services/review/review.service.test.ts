import { AccessLevel, Idp } from '@prisma/client';
import { DeepMockProxy, mockClear, mockDeep } from 'jest-mock-extended';

import extendedPrisma from '@root/test/infrastructure/prisma/test.prisma.client';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { Review } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import { ReplyRepository } from '@src/core/ports/reply.repository';
import { ReviewRepository } from '@src/core/ports/review.repository';
import { TransactionManager } from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import { ReviewService } from '@src/core/services/review/review.service';
import { CreateReviewDto } from '@src/core/services/review/types';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { PrismaTransactionManager } from '@src/infrastructure/prisma/prisma.transaction.manager';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlReviewRepository } from '@src/infrastructure/repositories/postgresql/review.repository';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';

jest.mock('@root/test/infrastructure/prisma/test.prisma.client', () => ({
  __esModule: true,
  default: mockDeep<ExtendedPrismaClient>()
}));

const prismaMock = extendedPrisma as DeepMockProxy<ExtendedPrismaClient>;

describe('Test review service', () => {
  let userRepository: UserRepository;
  let reviewRepository: ReviewRepository;
  let replyRepository: ReplyRepository;
  let txManager: TransactionManager;

  beforeAll(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByIds: jest.fn(),
      upsert: jest.fn(),
      deleteById: jest.fn()
    };
    reviewRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyAndCount: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn()
    };
    replyRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyAndCount: jest.fn(),
      update: jest.fn(),
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

  describe('Test create review', () => {
    const userId = 'randomId';
    const nickname = 'randomNickname';
    const tag = '#TAGG';
    const idp = new IdpEnum(Idp.GOOGLE);
    const email = 'user1@gmail.com';
    const accessLevel = new AccessLevelEnum(AccessLevel.USER);
    const title = 'randomTitle';
    const movieName = 'randomMovie';
    const content = 'randomContent';
    const currentDate = new Date();
    const requesterIdToken = new AppIdToken(
      userId,
      nickname,
      tag,
      idp,
      email,
      accessLevel
    );

    const userFound = new User(
      userId,
      nickname,
      tag,
      idp,
      email,
      accessLevel,
      currentDate,
      currentDate
    );
    const reviewCreated = new Review(
      0,
      requesterIdToken.userId,
      title,
      movieName,
      content,
      0,
      currentDate,
      currentDate
    );

    const userFindById = jest.fn(() => Promise.resolve(userFound)) as jest.Mock;
    const reviewCreate = jest.fn(() =>
      Promise.resolve(reviewCreated)
    ) as jest.Mock;

    beforeAll(async () => {
      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );
      userRepository = new PostgresqlUserRepository(prismaMock);
      reviewRepository = new PostgresqlReviewRepository(prismaMock);
      txManager = new PrismaTransactionManager(prismaMock);
      userRepository.findById = userFindById;
      reviewRepository.create = reviewCreate;
    });

    it('should success when valid', async () => {
      const givenDto: CreateReviewDto = {
        requesterIdToken,
        title,
        movieName,
        content
      };
      const actualResult = await new ReviewService(
        userRepository,
        reviewRepository,
        replyRepository,
        txManager
      ).createReview(givenDto);

      expect(JSON.stringify(actualResult.user)).toEqual(
        JSON.stringify(userFound)
      );
      expect(JSON.stringify(actualResult.review)).toEqual(
        JSON.stringify(reviewCreated)
      );

      expect(userRepository.findById).toBeCalledTimes(1);
      const userFindByIdArgs = userFindById.mock.calls[0][0];
      expect(userFindByIdArgs).toEqual(givenDto.requesterIdToken.userId);

      expect(reviewRepository.create).toBeCalledTimes(1);
      const reviewCreateArgs = reviewCreate.mock.calls[0][0];
      expect(reviewCreateArgs).toEqual(
        expect.objectContaining({
          userId: givenDto.requesterIdToken.userId,
          title: givenDto.title,
          movieName: givenDto.movieName,
          content: givenDto.content
        })
      );
    });
  });

  describe('Test get review', () => {
    const userId = 'randomId';
    const nickname = 'randomNickname';
    const tag = '#TAGG';
    const idp = new IdpEnum(Idp.GOOGLE);
    const email = 'user1@gmail.com';
    const accessLevel = new AccessLevelEnum(AccessLevel.USER);
    const reviewId = 0;
    const title = 'randomTitle';
    const movieName = 'randomMovie';
    const content = 'randomContent';
    const currentDate = new Date();
    const requesterIdToken = new AppIdToken(
      userId,
      nickname,
      tag,
      idp,
      email,
      accessLevel
    );

    const userFound = new User(
      userId,
      nickname,
      tag,
      idp,
      email,
      accessLevel,
      currentDate,
      currentDate
    );
    const reviewFound = new Review(
      0,
      requesterIdToken.userId,
      title,
      movieName,
      content,
      0,
      currentDate,
      currentDate
    );

    const userFindById = jest.fn(() => Promise.resolve(userFound)) as jest.Mock;
    const reviewFindById = jest.fn(() =>
      Promise.resolve(reviewFound)
    ) as jest.Mock;

    beforeAll(async () => {
      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );
      userRepository = new PostgresqlUserRepository(prismaMock);
      reviewRepository = new PostgresqlReviewRepository(prismaMock);
      txManager = new PrismaTransactionManager(prismaMock);
      userRepository.findById = userFindById;
      reviewRepository.findById = reviewFindById;
    });

    it('should success when valid', async () => {
      const actualResult = await new ReviewService(
        userRepository,
        reviewRepository,
        replyRepository,
        txManager
      ).getReview(reviewId);

      expect(JSON.stringify(actualResult.user)).toEqual(
        JSON.stringify(userFound)
      );
      expect(JSON.stringify(actualResult.review)).toEqual(
        JSON.stringify(reviewFound)
      );

      expect(userRepository.findById).toBeCalledTimes(1);
      const userFindByIdArgs = userFindById.mock.calls[0][0];
      expect(userFindByIdArgs).toEqual(userId);

      expect(reviewRepository.findById).toBeCalledTimes(1);
      const reviewFindByIdArgs = reviewFindById.mock.calls[0][0];
      expect(reviewFindByIdArgs).toEqual(reviewId);
    });
  });
});
