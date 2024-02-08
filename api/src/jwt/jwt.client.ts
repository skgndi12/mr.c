import {
  Algorithm,
  DecodeOptions,
  Jwt,
  SignOptions,
  VerifyOptions,
  decode,
  sign,
  verify
} from 'jsonwebtoken';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { JwtHandler } from '@src/core/ports/jwt.handler';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  convertToAppIdToken,
  createAppPayload,
  isAppPayload,
  mrcIssuer
} from '@src/jwt/payload';
import { JwtClientConfig, RsaKeyChain, RsaKeyPair } from '@src/jwt/types';

export class JwtClient implements JwtHandler {
  activeKeyPair!: RsaKeyPair;
  keyChain!: RsaKeyChain;
  algorithm: Algorithm = 'RS256';

  constructor(private readonly config: JwtClientConfig) {
    this.keyChain = Object.fromEntries(
      this.config.keyPairs.map((keyPair) => [keyPair.name, keyPair])
    );

    const activeKeyPair = this.keyChain[config.activeKeyPair];
    if (activeKeyPair) {
      this.activeKeyPair = activeKeyPair;
    } else {
      throw new Error('activeKeyPair is not set');
    }
  }

  public signAppIdToken = (appIdToken: AppIdToken): string => {
    const tokenString = sign(
      createAppPayload(appIdToken, this.config.expirationHour),
      this.activeKeyPair.private,
      this.getSignOptions()
    );
    return tokenString;
  };

  public verifyAppIdToken = (tokenString: string): AppIdToken => {
    const keyPair = this.getValidKeyPair(tokenString);
    let token;
    try {
      token = verify(tokenString, keyPair.public, this.getVerifyOptions());
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        cause: error,
        message: 'failed to verify token',
        context: typeof token === 'string' ? { token } : token
      });
    }

    if (!this.isJwt(token)) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        message: 'not a valid JWT format',
        context: typeof token === 'string' ? { token } : token
      });
    }

    if (!isAppPayload(token.payload)) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        message: 'unexpected app payload format',
        context: { payload: token.payload }
      });
    }

    return convertToAppIdToken(token.payload);
  };

  public decodeTokenWithoutVerify(tokenString: string): Jwt {
    const token = decode(tokenString, this.getDecodeOptions());

    if (!this.isJwt(token)) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        message: 'not a valid JWT format',
        context: !token || typeof token === 'string' ? { token } : token
      });
    }

    return token;
  }

  private getValidKeyPair = (tokenString: string): RsaKeyPair => {
    const token = decode(tokenString, this.getDecodeOptions());

    if (!this.isJwt(token)) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        message: 'not a valid JWT format',
        context: !token || typeof token === 'string' ? { token } : token
      });
    }

    if (token.header.kid === undefined) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        message: 'kid does not exist in token'
      });
    }

    const keyPair = this.keyChain[token.header.kid];
    if (keyPair === undefined) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        message: 'kid is not found from key chain',
        context: { kid: token.header.kid }
      });
    }

    return keyPair;
  };

  private getSignOptions = (): SignOptions => {
    return {
      algorithm: this.algorithm,
      keyid: this.activeKeyPair.name
    };
  };

  private getDecodeOptions = (): DecodeOptions => {
    return {
      complete: true
    };
  };

  private getVerifyOptions = (): VerifyOptions => {
    return {
      algorithms: [this.algorithm],
      complete: true,
      issuer: mrcIssuer
    };
  };

  private isJwt = (jwt: unknown): jwt is Jwt => {
    return (
      typeof jwt === 'object' &&
      jwt !== null &&
      'header' in jwt &&
      typeof jwt.header === 'object' &&
      'payload' in jwt &&
      typeof jwt.payload === 'object' &&
      'signature' in jwt &&
      typeof jwt.signature === 'string'
    );
  };
}
