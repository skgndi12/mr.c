import { Jwt } from 'jsonwebtoken';

import { AppIdToken } from '@src/core/entities/auth.entity';

export interface JwtHandler {
  signAppIdToken(appIdToken: AppIdToken): string;
  verifyAppIdToken(tokenString: string): AppIdToken;
  decodeTokenWithoutVerify(tokenString: string): Jwt;
}
