import { PrismaClient } from '@prisma/client';
import { Logger } from 'winston';

import { DatabaseConfig } from '@src/infrastructure/repositories/types';

export function generatePrismaClient(
  logger: Logger,
  config: DatabaseConfig
): PrismaClient {
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

  return prismaClient;
}
