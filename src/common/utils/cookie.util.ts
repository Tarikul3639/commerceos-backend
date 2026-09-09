import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import ms, { StringValue } from 'ms';

import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  USER_ACCESS_TOKEN_COOKIE,
  USER_REFRESH_TOKEN_COOKIE,
} from '../constants/cookie.constants';

/**
 * Utility class for handling cookie operations
 */
export class CookieUtil {
  /**
   * Get base cookie options
   * @param configService - The configuration service
   * @returns The base cookie options
   */

  private static getBaseCookieOptions(
    configService: ConfigService,
  ): CookieOptions {
    return {
      httpOnly: true,
      secure: configService.getOrThrow<boolean>('app.isProduction'),
      sameSite: 'lax',
      path: '/',
    };
  }

  /**
   * Get user access token cookie options
   * @param configService - The configuration service
   * @returns The user access token cookie options
   */

  private static getUserAccessCookieOptions(
    configService: ConfigService,
  ): CookieOptions {
    const expiresIn = configService.getOrThrow<StringValue>(
      'auth.user.accessExpiresIn',
    );

    return {
      ...this.getBaseCookieOptions(configService),
      maxAge: ms(expiresIn),
    };
  }

  /**
   * Get user refresh token cookie options
   * @param configService - The configuration service
   * @returns The user refresh token cookie options
   */

  private static getUserRefreshCookieOptions(
    configService: ConfigService,
  ): CookieOptions {
    const expiresIn = configService.getOrThrow<StringValue>(
      'auth.user.refreshExpiresIn',
    );

    return {
      ...this.getBaseCookieOptions(configService),
      maxAge: ms(expiresIn),
    };
  }

  /**
   * Set user access token cookie
   */

  static setUserAccessToken(
    response: Response,
    token: string,
    configService: ConfigService,
  ): void {
    response.cookie(
      USER_ACCESS_TOKEN_COOKIE,
      token,
      this.getUserAccessCookieOptions(configService),
    );
  }

  /**
   * Set user refresh token cookie
   * @param response - The response object
   * @param token - The refresh token
   * @param configService - The configuration service
   */

  static setUserRefreshToken(
    response: Response,
    token: string,
    configService: ConfigService,
  ): void {
    response.cookie(
      USER_REFRESH_TOKEN_COOKIE,
      token,
      this.getUserRefreshCookieOptions(configService),
    );
  }

  /**
   * Clear user access token cookie
   * @param response - The response object
   * @param configService - The configuration service
   */
  static clearUserAccessToken(
    response: Response,
    configService: ConfigService,
  ): void {
    response.clearCookie(
      USER_ACCESS_TOKEN_COOKIE,
      this.getBaseCookieOptions(configService),
    );
  }

  /**
   * Clear user refresh token cookie
   * @param response - The response object
   * @param configService - The configuration service
   */
  static clearUserRefreshToken(
    response: Response,
    configService: ConfigService,
  ): void {
    response.clearCookie(
      USER_REFRESH_TOKEN_COOKIE,
      this.getBaseCookieOptions(configService),
    );
  }

  /**
   * Clear all user authentication cookies
   * @param response - The response object
   * @param configService - The configuration service
   */
  static clearUserAuthCookies(
    response: Response,
    configService: ConfigService,
  ): void {
    this.clearUserAccessToken(response, configService);
    this.clearUserRefreshToken(response, configService);
  }

  // ============================
  // CUSTOMER AUTH COOKIES
  // ============================

  private static getCustomerAccessCookieOptions(
    configService: ConfigService,
  ): CookieOptions {
    const expiresIn = configService.getOrThrow<StringValue>(
      'auth.customer.accessExpiresIn',
    );

    return {
      ...this.getBaseCookieOptions(configService),
      maxAge: ms(expiresIn),
    };
  }

  private static getCustomerRefreshCookieOptions(
    configService: ConfigService,
  ): CookieOptions {
    const expiresIn = configService.getOrThrow<StringValue>(
      'auth.customer.refreshExpiresIn',
    );

    return {
      ...this.getBaseCookieOptions(configService),
      maxAge: ms(expiresIn),
    };
  }

  static setCustomerAccessToken(
    response: Response,
    token: string,
    configService: ConfigService,
  ): void {
    response.cookie(
      CUSTOMER_ACCESS_TOKEN_COOKIE,
      token,
      this.getCustomerAccessCookieOptions(configService),
    );
  }

  static setCustomerRefreshToken(
    response: Response,
    token: string,
    configService: ConfigService,
  ): void {
    response.cookie(
      CUSTOMER_REFRESH_TOKEN_COOKIE,
      token,
      this.getCustomerRefreshCookieOptions(configService),
    );
  }

  static clearCustomerAccessToken(
    response: Response,
    configService: ConfigService,
  ): void {
    response.clearCookie(
      CUSTOMER_ACCESS_TOKEN_COOKIE,
      this.getBaseCookieOptions(configService),
    );
  }

  static clearCustomerRefreshToken(
    response: Response,
    configService: ConfigService,
  ): void {
    response.clearCookie(
      CUSTOMER_REFRESH_TOKEN_COOKIE,
      this.getBaseCookieOptions(configService),
    );
  }

  static clearCustomerAuthCookies(
    response: Response,
    configService: ConfigService,
  ): void {
    this.clearCustomerAccessToken(response, configService);
    this.clearCustomerRefreshToken(response, configService);
  }
}
