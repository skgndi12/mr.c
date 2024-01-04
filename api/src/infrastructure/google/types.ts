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
