import { AppIdToken } from '@src/core/entities/auth.entity';

export interface JwtHandler {
  signAppIdToken(appIdToken: AppIdToken): string;
  verifyAppIdToken(token: string): AppIdToken;
}
