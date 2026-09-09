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

import { LoginService } from '../services/login.service';
import { LogoutService } from '../services/logout.service';
import { LogoutAllService } from '../services/logout-all.service';

@ApiTags('User Authentication')
@Controller('auth/user')
export class UserAuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly loginService: LoginService,
        private readonly logoutService: LogoutService,
        private readonly logoutAllService: LogoutAllService,
    ) { }

    /**
     * Login user
     */

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
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
     * Logout from current device
     */

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @CurrentUser('id') userId: string,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
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
        @CurrentUser('id') userId: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await this.logoutAllService.execute(userId);
        // Clear cookies
        CookieUtil.clearUserAuthCookies(response, this.configService);
    }
}
