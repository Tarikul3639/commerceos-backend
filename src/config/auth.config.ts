import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

export default registerAs('auth', () => ({
    user: {
        accessSecret: process.env.JWT_USER_ACCESS_SECRET as string,
        accessExpiresIn: process.env.JWT_USER_ACCESS_EXPIRES_IN as StringValue,

        refreshSecret: process.env.JWT_USER_REFRESH_SECRET as string,
        refreshExpiresIn: process.env.JWT_USER_REFRESH_EXPIRES_IN as StringValue,
        rememberRefreshExpiresIn: process.env
            .JWT_USER_REMEMBER_REFRESH_EXPIRES_IN as StringValue,

        passwordResetExpiresIn: process.env
            .JWT_USER_PASSWORD_RESET_EXPIRES_IN as StringValue,

        emailVerificationExpiresIn: process.env
            .JWT_USER_EMAIL_VERIFICATION_EXPIRES_IN as StringValue,
    },

    customer: {
        accessSecret: process.env.JWT_CUSTOMER_ACCESS_SECRET as string,
        accessExpiresIn: process.env.JWT_CUSTOMER_ACCESS_EXPIRES_IN as StringValue,

        refreshSecret: process.env.JWT_CUSTOMER_REFRESH_SECRET as string,
        refreshExpiresIn: process.env
            .JWT_CUSTOMER_REFRESH_EXPIRES_IN as StringValue,

        passwordResetExpiresIn: process.env
            .JWT_CUSTOMER_PASSWORD_RESET_EXPIRES_IN as StringValue,

        emailVerificationExpiresIn: process.env
            .JWT_CUSTOMER_EMAIL_VERIFICATION_EXPIRES_IN as StringValue,
    },
}));
