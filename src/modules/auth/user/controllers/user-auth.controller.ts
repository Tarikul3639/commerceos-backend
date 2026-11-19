import {
  Body,
  UnauthorizedException,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Req,
  Res,
  Get,
} from '@nestjs/common';

import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../../../common/decorators/current-user.decorator.js';
import { UserJwtAuthGuard } from '../../../../common/guards/user-jwt-auth.guard.js';
import { USER_REFRESH_TOKEN_COOKIE } from '../../../../common/constants/cookie.constants.js';
import { CookieUtil } from '../../../../common/utils/cookie.util.js';

import {
  VerifyEmailDto,
  ResendVerificationEmailDto,
} from '../dto/requests/verify-email.dto.js';
import { LoginDto } from '../dto/requests/login.dto.js';
import { ForgotPasswordDto } from '../dto/requests/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/requests/reset-password.dto.js';
import { ChangePasswordDto } from '../dto/requests/change-password.dto.js';
import { CurrentUserResponseDto } from '../dto/responses/current-user-response.dto.js';

import { LoginService } from '../services/login.service.js';
import { RefreshTokenService } from '../services/refresh-token.service.js';
import { LogoutService } from '../services/logout.service.js';
import { LogoutAllService } from '../services/logout-all.service.js';
import { ChangePasswordService } from '../services/change-password.service.js';
import { ForgotPasswordService } from '../services/forgot-password.service.js';
import { ResetPasswordService } from '../services/reset-password.service.js';
import { VerifyEmailService } from '../services/verify-email.service.js';
import { GetCurrentUserService } from '../services/get-current-user.service.js';

@ApiTags('User Authentication')
@Controller('auth/user')
export class UserAuthController {
  constructor(
    private readonly configService: ConfigService,

    private readonly getCurrentUserService: GetCurrentUserService,

    private readonly loginService: LoginService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logoutService: LogoutService,
    private readonly logoutAllService: LogoutAllService,

    private readonly changePasswordService: ChangePasswordService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly verifyEmailService: VerifyEmailService,
  ) {}

  /**
   * Get current authenticated user
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserJwtAuthGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current authenticated user',
    type: CurrentUserResponseDto,
  })
  async getCurrentUser(
    @CurrentUser('id') userId: string,
  ): Promise<CurrentUserResponseDto> {
    return this.getCurrentUserService.execute(userId);
  }

  /**
   * Login user
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result = await this.loginService.execute(
      loginDto,
      request.ip,
      request.headers['user-agent'],
    );

    CookieUtil.setUserAccessToken(
      response,
      result.accessToken,
      this.configService,
    );

    CookieUtil.setUserRefreshToken(
      response,
      result.refreshToken,
      this.configService,
    );

    return {
      message: 'Login successful',
    };
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const refreshToken = request.cookies?.[USER_REFRESH_TOKEN_COOKIE] as
      string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }

    const result = await this.refreshTokenService.rotate(
      refreshToken,
      request.headers['user-agent'],
      request.ip,
    );

    CookieUtil.setUserAccessToken(
      response,
      result.accessToken,
      this.configService,
    );

    CookieUtil.setUserRefreshToken(
      response,
      result.refreshToken,
      this.configService,
    );

    return {
      message: 'Token refreshed successfully',
    };
  }

  /**
   * Logout from current device
   */
  @UseGuards(UserJwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser('id')
    userId: string,

    @Req()
    request: Request,

    @Res({ passthrough: true })
    response: Response,
  ): Promise<void> {
    const refreshToken = request.cookies?.[USER_REFRESH_TOKEN_COOKIE] as
      string | undefined;

    if (refreshToken) {
      await this.logoutService.execute(userId, refreshToken);
    }

    CookieUtil.clearUserAuthCookies(response, this.configService);
  }

  /**
   * Logout from all devices
   */
  @UseGuards(UserJwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser('id')
    userId: string,

    @Res({ passthrough: true })
    response: Response,
  ): Promise<void> {
    await this.logoutAllService.execute(userId);

    CookieUtil.clearUserAuthCookies(response, this.configService);
  }

  /**
   * Change password
   */
  @UseGuards(UserJwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id')
    userId: string,

    @Body()
    dto: ChangePasswordDto,
  ) {
    await this.changePasswordService.execute(userId, dto);

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Send password reset email
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body()
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    await this.forgotPasswordService.execute(forgotPasswordDto.email);

    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  /**
   * Reset password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto,
  ) {
    await this.resetPasswordService.execute(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Verify email address
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body()
    verifyEmailDto: VerifyEmailDto,
  ) {
    await this.verifyEmailService.verify(verifyEmailDto.token);

    return {
      message: 'Email verified successfully',
    };
  }

  /**
   * Resend verification email
   */
  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto) {
    await this.verifyEmailService.sendVerificationEmailByEmail(dto.email);

    return {
      message:
        'If an account exists with this email, a verification email has been sent.',
    };
  }
}
