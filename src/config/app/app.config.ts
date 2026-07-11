import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
    name: process.env.APP_NAME,
    port: Number(process.env.PORT),
    apiPrefix: process.env.API_PREFIX,
    nodeEnv: process.env.NODE_ENV,
}));