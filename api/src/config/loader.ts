import config from 'config';

import {
  Config,
  ConfigDatabase,
  ConfigGoogle,
  ConfigHttp,
  ConfigJwt,
  ConfigLogger,
  ConfigOauth,
  ConfigRedis,
  ConfigTimeout
} from '@src/config/types';
import { HttpConfig } from '@src/controller/http/types';
import { AuthConfig } from '@src/core/services/auth/types';
import { GoogleClientConfig } from '@src/infrastructure/google/types';
import {
  DatabaseConfig,
  RedisConfig
} from '@src/infrastructure/repositories/types';
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
      redis: config.get<ConfigRedis>('redis'),
      jwt: config.get<ConfigJwt>('jwt'),
      google: config.get<ConfigGoogle>('google'),
      oauth: config.get<ConfigOauth>('oauth')
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
    port: config.http.port,
    cookieExpirationHours: config.jwt.expirationHour
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

export function buildRedisConfig(config: Config): RedisConfig {
  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
  };
}

export function buildJwtClientConfig(config: Config): JwtClientConfig {
  return config.jwt;
}

export function buildGoogleClientConfig(config: Config): GoogleClientConfig {
  return {
    oauth: {
      clientId: config.google.oauth.clientId,
      clientSecret: config.google.oauth.clientSecret,
      redirectPath: config.google.oauth.redirectPath,
      authEndpoint: config.google.endpoints.auth,
      tokenEndpoint: config.google.endpoints.token
    }
  };
}

export function buildAuthConfig(config: Config): AuthConfig {
  return {
    oauthStateExpirationMinutes: config.oauth.stateExpirationMinutes
  };
}
