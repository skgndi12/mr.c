import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { User } from '@src/core/entities/user.entity';
import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';
import { GoogleHandler } from '@src/core/ports/google.handler';
import { JwtHandler } from '@src/core/ports/jwt.handler';
import { KeyValueRepository } from '@src/core/ports/keyValue.repository';
import {
  TransactionClient,
  TransactionManager
} from '@src/core/ports/transaction.manager';
import { UserRepository } from '@src/core/ports/user.repository';
import { AuthConfig, OauthState } from '@src/core/services/auth/types';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { validateGoogleIdToken } from '@src/core/validator';
import { AppErrorCode, CustomError } from '@src/error/errors';
import { IsolationLevel } from '@src/infrastructure/repositories/types';

export class AuthService {
  constructor(
    private readonly config: AuthConfig,
    private readonly keyValueRepository: KeyValueRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtHandler: JwtHandler,
    private readonly txManager: TransactionManager,
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

  public finalizeGoogleSignIn = async (
    baseUrl: string,
    state: string,
    authCode: string
  ): Promise<[string, string]> => {
    let stateTokenString: string;
    try {
      stateTokenString = await this.keyValueRepository.getThenDelete(state);
    } catch (error: unknown) {
      throw new CustomError({
        code: AppErrorCode.BAD_REQUEST,
        cause: error,
        message: 'OAuth state not found',
        context: { state }
      });
    }

    const tokenString = await this.googleHandler.exchangeAuthCode(
      baseUrl,
      authCode
    );
    const { payload } = this.jwtHandler.decodeTokenWithoutVerify(tokenString);

    if (!validateGoogleIdToken(payload)) {
      throw new CustomError({
        code: AppErrorCode.INTERNAL_ERROR,
        message: 'not a valid google ID token',
        context: { idToken: payload }
      });
    }

    const user = await this.txManager.runInTransaction(
      async (txClient: TransactionClient): Promise<User> => {
        let userFound: User | null;
        let userId: string;
        let userNickname: string;
        let userTag: string;
        let currentDate: Date;
        let userToCreate!: User;

        try {
          userFound = await this.userRepository.findByEmail(
            payload.email,
            txClient
          );
        } catch (error: unknown) {
          if (
            error instanceof CustomError &&
            error.code === AppErrorCode.NOT_FOUND
          ) {
            userFound = null;
          } else {
            throw error;
          }
        }

        switch (userFound) {
          case null:
            userId = randomUUID();
            userNickname = generateUserNickname(userId);
            userTag = generateUserTag(userId);
            currentDate = new Date();
            userToCreate = new User(
              userId,
              userNickname,
              userTag,
              new IdpEnum(Idp.GOOGLE),
              payload.email,
              new AccessLevelEnum(AccessLevel.USER),
              currentDate,
              currentDate
            );
            return await this.userRepository.upsert(userToCreate, txClient);
          default:
            return userFound;
        }
      },
      IsolationLevel.READ_COMMITTED
    );

    const appIdToken = this.jwtHandler.signAppIdToken(
      new AppIdToken(
        user.id,
        user.nickname,
        user.tag,
        user.idp,
        user.email,
        user.accessLevel
      )
    );

    const { referrer } = JSON.parse(stateTokenString) as OauthState;
    if (referrer) {
      return [referrer, appIdToken];
    }
    return [baseUrl, appIdToken];
  };
}
