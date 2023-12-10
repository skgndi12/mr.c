import { AppIdToken } from '@src/core/entities/auth.entity';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { isStringEnumValue } from '@src/util/guard';

export const mrcIssuer = 'movie-reivew-comment';

export interface AppPayload {
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  userId: string;
  nickname: string;
  tag: string;
  idp: IdpEnum;
  email: string;
  accessLevel: AccessLevelEnum;
}

export function createAppPayload(
  appIdToken: AppIdToken,
  ttl: number
): AppPayload {
  const currentSeconds = Math.floor(Date.now() / 1000);
  const expirationSeconds = currentSeconds + ttl * 60 * 60;

  return {
    iss: mrcIssuer,
    iat: currentSeconds,
    nbf: currentSeconds,
    exp: expirationSeconds,
    userId: appIdToken.userId,
    nickname: appIdToken.nickname,
    tag: appIdToken.tag,
    idp: appIdToken.idp,
    email: appIdToken.email,
    accessLevel: appIdToken.accessLevel
  };
}

export function convertToAppIdToken(appPayload: AppPayload): AppIdToken {
  return {
    userId: appPayload.userId,
    nickname: appPayload.nickname,
    tag: appPayload.tag,
    idp: appPayload.idp,
    email: appPayload.email,
    accessLevel: appPayload.accessLevel
  };
}

export function isAppPayload(payload: unknown): payload is AppPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'iss' in payload &&
    typeof (payload as Record<string, unknown>).iss === 'string' &&
    'iat' in payload &&
    typeof (payload as Record<string, unknown>).iat === 'number' &&
    'nbf' in payload &&
    typeof (payload as Record<string, unknown>).nbf === 'number' &&
    'exp' in payload &&
    typeof (payload as Record<string, unknown>).exp === 'number' &&
    'userId' in payload &&
    typeof (payload as Record<string, unknown>).userId === 'string' &&
    'nickname' in payload &&
    typeof (payload as Record<string, unknown>).nickname === 'string' &&
    'tag' in payload &&
    typeof (payload as Record<string, unknown>).tag === 'string' &&
    'idp' in payload &&
    typeof (payload as Record<string, unknown>).idp === 'string' &&
    isStringEnumValue(payload.idp, IdpEnum) &&
    'email' in payload &&
    typeof (payload as Record<string, unknown>).email === 'string' &&
    'accessLevel' in payload &&
    typeof (payload as Record<string, unknown>).accessLevel === 'string' &&
    isStringEnumValue(payload.accessLevel, AccessLevelEnum)
  );
}
