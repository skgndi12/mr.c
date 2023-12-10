import config from 'config';

import {
  Config,
  ConfigDatabase,
  ConfigHttp,
  ConfigJwt,
  ConfigLogger,
  ConfigTimeout
} from '@src/config/types';
import { HttpConfig } from '@src/controller/http/types';
import { DatabaseConfig } from '@src/infrastructure/repositories/types';
import { JwtClientConfig } from '@src/jwt/types';
import { LoggerConfig } from '@src/logger/types';

export function loadConfig(): Config {
  try {
    return {
      env: config.get<string>('env'),
      timeout: config.get<ConfigTimeout>('timeout'),
      http: config.get<ConfigHttp>('http'),
      logger: config.get<ConfigLogger>('logger'),
      database: config.get<ConfigDatabase>('database'),
      jwt: config.get<ConfigJwt>('jwt')
    };
  } catch (e) {
    throw new Error(`failed to load config error: ${e}`);
  }
}

export function buildLoggerConfig(config: Config): LoggerConfig {
  return {
    deployment: config.env,
    level: config.logger.level,
    format: config.logger.format
  };
}

export function buildHttpConfig(config: Config): HttpConfig {
  return {
    env: config.env,
    host: config.http.host,
    port: config.http.port
  };
}

export function buildDatabaseConfig(config: Config): DatabaseConfig {
  return {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password
  };
}

export function buildJwtClientConfig(config: Config): JwtClientConfig {
  return config.jwt;
}
