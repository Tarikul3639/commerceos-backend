export interface AuthTokensPayload {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}