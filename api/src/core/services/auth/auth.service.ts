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

  public initiateGoogleSignIn = (
    protocol: string,
    referrer: string | null
  ): string => {
    const state = randomUUID();
    const stateTokenString = JSON.stringify({ state, referrer });
    this.keyValueRepository.set(
      state,
      stateTokenString,
      this.config.oauthStateExpirationMinutes * 60
    );
    return this.googleHandler.buildOidcRequest(protocol, state);
  };
}
