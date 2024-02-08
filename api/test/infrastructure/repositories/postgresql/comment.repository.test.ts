import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';

import { Comment } from '@src/core/entities/comment.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import { CreateCommentParams } from '@src/core/ports/comment.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
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
    const nickname = generateUserNickname(userId);
    const tag = generateUserTag(userId);
    const idp = Idp.GOOGLE;
    const email = 'user1001@gmail.com';
    const accessLevel = AccessLevel.USER;
    const movieName = 'randomMovieName';
    const content = 'randomContent';
    const createdAt = new Date();

    beforeAll(async () => {
      await prismaClient.user.create({
        data: {
          id: userId,
          nickname,
          tag,
          idp,
          email,
          accessLevel,
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
      const commentFound = await prismaClient.comment.findFirstOrThrow({
        where: { id: commentCreated.id }
      });

      expect(JSON.stringify(commentCreated)).toEqual(
        JSON.stringify(commentFound)
      );
    });
  });

  describe('Test find by ID', () => {
    const userId = randomUUID();
    const nickname = generateUserNickname(userId);
    const tag = generateUserTag(userId);
    const idp = Idp.GOOGLE;
    const email = 'user1002@gmail.com';
    const accessLevel = AccessLevel.USER;
    const movieName = 'randomMovieName';
    const content = 'randomContent';
    const createdAt = new Date();
    let commentCreated: Comment;

    beforeAll(async () => {
      await prismaClient.user.create({
        data: {
          id: userId,
          nickname,
          tag,
          idp,
          email,
          accessLevel,
          createdAt,
          updatedAt: createdAt
        }
      });
      const commentResultCreated = await prismaClient.comment.create({
        data: {
          userId,
          movieName,
          content,
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
});
