export interface GoogleClientConfig {
  oauth: GoogleOauthConfig;
}

interface GoogleOauthConfig {
  clientId: string;
  clientSecret: string;
  redirectPath: string;
  authEndpoint: string;
  tokenEndpoint: string;
}

export interface GoogleOauthTokenResponse {
  access_token: string;
  expires_in: string;
  id_token: string;
  scope: string;
  token_type: string;
}
