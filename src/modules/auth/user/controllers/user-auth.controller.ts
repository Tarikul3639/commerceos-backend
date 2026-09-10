import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

import { USER_REFRESH_TOKEN_COOKIE } from '../../../../common/constants/cookie.constants';

import { CookieUtil } from '../../../../common/utils/cookie.util';

import { LoginDto } from '../dto/requests/login.dto';
import { ForgotPasswordDto } from '../dto/requests/forgot-password.dto';
import { ResetPasswordDto } from '../dto/requests/reset-password.dto';
import { VerifyEmailDto } from '../dto/requests/verify-email.dto';
import { ChangePasswordDto } from '../dto/requests/change-password.dto';

import { LoginService } from '../services/login.service';
import { LogoutService } from '../services/logout.service';
import { LogoutAllService } from '../services/logout-all.service';
import { ChangePasswordService } from '../services/change-password.service';
import { ForgotPasswordService } from '../services/forgot-password.service';
import { ResetPasswordService } from '../services/reset-password.service';
import { VerifyEmailService } from '../services/verify-email.service';

@ApiTags('User Authentication')
@Controller('auth/user')
export class UserAuthController {
    constructor(
        private readonly configService: ConfigService,

        private readonly loginService: LoginService,
        private readonly logoutService: LogoutService,
        private readonly logoutAllService: LogoutAllService,

        private readonly changePasswordService: ChangePasswordService,
        private readonly forgotPasswordService: ForgotPasswordService,
        private readonly resetPasswordService: ResetPasswordService,
        private readonly verifyEmailService: VerifyEmailService,
    ) { }

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
            message: 'Login successful',
        };
    }

    /**
     * Logout from current device
     */
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
        const refreshToken = request.cookies?.[USER_REFRESH_TOKEN_COOKIE];

        if (refreshToken) {
            await this.logoutService.execute(userId, refreshToken);
        }

        CookieUtil.clearUserAuthCookies(response, this.configService);
    }

    /**
     * Logout from all devices
     */
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
    async resendVerificationEmail(
        @CurrentUser('id')
        userId: string,
    ) {
        await this.verifyEmailService.execute(userId);

        return {
            message: 'Verification email sent successfully',
        };
    }
}
