import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';

import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import { CreateCommentParams } from '@src/core/ports/comment.repository';
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
});
