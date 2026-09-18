import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    user: {
        accessSecret: process.env.JWT_USER_ACCESS_SECRET,
        accessExpiresIn: process.env.JWT_USER_ACCESS_EXPIRES_IN,

        refreshSecret: process.env.JWT_USER_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_USER_REFRESH_EXPIRES_IN,
        rememberRefreshExpiresIn: process.env.JWT_USER_REMEMBER_REFRESH_EXPIRES_IN,

        passwordResetExpiresIn: process.env.JWT_USER_PASSWORD_RESET_EXPIRES_IN,
        
        emailVerificationExpiresIn:
            process.env.JWT_USER_EMAIL_VERIFICATION_EXPIRES_IN,
    },

    customer: {
        accessSecret: process.env.JWT_CUSTOMER_ACCESS_SECRET,
        accessExpiresIn: process.env.JWT_CUSTOMER_ACCESS_EXPIRES_IN,

        refreshSecret: process.env.JWT_CUSTOMER_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_CUSTOMER_REFRESH_EXPIRES_IN,

        passwordResetExpiresIn: process.env.JWT_CUSTOMER_PASSWORD_RESET_EXPIRES_IN,

        emailVerificationExpiresIn:
            process.env.JWT_CUSTOMER_EMAIL_VERIFICATION_EXPIRES_IN,
    },
}));
