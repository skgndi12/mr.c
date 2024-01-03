import * as crypto from 'crypto';
import { parse } from 'querystring';

import { GoogleHandler } from '@src/core/ports/google.handler';
import { KeyValueRepository } from '@src/core/ports/keyValue.repository';
import { AuthService } from '@src/core/services/auth/auth.service';
import { AuthConfig } from '@src/core/services/auth/types';

jest.mock('crypto');

describe('Test auth service', () => {
  const oauthClientId = 'test_client_id';
  const oauthRedirectPath = '/api/v1/google/sign-in/token';
  const oauthAuthEndpoint = 'https://accounts.google.com/o/oauth2/auth';
  const host = 'localhost:8080';
  const nonce = '2fc312e4-0c04-4f93-b0bf-c9e81f244814';
  const state = '8a5c8a05-0a20-49f9-92a5-a6f83d5617e9';
  const response_type = 'code';
  const protocol = 'http';
  const scope = 'openid email';
  const access_type = 'online';
  const prompt = 'consent select_account';
  const baseUrl = `${protocol}://${host}`;
  const authConfig: AuthConfig = { oauthStateExpirationMinutes: 10 };
  let keyValueRepository: KeyValueRepository;
  let googleHandler: GoogleHandler;
  let authService: AuthService;

  beforeEach(() => {
    keyValueRepository = {
      set: jest.fn(),
      get: jest.fn()
    };
    googleHandler = {
      buildOidcRequest: jest.fn(() => {
        return encodeURI(
          `${oauthAuthEndpoint}?client_id=${oauthClientId}&nonce=${nonce}&response_type=${response_type}&redirect_uri=${baseUrl}${oauthRedirectPath}&scope=${scope}&state=${state}&access_type=${access_type}&prompt=${prompt}`
        );
      })
    };
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(state);
  });

  it('should success initiate Google sign in and return valid OIDC request', async () => {
    authService = new AuthService(
      authConfig,
      keyValueRepository,
      googleHandler
    );
    const givenReferrer = 'http://127.0.0.1/home';
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
      givenReferrer
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
        referrer: givenReferrer
      }),
      authConfig.oauthStateExpirationMinutes * 60
    );

    expect(googleHandler.buildOidcRequest).toBeCalledTimes(1);
    expect(googleHandler.buildOidcRequest).toBeCalledWith(baseUrl, state);
  });
});
