export interface GoogleClientConfig {
  oauth: GoogleOauthConfig;
}

interface GoogleOauthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authEndpoint: string;
  tokenEndpoint: string;
}
