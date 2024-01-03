import axios from 'axios';
import { randomUUID } from 'crypto';
import { parse } from 'querystring';

import { CustomError } from '@src/error/errors';
import { GoogleClient } from '@src/infrastructure/google/google.client';

jest.mock('axios');

describe('Test google client', () => {
  const config = {
    oauth: {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      redirectPath: '/api/v1/google/sign-in/token',
      authEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token'
    }
  };
  const baseUrl = 'http://localhost:8080';
  let client: GoogleClient;

  beforeAll(() => {
    client = new GoogleClient(config);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test build OIDC request', () => {
    it('should build valid OIDC request', () => {
      const givenState = randomUUID();
      const expectedQueyObject = {
        client_id: config.oauth.clientId,
        response_type: 'code',
        redirect_uri: `${baseUrl}${config.oauth.redirectPath}`,
        scope: 'openid email',
        state: givenState,
        access_type: 'online',
        prompt: 'consent select_account'
      };

      const result = client.buildOidcRequest(baseUrl, givenState);
      const [authEndpoint, queryString] = result.split('?');

      expect(authEndpoint).toEqual(config.oauth.authEndpoint);
      expect(parse(queryString)).toEqual(
        expect.objectContaining(expectedQueyObject)
      );
    });
  });

  describe('Test exchange auth code', () => {
    const authCode = 'randomAuthCode';
    const requestConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };
    const response = {
      status: 200,
      data: {
        access_token: 'access_token',
        expires_in: 3600,
        scope: 'https://www.googleapis.com/auth/userinfo.email openid',
        token_type: 'Bearer',
        id_token: 'id_token'
      },
      getHttpStatusCode: jest.fn(() => {
        return 200;
      })
    };
    const encodedBody = new URLSearchParams({
      code: authCode,
      client_id: config.oauth.clientId,
      client_secret: config.oauth.clientSecret,
      redirect_uri: `${baseUrl}${config.oauth.redirectPath}`,
      grant_type: 'authorization_code'
    });

    it('should success when valid', async () => {
      response.status = 200;
      response.getHttpStatusCode = jest.fn(() => {
        return 200;
      });
      jest.spyOn(axios, 'post').mockResolvedValue(response);

      const result = await client.exchangeAuthCode(baseUrl, authCode);

      expect(result).toEqual(response.data.id_token);
      expect(axios.post).toBeCalledTimes(1);
      expect(axios.post).toBeCalledWith(
        config.oauth.tokenEndpoint,
        encodedBody,
        requestConfig
      );
    });

    it('should fail when token API request fails', async () => {
      response.status = 400;
      response.getHttpStatusCode = jest.fn(() => {
        return 400;
      });

      jest.spyOn(axios, 'post').mockResolvedValue(response);

      expect(client.exchangeAuthCode(baseUrl, authCode)).rejects.toThrowError(
        CustomError
      );
      expect(axios.post).toBeCalledTimes(1);
      expect(axios.post).toBeCalledWith(
        config.oauth.tokenEndpoint,
        encodedBody,
        requestConfig
      );
    });

    it('should fail when token response does not include ID token', async () => {
      const givenResponse = {
        status: 200,
        data: {
          access_token: 'access_token',
          expires_in: 3600,
          scope: 'https://www.googleapis.com/auth/userinfo.email openid',
          token_type: 'Bearer'
        },
        getHttpStatusCode: jest.fn(() => {
          return 200;
        })
      };

      jest.spyOn(axios, 'post').mockResolvedValue(givenResponse);

      expect(client.exchangeAuthCode(baseUrl, authCode)).rejects.toThrowError(
        CustomError
      );
      expect(axios.post).toBeCalledTimes(1);
      expect(axios.post).toBeCalledWith(
        config.oauth.tokenEndpoint,
        encodedBody,
        requestConfig
      );
    });
  });
});
