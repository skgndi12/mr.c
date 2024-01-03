import { randomUUID } from 'crypto';
import { stringify } from 'querystring';

import { GoogleHandler } from '@src/core/ports/google.handler';
import { GoogleClientConfig } from '@src/infrastructure/google/types';

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
}
