export interface GoogleHandler {
  buildOidcRequest(baseUrl: string, state: string): string;
}
