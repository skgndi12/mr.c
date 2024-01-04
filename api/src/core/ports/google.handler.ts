export interface GoogleHandler {
  buildOidcRequest(baseUrl: string, state: string): string;
  exchangeAuthCode(baseUrl: string, authCode: string): Promise<string>;
}
