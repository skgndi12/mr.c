export interface GoogleHandler {
  buildOidcRequest(protocol: string, state: string): string;
}
