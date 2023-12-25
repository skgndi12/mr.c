import { RsaKeyPair } from '@src/jwt/types';
import { LogFormat, LogLevel } from '@src/logger/types';

export interface Config {
  env: string;
  timeout: ConfigTimeout;
  http: ConfigHttp;
  logger: ConfigLogger;
  database: ConfigDatabase;
  jwt: ConfigJwt;
  google: ConfigGoogle;
  oauth: ConfigOauth;
}

export interface ConfigTimeout {
  shutdownSeconds: number;
}

export interface ConfigHttp {
  host: string;
  port: number;
}

export interface ConfigLogger {
  level: LogLevel;
  format: LogFormat;
}

export interface ConfigDatabase {
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface ConfigJwt {
  activeKeyPair: string;
  keyPairs: RsaKeyPair[];
  expirationHour: number;
}

export interface ConfigGoogle {
  oauth: ConfigGoogleOauth;
  endpoints: ConfigGoogleEndpoints;
}

export interface ConfigGoogleOauth {
  clientId: string;
  clientSecret: string;
  redirectPath: string;
}

export interface ConfigGoogleEndpoints {
  auth: string;
  token: string;
}

export interface ConfigOauth {
  stateExpirationMinutes: number;
}
