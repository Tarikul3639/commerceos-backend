import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { CurrentCustomer } from '../../../../common/decorators/current-customer.decorator';
import { CUSTOMER_REFRESH_TOKEN_COOKIE } from '../../../../common/constants/cookie.constants';
import { CustomerJwtAuthGuard } from '../../../../common/guards/customer-jwt-auth.guard';
import { CookieUtil } from '../../../../common/utils/cookie.util';

// DTOs
import { LoginDto } from '../dto/requests/login.dto';
import { RegisterDto } from '../dto/requests/register.dto';
import { ChangePasswordDto } from '../dto/requests/change-password.dto';
import { ForgotPasswordDto } from '../dto/requests/forgot-password.dto';
import { ResetPasswordDto } from '../dto/requests/reset-password.dto';
import { VerifyEmailDto } from '../dto/requests/verify-email.dto';

// Services
import { CustomerRegisterService } from '../services/register.service';
import { CustomerLoginService } from '../services/login.service';
import { CustomerLogoutService } from '../services/logout.service';
import { CustomerLogoutAllService } from '../services/logout-all.service';
import { CustomerChangePasswordService } from '../services/change-password.service';
import { CustomerForgotPasswordService } from '../services/forgot-password.service';
import { CustomerResetPasswordService } from '../services/reset-password.service';
import { CustomerVerifyEmailService } from '../services/verify-email.service';

@ApiTags('Customer Authentication')
@Controller('auth/customer')
export class CustomerAuthController {
    constructor(
        private readonly configService: ConfigService,

        private readonly registerService: CustomerRegisterService,
        private readonly loginService: CustomerLoginService,

        private readonly logoutService: CustomerLogoutService,
        private readonly logoutAllService: CustomerLogoutAllService,

        private readonly changePasswordService: CustomerChangePasswordService,
        private readonly forgotPasswordService: CustomerForgotPasswordService,
        private readonly resetPasswordService: CustomerResetPasswordService,
        private readonly verifyEmailService: CustomerVerifyEmailService,
    ) { }

    /**
     * Register customer
     */

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        await this.registerService.execute(registerDto);

        return {
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }

    /**
     * Login customer
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

        CookieUtil.setCustomerAccessToken(
            response,
            result.accessToken,
            this.configService,
        );

        CookieUtil.setCustomerRefreshToken(
            response,
            result.refreshToken,
            this.configService,
        );

        return {
            message: 'Login successful',
        };
    }

    /**
     * Logout customer from current device
     */

    @UseGuards(CustomerJwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @CurrentCustomer('id')
        customerId: string,

        @Req() request: Request,

        @Res({ passthrough: true })
        response: Response,
    ): Promise<void> {
        const refreshToken = request.cookies?.[CUSTOMER_REFRESH_TOKEN_COOKIE];

        if (refreshToken) {
            await this.logoutService.execute(customerId, refreshToken);
        }

        CookieUtil.clearCustomerAuthCookies(response, this.configService);
    }

    /**
     * Logout customer from all devices
     */

    @UseGuards(CustomerJwtAuthGuard)
    @Post('logout-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logoutAll(
        @CurrentCustomer('id')
        customerId: string,

        @Res({ passthrough: true })
        response: Response,
    ): Promise<void> {
        await this.logoutAllService.execute(customerId);

        CookieUtil.clearCustomerAuthCookies(response, this.configService);
    }

    /**
     * Change customer password
     */
    @UseGuards(CustomerJwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @CurrentCustomer('id')
        customerId: string,

        @Body()
        dto: ChangePasswordDto,
    ) {
        await this.changePasswordService.execute(customerId, dto);

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
        dto: ForgotPasswordDto,
    ) {
        await this.forgotPasswordService.execute(dto);

        return {
            message:
                'If an account exists with this email, a password reset link has been sent.',
        };
    }

    /**
     * Reset customer password
     */

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body()
        dto: ResetPasswordDto,
    ) {
        await this.resetPasswordService.execute(dto);

        return {
            message: 'Password reset successfully',
        };
    }

    /**
     * Verify customer email
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
    @UseGuards(CustomerJwtAuthGuard)
    @Post('resend-verification-email')
    @HttpCode(HttpStatus.OK)
    async resendVerificationEmail(
        @CurrentCustomer('id')
        customerId: string,
    ) {
        await this.verifyEmailService.execute(customerId);

        return {
            message: 'Verification email sent successfully',
        };
    }
}
