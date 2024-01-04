import { randomUUID } from 'crypto';

import { GoogleHandler } from '@src/core/ports/google.handler';
import { KeyValueRepository } from '@src/core/ports/keyValue.repository';
import { AuthConfig } from '@src/core/services/auth/types';

export class AuthService {
  constructor(
    private readonly config: AuthConfig,
    private readonly keyValueRepository: KeyValueRepository,
    private readonly googleHandler: GoogleHandler
  ) {}

  public initiateGoogleSignIn = async (
    baseUrl: string,
    referrer: string | null
  ): Promise<string> => {
    const state = randomUUID();
    const stateTokenString = JSON.stringify({ state, referrer });
    await this.keyValueRepository.set(
      state,
      stateTokenString,
      this.config.oauthStateExpirationMinutes * 60
    );
    return this.googleHandler.buildOidcRequest(baseUrl, state);
  };
}
