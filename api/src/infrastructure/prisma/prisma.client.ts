import { PrismaClient } from '@prisma/client';

import { DatabaseConfig } from '@src/infrastructure/repositories/types';

export function generatePrismaClient(config: DatabaseConfig): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/mrc`
      }
    }
  });
}
