import { AccessLevel, Idp } from '@prisma/client';
import * as crypto from 'crypto';
import { DeepMockProxy, mockClear, mockDeep } from 'jest-mock-extended';
import { parse } from 'querystring';

import extendedPrisma from '@root/test/infrastructure/prisma/test.prisma.client';

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
import { PrismaTransactionManager } from '@src/infrastructure/prisma/prisma.transaction.manager';
import { ExtendedPrismaClient } from '@src/infrastructure/prisma/types';
import { PostgresqlUserRepository } from '@src/infrastructure/repositories/postgresql/user.repository';

jest.mock('crypto');
jest.mock('@root/test/infrastructure/prisma/test.prisma.client', () => ({
  __esModule: true,
  default: mockDeep<ExtendedPrismaClient>()
}));

const prismaMock = extendedPrisma as DeepMockProxy<ExtendedPrismaClient>;

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
    mockClear(prismaMock);
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
      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(userId);
    });

    it('should success and create a user when no matching user exists', async () => {
      const givenAppIdTokenString = 'appIdTokenString';
      const currentDate = new Date();
      const userUpserted = new User(
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
      userRepository = new PostgresqlUserRepository(prismaMock);
      txManager = new PrismaTransactionManager(prismaMock);
      const userFindByEmail = jest.fn(() =>
        Promise.reject(new CustomError({ code: AppErrorCode.NOT_FOUND }))
      ) as jest.Mock;
      const userUpsert = jest.fn(() =>
        Promise.resolve(userUpserted)
      ) as jest.Mock;
      userRepository.findByEmail = userFindByEmail;
      userRepository.upsert = userUpsert;

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

      expect(userRepository.findByEmail).toBeCalledTimes(1);
      const userFindByEmailArgs = userFindByEmail.mock.calls[0][0];
      expect(userFindByEmailArgs).toEqual(email);

      expect(userRepository.upsert).toBeCalledTimes(1);
      const userUpsertArgs = userUpsert.mock.calls[0][0];
      expect(userUpsertArgs.getData()).toEqual(
        expect.objectContaining({
          id: userId,
          nickname,
          tag,
          idp: idp.get(),
          email,
          accessLevel: accessLevel.get()
        })
      );

      expect(jwtHandler.signAppIdToken).toBeCalledTimes(1);
      expect(jwtHandler.signAppIdToken).toBeCalledWith(
        expect.objectContaining({
          userId: userUpserted.id,
          nickname: userUpserted.nickname,
          tag: userUpserted.tag,
          idp: userUpserted.idp,
          email: userUpserted.email,
          accessLevel: userUpserted.accessLevel
        })
      );
    });

    it('should success and return a valid ID token when a matching user exists', async () => {
      const givenAppIdTokenString = 'appIdTokenString';
      const currentDate = new Date();
      const userFound = new User(
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

      userRepository = new PostgresqlUserRepository(prismaMock);
      txManager = new PrismaTransactionManager(prismaMock);
      const userFindByEmail = jest.fn(() =>
        Promise.resolve(userFound)
      ) as jest.Mock;
      userRepository.findByEmail = userFindByEmail;
      userRepository.upsert = jest.fn();

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

      expect(userRepository.findByEmail).toBeCalledTimes(1);
      const userFindByEmailArgs = userFindByEmail.mock.calls[0][0];
      expect(userFindByEmailArgs).toEqual(email);

      expect(userRepository.upsert).toBeCalledTimes(0);

      expect(jwtHandler.signAppIdToken).toBeCalledTimes(1);
      expect(jwtHandler.signAppIdToken).toBeCalledWith(
        expect.objectContaining({
          userId: userFound.id,
          nickname: userFound.nickname,
          tag: userFound.tag,
          idp: userFound.idp,
          email: userFound.email,
          accessLevel: userFound.accessLevel
        })
      );
    });

    it('should fail when the state is not found', async () => {
      keyValueRepository.getThenDelete = jest.fn(() => {
        throw new Error();
      });
      txManager.runInTransaction = jest.fn();

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
      txManager.runInTransaction = jest.fn();

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
