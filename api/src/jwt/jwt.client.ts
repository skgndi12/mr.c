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
    this.keyChain = new Map<string, RsaKeyPair>();
    config.keyPairs.forEach((keyPair: RsaKeyPair) => {
      this.keyChain.set(keyPair.name, keyPair);
    });

    const activeKeyPair = this.keyChain.get(config.activeKeyPair);
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
      throw new CustomError(
        AppErrorCode.BAD_REQUEST,
        error,
        'failed to verify token'
      );
    }

    if (!this.isJwt(token)) {
      throw new CustomError(
        AppErrorCode.BAD_REQUEST,
        new Error(`not a valid JWT format: ${token}`),
        'not a valid JWT format'
      );
    }

    if (!isAppPayload(token.payload)) {
      throw new CustomError(
        AppErrorCode.BAD_REQUEST,
        new Error(`unexpected app payload format: ${token.payload}`),
        'unexpected app payload format'
      );
    }

    return convertToAppIdToken(token.payload);
  };

  private getValidKeyPair = (tokenString: string): RsaKeyPair => {
    const token = decode(tokenString, this.getDecodeOptions());

    if (!this.isJwt(token)) {
      throw new CustomError(
        AppErrorCode.BAD_REQUEST,
        new Error(`not a valid JWT format: ${token}`),
        'not a valid JWT format'
      );
    }

    if (!token.header.kid) {
      throw new CustomError(
        AppErrorCode.BAD_REQUEST,
        new Error('kid does not exist in token'),
        'kid does not exist in token'
      );
    }

    const keyPair = this.keyChain.get(token.header.kid);
    if (!keyPair) {
      throw new CustomError(
        AppErrorCode.BAD_REQUEST,
        new Error(`kid(${token.header.kid}) is not found from key chain`),
        'kid is not found from key chain'
      );
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
