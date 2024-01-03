import { KeyValueRepository } from '@src/core/ports/keyValue.repository';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { RedisClient } from '@src/infrastructure/redis/redis.client';

export class RedisKeyValueRepository implements KeyValueRepository {
  constructor(private readonly redisClient: RedisClient) {}

  public set = async (
    key: string,
    value: string,
    expirationSeconds: number
  ) => {
    await this.redisClient.set(key, value, { EX: expirationSeconds });
  };

  public get = async (key: string) => {
    return await this.redisClient.get(key).then((result) => {
      if (result === null) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'key does not exist',
          context: { key }
        });
      }
      return result;
    });
  };

  public getThenDelete = async (key: string): Promise<string> => {
    return await this.redisClient.getDel(key).then((result) => {
      if (result === null) {
        throw new CustomError({
          code: AppErrorCode.NOT_FOUND,
          message: 'key does not exist',
          context: { key }
        });
      }
      return result;
    });
  };
}
