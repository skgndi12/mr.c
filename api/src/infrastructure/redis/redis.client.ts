import redis, { RedisClientType, createClient } from 'redis';
import { Logger } from 'winston';

import { RedisConfig } from '@src/infrastructure/repositories/types';

export type RedisClient = RedisClientType<
  redis.RedisModules,
  redis.RedisFunctions,
  redis.RedisScripts
>;

export async function generateRedisClient(
  logger: Logger,
  config: RedisConfig
): Promise<RedisClient> {
  const client = createClient({
    url: `redis://:${config.password}@${config.host}:${config.port}`
  });

  client.on('error', (e) => logger.error('Redis Client Error', { error: e }));

  await client.connect();

  return client;
}
