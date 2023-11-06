import {
  buildDatabaseConfig,
  buildHttpConfig,
  buildLoggerConfig,
  loadConfig
} from '@src/config/loader';
import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';
import { PrismaTransactionManager } from '@src/infrastructure/prisma/prisma.transaction.manager';
import { PostgresqlProfileRepository } from '@src/infrastructure/repositories/postgresql/profile.repository';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';
import { initializeLogger } from '@src/logger/logger';

import { HttpServer } from '@controller/http/server';

async function main() {
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }

  const logger = initializeLogger(buildLoggerConfig(config));
  const prismaClient = generatePrismaClient(buildDatabaseConfig(config));
  const prismaTransactionManager = new PrismaTransactionManager(prismaClient);

  const profileRepository = new PostgresqlProfileRepository(prismaClient);
  const userRepository = new PostgresqlUserRepository(prismaClient);

  const httpServer = new HttpServer(logger, buildHttpConfig(config));
  await httpServer.start();
  // await httpServer.close();
  // logger.info('Server shutdowned');
}

if (require.main === module) {
  main();
}
