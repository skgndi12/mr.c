import { Logger } from 'winston';

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
import { Config } from '@src/config/types';
import { AuthService } from '@src/core/services/auth/auth.service';
import { GoogleClient } from '@src/infrastructure/google/google.client';
import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';
import { PrismaTransactionManager } from '@src/infrastructure/prisma/prisma.transaction.manager';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import {
  RedisClient,
  generateRedisClient
} from '@src/infrastructure/redis/redis.client';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';
import { RedisKeyValueRepository } from '@src/infrastructure/repositories/redis/keyValue.repository';
import { JwtClient } from '@src/jwt/jwt.client';
import { initializeLogger } from '@src/logger/logger';

import { HttpServer } from '@controller/http/server';

export class ComponentHandler {
  private config!: Config;
  private logger!: Logger;
  private prismaClient!: ExtendedPrismaClient;
  private redisClient!: RedisClient;
  private httpServer!: HttpServer;
  private readonly shutdownSignals = ['SIGINT', 'SIGTERM'];

  public initialize = async () => {
    try {
      this.config = loadConfig();
    } catch (error: unknown) {
      console.error(`${error}`);
      process.exit(1);
    }

    this.logger = initializeLogger(buildLoggerConfig(this.config));

    this.prismaClient = generatePrismaClient(
      this.logger,
      buildDatabaseConfig(this.config)
    );
    const txManager = new PrismaTransactionManager(this.prismaClient);
    const userRepository = new PostgresqlUserRepository(this.prismaClient);

    this.redisClient = await generateRedisClient(
      this.logger,
      buildRedisConfig(this.config)
    );
    const keyValueRepository = new RedisKeyValueRepository(this.redisClient);

    let jwtClient;
    try {
      jwtClient = new JwtClient(buildJwtClientConfig(this.config));
    } catch (error: unknown) {
      this.logger.error('Failed to initialize JWT client', { error });
      process.exit(1);
    }
    const googleClient = new GoogleClient(buildGoogleClientConfig(this.config));

    const authService = new AuthService(
      buildAuthConfig(this.config),
      keyValueRepository,
      userRepository,
      jwtClient,
      txManager,
      googleClient
    );

    this.httpServer = new HttpServer(
      this.logger,
      buildHttpConfig(this.config),
      authService,
      jwtClient
    );
    await this.httpServer.start();
  };

  public installShutdownSignalHandler = () => {
    this.shutdownSignals.forEach((signal) =>
      process.on(signal, this.gracefulShutdown)
    );
  };

  private gracefulShutdown = async (signal: string) => {
    if (!this.httpServer.isListeninig()) {
      return;
    }

    this.logger.info(`Caught ${signal}, gracefully shutdown`);

    setTimeout(() => {
      this.logger.error(
        'Could not close connection in time, forcefully shutdown'
      );
      process.exit(1);
    }, this.config.timeout.shutdownSeconds * 1000);

    this.logger.info('Shutdown HTTP server');
    try {
      await this.httpServer.close();
    } catch (error: unknown) {
      this.logger.error('Failed to shutdown HTTP server error', { error });
    }

    this.logger.info('Shutdown Redis client');
    try {
      await this.redisClient.quit();
    } catch (error: unknown) {
      this.logger.error('Failed to shutdown redis client error', { error });
    }
    process.exit();
  };
}
