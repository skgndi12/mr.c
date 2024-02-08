import { AccessLevel, Idp } from '@prisma/client';
import { DeepMockProxy, mockClear, mockDeep } from 'jest-mock-extended';

import extendedPrisma from '@root/test/infrastructure/prisma/test.prisma.client';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';
import { CommentRepository } from '@src/core/ports/comment.repository';
import { TransactionManager } from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import { CommentService } from '@src/core/services/comment/comment.service';
import {
  CreateCommentDto,
  GetCommentsDto
} from '@src/core/services/comment/types';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { PrismaTransactionManager } from '@src/infrastructure/prisma/prisma.transaction.manager';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlCommentRepository } from '@src/infrastructure/repositories/postgresql/comment.repository';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';

jest.mock('@root/test/infrastructure/prisma/test.prisma.client', () => ({
  __esModule: true,
  default: mockDeep<ExtendedPrismaClient>()
}));

const prismaMock = extendedPrisma as DeepMockProxy<ExtendedPrismaClient>;

function calculateCommentTotalPageCount(
  commentCount: number,
  pageSize?: number
) {
  const givenPageSize = pageSize ?? 10;
  const additionalPageCount = commentCount % givenPageSize !== 0 ? 1 : 0;
  return Math.floor(commentCount / givenPageSize) + additionalPageCount;
}

describe('Test comment service', () => {
  let userRepository: UserRepository;
  let commentRepository: CommentRepository;
  let txManager: TransactionManager;

  beforeAll(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByIds: jest.fn(),
      upsert: jest.fn(),
      deleteById: jest.fn()
    };
    commentRepository = {
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

  describe('Test create comment', () => {
    const userId = 'randomId';
    const nickname = 'randomNickname';
    const tag = '#TAGG';
    const idp = new IdpEnum(Idp.GOOGLE);
    const email = 'user1@gmail.com';
    const accessLevel = new AccessLevelEnum(AccessLevel.USER);
    const movieName = 'randomMovie';
    const content = 'randomContent';
    const createdAt = new Date();
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
      createdAt,
      createdAt
    );
    const commentCreated = new Comment(
      0,
      requesterIdToken.userId,
      movieName,
      content,
      createdAt,
      createdAt
    );

    const userFindById = jest.fn(() => Promise.resolve(userFound)) as jest.Mock;
    const commentCreate = jest.fn(() =>
      Promise.resolve(commentCreated)
    ) as jest.Mock;

    beforeAll(async () => {
      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );
      userRepository = new PostgresqlUserRepository(prismaMock);
      commentRepository = new PostgresqlCommentRepository(prismaMock);
      txManager = new PrismaTransactionManager(prismaMock);
      userRepository.findById = userFindById;
      commentRepository.create = commentCreate;
    });

    it('should success when valid', async () => {
      const givenDto: CreateCommentDto = {
        requesterIdToken,
        movieName,
        content
      };
      const actualResult = await new CommentService(
        userRepository,
        commentRepository,
        txManager
      ).createComment(givenDto);

      expect(JSON.stringify(actualResult.user)).toEqual(
        JSON.stringify(userFound)
      );
      expect(JSON.stringify(actualResult.comment)).toEqual(
        JSON.stringify(commentCreated)
      );

      expect(userRepository.findById).toBeCalledTimes(1);
      const userFindByIdArgs = userFindById.mock.calls[0][0];
      expect(userFindByIdArgs).toEqual(givenDto.requesterIdToken.userId);

      expect(commentRepository.create).toBeCalledTimes(1);
      const commentCreateArgs = commentCreate.mock.calls[0][0];
      expect(commentCreateArgs).toEqual(
        expect.objectContaining({
          userId: givenDto.requesterIdToken.userId,
          movieName: givenDto.movieName,
          content: givenDto.content
        })
      );
    });
  });

  describe('Test get comments', () => {
    const userId = 'randomId';
    const nickname = 'randomNickname';
    const tag = '#TAGG';
    const idp = new IdpEnum(Idp.GOOGLE);
    const email = 'user1@gmail.com';
    const accessLevel = new AccessLevelEnum(AccessLevel.USER);
    const movieName = 'randomMovie';
    const content = 'randomContent';
    const createdAt = new Date();
    const users: User[] = [];
    const comments: Comment[] = [];
    const commentCount = 10;

    const userFindByIds = jest.fn(() => Promise.resolve(users)) as jest.Mock;
    const commentFinManyAndCount = jest.fn(() =>
      Promise.resolve({ comments, commentCount })
    ) as jest.Mock;

    beforeAll(() => {
      users.push(
        new User(
          userId,
          nickname,
          tag,
          idp,
          email,
          accessLevel,
          createdAt,
          createdAt
        )
      );

      for (let i = 1; i <= commentCount; i++) {
        comments.push(
          new Comment(i, userId, movieName, content, createdAt, createdAt)
        );
      }

      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );
      userRepository = new PostgresqlUserRepository(prismaMock);
      commentRepository = new PostgresqlCommentRepository(prismaMock);
      txManager = new PrismaTransactionManager(prismaMock);
      userRepository.findByIds = userFindByIds;
      commentRepository.findManyAndCount = commentFinManyAndCount;
    });

    it('should success when page size is not provided', async () => {
      const givenDto: GetCommentsDto = {
        nickname,
        movieName
      };
      const actualResults = await new CommentService(
        userRepository,
        commentRepository,
        txManager
      ).getComments(givenDto);
      const totalPageCount = calculateCommentTotalPageCount(commentCount);

      expect(actualResults.totalPageCount).toEqual(totalPageCount);
      expect(JSON.stringify(actualResults.users)).toEqual(
        JSON.stringify(users)
      );
      for (let i = 0; i <= 10; i++) {
        expect(JSON.stringify(actualResults.comments[i])).toEqual(
          JSON.stringify(comments[i])
        );
      }

      expect(userRepository.findByIds).toBeCalledTimes(1);
      const userFindByIdArgs = userFindByIds.mock.calls[0][0];
      expect(userFindByIdArgs).toEqual([userId]);

      expect(commentRepository.findManyAndCount).toBeCalledTimes(1);
      const commentFindManyAndCountArgs =
        commentFinManyAndCount.mock.calls[0][0];
      expect(commentFindManyAndCountArgs).toEqual(
        expect.objectContaining({
          nickname: givenDto.nickname,
          movieName: givenDto.movieName,
          sortBy: 'createdAt',
          direction: 'desc',
          pageOffset: 1,
          pageSize: 10
        })
      );
    });

    it('should success when a page size is in the range of 1 to 100', async () => {
      const givenPageSize = 5;
      const givenDto: GetCommentsDto = {
        nickname,
        movieName,
        pageSize: givenPageSize
      };
      const actualResults = await new CommentService(
        userRepository,
        commentRepository,
        txManager
      ).getComments(givenDto);
      const totalPageCount = calculateCommentTotalPageCount(
        commentCount,
        givenPageSize
      );

      expect(actualResults.totalPageCount).toEqual(totalPageCount);
      expect(JSON.stringify(actualResults.users)).toEqual(
        JSON.stringify(users)
      );
      for (let i = 0; i <= givenPageSize; i++) {
        expect(JSON.stringify(actualResults.comments[i])).toEqual(
          JSON.stringify(comments[i])
        );
      }

      expect(userRepository.findByIds).toBeCalledTimes(1);
      const userFindByIdArgs = userFindByIds.mock.calls[0][0];
      expect(userFindByIdArgs).toEqual([userId]);

      expect(commentRepository.findManyAndCount).toBeCalledTimes(1);
      const commentFindManyAndCountArgs =
        commentFinManyAndCount.mock.calls[0][0];
      expect(commentFindManyAndCountArgs).toEqual(
        expect.objectContaining({
          nickname: givenDto.nickname,
          movieName: givenDto.movieName,
          sortBy: 'createdAt',
          direction: 'desc',
          pageOffset: 1,
          pageSize: givenPageSize
        })
      );
    });

    it('should fail when page size exceeds 100', async () => {
      const givenPageSize = 101;
      const givenDto: GetCommentsDto = {
        nickname,
        movieName,
        pageSize: givenPageSize
      };
      try {
        await new CommentService(
          userRepository,
          commentRepository,
          txManager
        ).getComments(givenDto);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.BAD_REQUEST);
      }

      expect(userRepository.findByIds).toBeCalledTimes(0);
      expect(commentRepository.findManyAndCount).toBeCalledTimes(0);
    });
  });
});
