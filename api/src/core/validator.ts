import { GoogleIdToken } from '@src/core/entities/auth.entity';

export function validateGoogleIdToken(token: unknown): token is GoogleIdToken {
  return (
    typeof token === 'object' &&
    token !== null &&
    'iss' in token &&
    typeof token.iss === 'string' &&
    'aud' in token &&
    typeof token.aud === 'string' &&
    'sub' in token &&
    typeof token.sub === 'string' &&
    'email' in token &&
    typeof token.email === 'string' &&
    'iat' in token &&
    typeof token.iat === 'number' &&
    'exp' in token &&
    typeof token.exp === 'number'
  );
}
