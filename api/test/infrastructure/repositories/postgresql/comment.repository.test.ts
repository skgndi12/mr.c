import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';

import { Comment } from '@src/core/entities/comment.entity';
import { User } from '@src/core/entities/user.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import {
  CreateCommentParams,
  FindCommentsParams,
  UpdateCommentParams
} from '@src/core/ports/comment.repository';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { PrismaErrorCode } from '@src/infrastructure/prisma/errors';
import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlCommentRepository } from '@src/infrastructure/repositories/postgresql/comment.repository';

describe('Test comment repository', () => {
  const logger: Partial<Logger> = {
    error: jest.fn()
  };
  let prismaClient: ExtendedPrismaClient;
  let commentRepository: PostgresqlCommentRepository;

  beforeAll(() => {
    const config = {
      host: '127.0.0.1',
      port: 5435,
      user: 'mrc-client',
      password: 'Client123!'
    };
    prismaClient = generatePrismaClient(logger as Logger, config);
    commentRepository = new PostgresqlCommentRepository(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('Test create', () => {
    const userId = randomUUID();
    const movieName = 'randomMovieName';
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
    });

    afterAll(async () => {
      await prismaClient.comment.deleteMany();
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      const params: CreateCommentParams = {
        userId,
        movieName,
        content
      };

      const commentCreated = await commentRepository.create(params);

      expect(commentCreated.getData()).toEqual(
        expect.objectContaining({
          userId,
          movieName,
          content
        })
      );
    });
  });

  describe('Test find by ID', () => {
    const userId = randomUUID();
    const createdAt = new Date();
    let commentCreated: Comment;

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
      const commentResultCreated = await prismaClient.comment.create({
        data: {
          userId,
          movieName: 'randomMovieName',
          content: 'randomContent',
          createdAt,
          updatedAt: createdAt
        }
      });
      commentCreated = commentResultCreated.convertToEntity();
    });

    afterAll(async () => {
      await prismaClient.comment.delete({ where: { id: commentCreated.id } });
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      const commentFound = await commentRepository.findById(commentCreated.id);

      expect(JSON.stringify(commentFound)).toEqual(
        JSON.stringify(commentCreated)
      );
    });

    it('should fail when no existing comment is found for the given ID', async () => {
      try {
        await commentRepository.findById(commentCreated.id + 1);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });

  describe('Test find many and count', () => {
    const users: User[] = [];
    const userCount = 3;
    const comments: Comment[] = [];
    const commentCount = 12;
    const movieNames: string[] = [randomUUID(), randomUUID(), randomUUID()];
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

      for (let i = 1; i <= commentCount; i++) {
        const createdAt = new Date(currentDate.getTime() + i * 1000);

        if (i >= 1 && i <= 4) {
          comments.push(
            new Comment(
              i,
              users[0].id,
              `${movieNames[0]}${i}`,
              content,
              createdAt,
              createdAt
            )
          );
        } else if (i >= 5 && i <= 8) {
          comments.push(
            new Comment(
              i,
              users[1].id,
              `${i}${movieNames[1]}`,
              content,
              createdAt,
              createdAt
            )
          );
        } else {
          comments.push(
            new Comment(
              i,
              users[2].id,
              `${i}${movieNames[2]}${i}`.toUpperCase(),
              content,
              createdAt,
              createdAt
            )
          );
        }
      }

      for (const comment of comments) {
        await prismaClient.comment.create({
          data: {
            id: comment.id,
            userId: comment.userId,
            movieName: comment.movieName,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
          }
        });
      }
    });

    afterAll(async () => {
      await prismaClient.comment.deleteMany();
      const userIds = users.map((user) => user.id);
      await prismaClient.user.deleteMany({
        where: { id: { in: userIds } }
      });
    });

    it('should success when pagination is valid and sorting by movieName in descending order', async () => {
      const params: FindCommentsParams = {
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'movieName',
        direction: 'desc'
      };
      const commentsSorted = comments.sort((a, b) =>
        b.movieName.localeCompare(a.movieName)
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const commentsSpliced = commentsSorted.slice(start, end);

      const actualResult = await commentRepository.findManyAndCount(params);

      expect(actualResult.commentCount).toEqual(commentCount);
      expect(JSON.stringify(actualResult.comments)).toEqual(
        JSON.stringify(commentsSpliced)
      );
    });

    it('should success when pagination is valid and sorting by createdAt in ascending order', async () => {
      const params: FindCommentsParams = {
        pageOffset: 2,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };
      const commentsSorted = comments.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const commentsSpliced = commentsSorted.slice(start, end);

      const actualResult = await commentRepository.findManyAndCount(params);

      expect(actualResult.commentCount).toEqual(commentCount);
      expect(JSON.stringify(actualResult.comments)).toEqual(
        JSON.stringify(commentsSpliced)
      );
    });

    it('should succecss when filtering by movieName, pagination is valid, and sorting by createdAt in ascending order', async () => {
      const params: FindCommentsParams = {
        movieName: movieNames[0],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const commentsFiltered = comments.filter((comment) =>
        comment.movieName.includes(movieNames[0])
      );
      const commentsSorted = commentsFiltered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const commentsSpliced = commentsSorted.slice(start, end);

      const actualResult = await commentRepository.findManyAndCount(params);

      expect(actualResult.commentCount).toEqual(commentsSpliced.length);
      expect(JSON.stringify(actualResult.comments)).toEqual(
        JSON.stringify(commentsSpliced)
      );
    });

    it('should succecss when filtering by nickname, pagination is valid, and sorting by createdAt in ascending order', async () => {
      const params: FindCommentsParams = {
        nickname: users[1].nickname,
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const commentsFiltered = comments.filter((comment) =>
        generateUserNickname(comment.userId).includes(users[1].nickname)
      );
      const commentsSorted = commentsFiltered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const commentsSpliced = commentsSorted.slice(start, end);

      const actualResult = await commentRepository.findManyAndCount(params);

      expect(actualResult.commentCount).toEqual(commentsSpliced.length);
      expect(JSON.stringify(actualResult.comments)).toEqual(
        JSON.stringify(commentsSpliced)
      );
    });

    it('should succecss when filtering by nickname and movieName, pagination is valid, and sorting by createdAt in ascending order', async () => {
      const params: FindCommentsParams = {
        nickname: users[2].nickname,
        movieName: movieNames[2],
        pageOffset: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const commentsFiltered = comments.filter(
        (comment) =>
          generateUserNickname(comment.userId).includes(users[2].nickname) &&
          comment.movieName.toUpperCase().includes(movieNames[2].toUpperCase())
      );
      const commentsSorted = commentsFiltered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const start = (params.pageOffset - 1) * params.pageSize;
      const end = start + params.pageSize;
      const commentsSpliced = commentsSorted.slice(start, end);

      const actualResult = await commentRepository.findManyAndCount(params);

      expect(actualResult.commentCount).toEqual(commentsSpliced.length);
      expect(JSON.stringify(actualResult.comments)).toEqual(
        JSON.stringify(commentsSpliced)
      );
    });

    it('should return an empty array when the page offset exceeds the available data size range', async () => {
      const params: FindCommentsParams = {
        pageOffset: 10,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const actualResult = await commentRepository.findManyAndCount(params);

      expect(actualResult.commentCount).toEqual(commentCount);
      expect(JSON.stringify(actualResult.comments)).toEqual(JSON.stringify([]));
    });

    it('should return an empty array when no data matching the condition is found', async () => {
      const params: FindCommentsParams = {
        nickname: 'randomNickname',
        movieName: 'randomMovie',
        pageOffset: 10,
        pageSize: 10,
        sortBy: 'createdAt',
        direction: 'asc'
      };

      const actualResult = await commentRepository.findManyAndCount(params);

      expect(actualResult.commentCount).toEqual(0);
      expect(JSON.stringify(actualResult.comments)).toEqual(JSON.stringify([]));
    });
  });

  describe('Test update', () => {
    const userId = randomUUID();
    const createdAt = new Date();
    const movieNameUpdated = 'updatedMovieName';
    const contentUpdated = 'updatedContent';
    const updatedAt = new Date();
    let commentCreated: Comment;

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
      const commentResultCreated = await prismaClient.comment.create({
        data: {
          userId,
          movieName: 'randomMovieName',
          content: 'randomContent',
          createdAt,
          updatedAt: createdAt
        }
      });
      commentCreated = commentResultCreated.convertToEntity();
    });

    afterAll(async () => {
      await prismaClient.comment.delete({ where: { id: commentCreated.id } });
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      const commentExpectResult = new Comment(
        commentCreated.id,
        commentCreated.userId,
        movieNameUpdated,
        contentUpdated,
        commentCreated.createdAt,
        updatedAt
      );
      const params: UpdateCommentParams = {
        id: commentCreated.id,
        movieName: movieNameUpdated,
        content: contentUpdated
      };

      const commentUpdated = await commentRepository.update(params);

      expect(commentUpdated.getData()).toEqual(
        expect.objectContaining({
          id: commentExpectResult.id,
          userId: commentExpectResult.userId,
          movieName: commentExpectResult.movieName,
          content: commentExpectResult.content,
          createdAt: commentExpectResult.createdAt
        })
      );
    });

    it('should fail to update a comment when no existing comment is found with the given ID', async () => {
      const params: UpdateCommentParams = {
        id: commentCreated.id + 1,
        movieName: movieNameUpdated,
        content: contentUpdated
      };
      try {
        await commentRepository.update(params);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });

  describe('Test delete by ID', () => {
    const userId = randomUUID();
    const createdAt = new Date();
    let commentCreated: Comment;

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
      const commentResultCreated = await prismaClient.comment.create({
        data: {
          userId,
          movieName: 'randomMovieName',
          content: 'randomContent',
          createdAt,
          updatedAt: createdAt
        }
      });
      commentCreated = commentResultCreated.convertToEntity();
    });

    afterAll(async () => {
      await prismaClient.comment.deleteMany();
      await prismaClient.user.delete({ where: { id: userId } });
    });

    it('should success when valid', async () => {
      await commentRepository.deleteById(commentCreated.id);

      try {
        await prismaClient.comment.findFirstOrThrow({
          where: { id: commentCreated.id }
        });
      } catch (error: unknown) {
        expect(error).toHaveProperty('code', PrismaErrorCode.RECORD_NOT_FOUND);
      }
    });

    it('should fail to delete a comment when no existing comment is found for the given ID', async () => {
      try {
        await commentRepository.deleteById(commentCreated.id + 1);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.NOT_FOUND);
      }
    });
  });
});
