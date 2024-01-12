export type GoogleSignInTokenV1Query = {
  state: string;
  code: string;
  /**@allowReserved */
  scope: string;
  authuser: number;
  prompt: string;
};
