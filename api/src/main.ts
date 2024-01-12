import {
  buildAuthConfig,
  buildDatabaseConfig,
  buildGoogleClientConfig,
  buildHttpConfig,
  buildJwtClientConfig,
  buildLoggerConfig,
  buildRedisConfig,
  loadConfig
} from '@src/config/loader';
import { AuthService } from '@src/core/services/auth/auth.service';
import { GoogleClient } from '@src/infrastructure/google/google.client';
import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';
import { PrismaTransactionManager } from '@src/infrastructure/prisma/prisma.transaction.manager';
import { generateRedisClient } from '@src/infrastructure/redis/redis.client';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';
import { RedisKeyValueRepository } from '@src/infrastructure/repositories/redis/keyValue.repository';
import { JwtClient } from '@src/jwt/jwt.client';
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
  let jwtClient;
  try {
    jwtClient = new JwtClient(buildJwtClientConfig(config));
  } catch (e) {
    logger.error('Failed to initialize JWT client', { error: e });
    process.exit(1);
  }
  const prismaClient = generatePrismaClient(buildDatabaseConfig(config));
  const prismaTransactionManager = new PrismaTransactionManager(prismaClient);
  const redisClient = await generateRedisClient(
    logger,
    buildRedisConfig(config)
  );
  const keyValueRepository = new RedisKeyValueRepository(redisClient);
  const userRepository = new PostgresqlUserRepository(prismaClient);

  const googleClient = new GoogleClient(buildGoogleClientConfig(loadConfig()));
  const authService = new AuthService(
    buildAuthConfig(config),
    keyValueRepository,
    userRepository,
    jwtClient,
    prismaTransactionManager,
    googleClient
  );
  const httpServer = new HttpServer(
    logger,
    buildHttpConfig(config),
    authService,
    jwtClient
  );
  await httpServer.start();
  // await httpServer.close();
  // logger.info('Server shutdowned');
}

if (require.main === module) {
  main();
}
