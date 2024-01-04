import axios from 'axios';
import { randomUUID } from 'crypto';
import { stringify } from 'querystring';

import { GoogleHandler } from '@src/core/ports/google.handler';
import { AppErrorCode, CustomError } from '@src/error/errors';
import {
  GoogleClientConfig,
  GoogleOauthTokenResponse
} from '@src/infrastructure/google/types';

export class GoogleClient implements GoogleHandler {
  constructor(private readonly config: GoogleClientConfig) {}

  public buildOidcRequest = (baseUrl: string, state: string): string => {
    const queryString = stringify({
      client_id: this.config.oauth.clientId,
      nonce: randomUUID(),
      response_type: 'code',
      redirect_uri: `${baseUrl}${this.config.oauth.redirectPath}`,
      scope: 'openid email',
      state: state,
      access_type: 'online',
      prompt: 'consent select_account'
    });

    return `${this.config.oauth.authEndpoint}?${queryString}`;
  };

  public exchangeAuthCode = async (
    baseUrl: string,
    authCode: string
  ): Promise<string> => {
    const encodedBody = new URLSearchParams({
      code: authCode,
      client_id: this.config.oauth.clientId,
      client_secret: this.config.oauth.clientSecret,
      redirect_uri: `${baseUrl}${this.config.oauth.redirectPath}`,
      grant_type: 'authorization_code'
    });
    const requestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios.post(
      this.config.oauth.tokenEndpoint,
      encodedBody,
      requestConfig
    );

    if (!(response.status >= 200 && response.status < 400)) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        message: 'failed to request OAuth token',
        context: { response }
      });
    }

    if (!this.validateGoogleOauthTokenResponse(response.data)) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        message: 'not a valid google token response',
        context: { body: response.data }
      });
    }

    return response.data.id_token;
  };

  private validateGoogleOauthTokenResponse = (
    response: unknown
  ): response is GoogleOauthTokenResponse => {
    return (
      typeof response === 'object' &&
      response !== null &&
      'access_token' in response &&
      typeof response.access_token === 'string' &&
      'expires_in' in response &&
      typeof response.expires_in === 'number' &&
      'id_token' in response &&
      typeof response.id_token === 'string' &&
      'scope' in response &&
      typeof response.scope === 'string' &&
      'token_type' in response &&
      typeof response.token_type === 'string'
    );
  };
}
