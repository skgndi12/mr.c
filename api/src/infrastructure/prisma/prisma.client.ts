import { PrismaClient } from '@prisma/client';
import { User as UserModel } from '@prisma/client';
import { Logger } from 'winston';

import { User } from '@src/core/entities/user.entity';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { DatabaseConfig } from '@src/infrastructure/repositories/types';

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

  const extendedPrismaClient = prismaClient.$extends({
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
              return {
                id: user.id,
                nickname: user.nickname,
                tag: user.tag,
                idp: new IdpEnum(user.idp),
                email: user.email,
                accessLevel: new AccessLevelEnum(user.accessLevel),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              };
            };
          }
        }
      }
    }
  });

  return extendedPrismaClient;
}
