export type GoogleSignInTokenV1QueryParameter = {
  state: string;
  code: string;
  /**@allowReserved */
  scope: string;
  authuser: number;
  prompt: string;
};
