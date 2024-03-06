import { Prisma, PrismaClient } from '@prisma/client';
import {
  Comment as CommentModel,
  Reply as ReplyModel,
  User as UserModel
} from '@prisma/client';
import { Logger } from 'winston';

import { Comment } from '@src/core/entities/comment.entity';
import { Reply } from '@src/core/entities/review.entity';
import { User } from '@src/core/entities/user.entity';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { DatabaseConfig } from '@src/infrastructure/repositories/types';

export const extension = Prisma.defineExtension({
  result: {
    user: {
      convertToEntity: {
        needs: {
          id: true,
          nickname: true,
          tag: true,
          idp: true,
          email: true,
          accessLevel: true,
          createdAt: true,
          updatedAt: true
        },
        compute(user: UserModel) {
          return (): User => {
            return new User(
              user.id,
              user.nickname,
              user.tag,
              new IdpEnum(user.idp),
              user.email,
              new AccessLevelEnum(user.accessLevel),
              user.createdAt,
              user.updatedAt
            );
          };
        }
      }
    },
    comment: {
      convertToEntity: {
        needs: {
          id: true,
          userId: true,
          movieName: true,
          content: true,
          createdAt: true,
          updatedAt: true
        },
        compute(comment: CommentModel) {
          return (): Comment => {
            return new Comment(
              comment.id,
              comment.userId,
              comment.movieName,
              comment.content,
              comment.createdAt,
              comment.updatedAt
            );
          };
        }
      }
    },
    reply: {
      convertToEntity: {
        needs: {
          id: true,
          reviewId: true,
          userId: true,
          content: true,
          createdAt: true,
          updatedAt: true
        },
        compute(reply: ReplyModel) {
          return (): Reply => {
            return new Reply(
              reply.id,
              reply.reviewId,
              reply.userId,
              reply.content,
              reply.createdAt,
              reply.updatedAt
            );
          };
        }
      }
    }
  }
});

export function generatePrismaClient(logger: Logger, config: DatabaseConfig) {
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/mrc`
      }
    }
  });

  prismaClient.$on('beforeExit', async () => {
    logger.info('Shutdown prisma client');
  });

  const extendedPrismaClient = prismaClient.$extends(extension);

  return extendedPrismaClient;
}
