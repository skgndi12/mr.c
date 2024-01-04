export interface AuthConfig {
  oauthStateExpirationMinutes: number;
}

export interface OauthState {
  state: string;
  referrer: string | null;
}
