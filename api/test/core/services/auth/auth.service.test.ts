import { AccessLevel, Idp } from '@prisma/client';
import * as crypto from 'crypto';
import { parse } from 'querystring';

import { User } from '@src/core/entities/user.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import { GoogleHandler } from '@src/core/ports/google.handler';
import { JwtHandler } from '@src/core/ports/jwt.handler';
import { KeyValueRepository } from '@src/core/ports/keyValue.repository';
import { TransactionManager } from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import { AuthService } from '@src/core/services/auth/auth.service';
import { AuthConfig } from '@src/core/services/auth/types';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { AppErrorCode, CustomError } from '@src/error/errors';

jest.mock('crypto');

describe('Test auth service', () => {
  const state = '8a5c8a05-0a20-49f9-92a5-a6f83d5617e9';
  const host = 'localhost:8080';
  const protocol = 'http';
  const baseUrl = `${protocol}://${host}`;
  const referrer = 'http://127.0.0.1/home';
  const authConfig: AuthConfig = { oauthStateExpirationMinutes: 10 };
  let keyValueRepository: KeyValueRepository;
  let userRepository: UserRepository;
  let jwtHandler: JwtHandler;
  let txManager: TransactionManager;
  let googleHandler: GoogleHandler;
  let authService: AuthService;

  beforeAll(() => {
    keyValueRepository = {
      set: jest.fn(),
      get: jest.fn(),
      getThenDelete: jest.fn()
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      upsert: jest.fn(),
      deleteById: jest.fn()
    };
    jwtHandler = {
      signAppIdToken: jest.fn(),
      verifyAppIdToken: jest.fn(),
      decodeTokenWithoutVerify: jest.fn()
    };
    txManager = {
      runInTransaction: jest.fn()
    };
    googleHandler = {
      buildOidcRequest: jest.fn(),
      exchangeAuthCode: jest.fn()
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test initialize Google sign in', () => {
    const oauthClientId = 'test_client_id';
    const oauthRedirectPath = '/api/v1/google/sign-in/token';
    const oauthAuthEndpoint = 'https://accounts.google.com/o/oauth2/auth';
    const nonce = '2fc312e4-0c04-4f93-b0bf-c9e81f244814';
    const response_type = 'code';
    const scope = 'openid email';
    const access_type = 'online';
    const prompt = 'consent select_account';

    beforeAll(() => {
      googleHandler.buildOidcRequest = jest.fn(() => {
        return encodeURI(
          `${oauthAuthEndpoint}?client_id=${oauthClientId}&nonce=${nonce}&response_type=${response_type}&redirect_uri=${baseUrl}${oauthRedirectPath}&scope=${scope}&state=${state}&access_type=${access_type}&prompt=${prompt}`
        );
      });
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(state);
    });

    it('should success initiate Google sign in and return valid OIDC request', async () => {
      authService = new AuthService(
        authConfig,
        keyValueRepository,
        userRepository,
        jwtHandler,
        txManager,
        googleHandler
      );
      const expectedQueyObject = {
        client_id: oauthClientId,
        response_type,
        redirect_uri: `${baseUrl}${oauthRedirectPath}`,
        state,
        scope,
        access_type,
        prompt
      };

      const redirectUrl = await authService.initiateGoogleSignIn(
        baseUrl,
        referrer
      );
      const [authEndpoint, queryString] = redirectUrl.split('?');
      const actualQueryObject = parse(queryString);

      expect(authEndpoint).toEqual(oauthAuthEndpoint);
      expect(actualQueryObject).toEqual(
        expect.objectContaining(expectedQueyObject)
      );

      expect(keyValueRepository.set).toBeCalledTimes(1);
      expect(keyValueRepository.set).toBeCalledWith(
        actualQueryObject.state,
        JSON.stringify({
          state: state,
          referrer
        }),
        authConfig.oauthStateExpirationMinutes * 60
      );

      expect(googleHandler.buildOidcRequest).toBeCalledTimes(1);
      expect(googleHandler.buildOidcRequest).toBeCalledWith(baseUrl, state);
    });
  });

  describe('Test finalize Google sign in', () => {
    const googleIdTokenString = 'idTokenString';
    const authCode = 'randomAuthCode';
    const userId = '57cf27d8-0c74-4963-94a7-47c35741ed06';
    const nickname = generateUserNickname(userId);
    const tag = generateUserTag(userId);
    const email = 'test@gmail.com';
    const idp = new IdpEnum(Idp.GOOGLE);
    const accessLevel = new AccessLevelEnum(AccessLevel.USER);

    beforeAll(() => {
      googleHandler.exchangeAuthCode = jest.fn(() =>
        Promise.resolve(googleIdTokenString)
      );
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(userId);
    });

    it('should success when valid', async () => {
      const givenAppIdTokenString = 'appIdTokenString';
      const currentDate = new Date();
      const upsertUser = new User(
        userId,
        nickname,
        tag,
        idp,
        email,
        accessLevel,
        currentDate,
        currentDate
      );
      keyValueRepository.getThenDelete = jest.fn(() =>
        Promise.resolve(JSON.stringify({ state, referrer }))
      );
      googleHandler.exchangeAuthCode = jest.fn(() =>
        Promise.resolve(googleIdTokenString)
      );
      jwtHandler.decodeTokenWithoutVerify = jest.fn(() => {
        return {
          header: {
            alg: 'RS256',
            kid: 'kid',
            typ: 'JWT'
          },
          payload: {
            iss: 'https://accounts.google.com',
            aud: 'aud',
            sub: '103395839580300821622',
            email,
            iat: 1704189330,
            exp: 1704192930
          },
          signature: 'randomSignature'
        };
      });
      jwtHandler.signAppIdToken = jest.fn(() => givenAppIdTokenString);
      const mockRunInTransaction = jest.fn(() => Promise.resolve(upsertUser));
      txManager.runInTransaction = mockRunInTransaction as jest.Mock;

      const [actualReferrer, actualAppIdToken] = await new AuthService(
        authConfig,
        keyValueRepository,
        userRepository,
        jwtHandler,
        txManager,
        googleHandler
      ).finalizeGoogleSignIn(baseUrl, state, authCode);

      expect(actualReferrer).toEqual(referrer);
      expect(actualAppIdToken).toEqual(givenAppIdTokenString);

      expect(keyValueRepository.getThenDelete).toBeCalledTimes(1);
      expect(keyValueRepository.getThenDelete).toBeCalledWith(state);

      expect(googleHandler.exchangeAuthCode).toBeCalledTimes(1);
      expect(googleHandler.exchangeAuthCode).toBeCalledWith(baseUrl, authCode);

      expect(jwtHandler.decodeTokenWithoutVerify).toBeCalledTimes(1);
      expect(jwtHandler.decodeTokenWithoutVerify).toBeCalledWith(
        googleIdTokenString
      );

      expect(jwtHandler.signAppIdToken).toBeCalledTimes(1);
      expect(jwtHandler.signAppIdToken).toBeCalledWith(
        expect.objectContaining({
          userId: upsertUser.id,
          nickname: upsertUser.nickname,
          tag: upsertUser.tag,
          idp: upsertUser.idp,
          email: upsertUser.email,
          accessLevel: upsertUser.accessLevel
        })
      );
      expect(txManager.runInTransaction).toBeCalledTimes(1);
    });

    it('should fail when the state is not found', async () => {
      keyValueRepository.getThenDelete = jest.fn(() => {
        throw new Error();
      });

      try {
        await new AuthService(
          authConfig,
          keyValueRepository,
          userRepository,
          jwtHandler,
          txManager,
          googleHandler
        ).finalizeGoogleSignIn(baseUrl, state, authCode);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.BAD_REQUEST);
      }

      expect(keyValueRepository.getThenDelete).toBeCalledTimes(1);
      expect(keyValueRepository.getThenDelete).toBeCalledWith(state);

      expect(googleHandler.exchangeAuthCode).toBeCalledTimes(0);
      expect(jwtHandler.decodeTokenWithoutVerify).toBeCalledTimes(0);
      expect(jwtHandler.signAppIdToken).toBeCalledTimes(0);
      expect(txManager.runInTransaction).toBeCalledTimes(0);
    });

    it('should fail when the ID token does not include email', async () => {
      keyValueRepository.getThenDelete = jest.fn(() =>
        Promise.resolve(JSON.stringify({ state, referrer }))
      );
      jwtHandler.decodeTokenWithoutVerify = jest.fn(() => {
        return {
          header: {
            alg: 'RS256',
            kid: 'kid',
            typ: 'JWT'
          },
          payload: {
            iss: 'https://accounts.google.com',
            aud: 'aud',
            sub: '103395839580300821622',
            iat: 1704189330,
            exp: 1704192930
          },
          signature: 'randomSignature'
        };
      });

      try {
        await new AuthService(
          authConfig,
          keyValueRepository,
          userRepository,
          jwtHandler,
          txManager,
          googleHandler
        ).finalizeGoogleSignIn(baseUrl, state, authCode);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('code', AppErrorCode.INTERNAL_ERROR);
      }

      expect(keyValueRepository.getThenDelete).toBeCalledTimes(1);
      expect(keyValueRepository.getThenDelete).toBeCalledWith(state);

      expect(googleHandler.exchangeAuthCode).toBeCalledTimes(1);
      expect(googleHandler.exchangeAuthCode).toBeCalledWith(baseUrl, authCode);

      expect(jwtHandler.decodeTokenWithoutVerify).toBeCalledTimes(1);
      expect(jwtHandler.decodeTokenWithoutVerify).toBeCalledWith(
        googleIdTokenString
      );

      expect(jwtHandler.signAppIdToken).toBeCalledTimes(0);
      expect(txManager.runInTransaction).toBeCalledTimes(0);
    });
  });
});
