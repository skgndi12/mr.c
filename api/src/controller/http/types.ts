export const idTokenCookieName = 'mrcToken';

export interface HttpConfig {
  env: string;
  host: string;
  port: number;
  cookieExpirationHours: number;
}
